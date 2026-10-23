const {Client,Pool}=require('pg');
const {randomUUID}=require('node:crypto');
const express=require('express');
const request=require('supertest');
jest.mock('../../src/config/db',()=>({query:jest.fn(),withTransaction:jest.fn()}));
const db=require('../../src/config/db');
const env=require('../../src/config/env');
const {signAccessToken}=require('../../src/utils/jwt');
const rules=require('../../src/services/reservationRules');
const reservationModel=require('../../src/models/reservation.model');
const router=require('../../src/routes/reservations.routes');
const app=express();app.use(express.json());app.use('/api',router);
app.use((err,req,res,next)=>res.status(err.statusCode||500).json({success:false,message:err.message}));
const ids={owner:randomUUID(),otherOwner:randomUUID(),customer:randomUUID(),otherCustomer:randomUUID(),admin:randomUUID(),restaurant:randomUUID(),otherRestaurant:randomUUID()};
const schema=`reservation_test_${randomUUID().replaceAll('-','')}`;
const tokens={};
const day=rules.localDate(Date.now()+2*rules.DAY);
const time=(clock)=>new Date(`${day}T${clock}:00+08:00`).toISOString();
const endpoint=`/api/restaurants/${ids.restaurant}/reservations`;
const settings={enabled:true,capacity:4,maxPartySize:4,durationMinutes:90,minNoticeMinutes:60};
const payload=(clock='12:00',size=3)=>({requestKey:randomUUID(),startsAt:time(clock),partySize:size,contactName:'Test Diner',contactPhone:'09171234567',notes:'Near the entrance, if available.'});
const auth=(method,url,actor='customer')=>request(app)[method](url).set('Authorization',`Bearer ${tokens[actor]}`);
let control,pool,first,second;

beforeAll(async()=>{
  if(!['localhost','127.0.0.1'].includes(new URL(env.db.url).hostname))throw Error('Reservation database tests are local-only.');
  control=new Client({connectionString:env.db.url});await control.connect();await control.query(`CREATE SCHEMA ${schema}`);
  pool=new Pool({connectionString:env.db.url,options:`-c search_path=${schema},public`,max:6});
  await pool.query(`CREATE TABLE users(id uuid primary key,role text,is_active boolean default true,email_verified boolean default true,email text,full_name text);
    CREATE TABLE restaurants(id uuid primary key,owner_id uuid,name text,slug text,address text,status text default 'verified',is_active boolean default true);
    CREATE TABLE operating_hours(restaurant_id uuid,day_of_week int,open_time time,close_time time,is_closed boolean);`);
  for(const [name,role] of [['owner','owner'],['otherOwner','owner'],['customer','customer'],['otherCustomer','customer'],['admin','admin']]){
    const user={id:ids[name],role,email:`${name}@reservation-test.invalid`};
    await pool.query('INSERT INTO users(id,role,email,full_name) VALUES($1,$2,$3,$4)',[user.id,user.role,user.email,name]);
    tokens[name]=signAccessToken(user);
  }
  await pool.query("INSERT INTO restaurants(id,owner_id,name,slug,address) VALUES($1,$2,'Test Restaurant','test-restaurant','Cordova'),($3,$4,'Other Restaurant','other-restaurant','Cordova')",[ids.restaurant,ids.owner,ids.otherRestaurant,ids.otherOwner]);
  for(const rid of [ids.restaurant,ids.otherRestaurant])for(let day=0;day<7;day++)await pool.query("INSERT INTO operating_hours VALUES($1,$2,'09:00','22:00',false)",[rid,day]);
  db.query.mockImplementation((sql,args)=>pool.query(sql,args));
  db.withTransaction.mockImplementation(async(callback)=>{
    const client=await pool.connect();
    try{await client.query('BEGIN');const output=await callback(client);await client.query('COMMIT');return output;}
    catch(err){await client.query('ROLLBACK');throw err;}
    finally{client.release();}
  });
},20000);
afterAll(async()=>{if(pool)await pool.end();if(control){await control.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);await control.end();}});

test('bookings default to enabled; guests cannot book and only owners can change settings',async()=>{
  expect((await request(app).post(endpoint).send(payload())).status).toBe(401);
  const initial=await request(app).get(`${endpoint}/options?date=${day}`);
  expect(initial.status).toBe(200);expect(initial.body.data.settings.enabled).toBe(true);
  expect((await auth('patch',`${endpoint}/settings`,'otherOwner').send(settings)).status).toBe(403);
  expect((await auth('patch',`${endpoint}/settings`,'owner').send(settings)).status).toBe(200);
  const options=await request(app).get(`${endpoint}/options?date=${day}&partySize=3`);
  expect(options.status).toBe(200);
  expect(options.body.data.slots.some((s)=>s.startsAt===time('12:00'))).toBe(true);
  expect(JSON.stringify(options.body)).not.toMatch(/contact_phone|customer_id|owner_id/);
});

test('customer request is persisted, returned in both inboxes, and retrying creates no duplicate',async()=>{
  const body=payload();
  const created=await auth('post',endpoint).send(body);
  expect(created.status).toBe(201);first=created.body.data.reservation;
  expect(first).toMatchObject({status:'pending',customer_id:ids.customer,party_size:3});
  const retry=await auth('post',endpoint).send(body);
  expect(retry.status).toBe(200);expect(retry.body.data.reservation.id).toBe(first.id);
  expect((await auth('post',endpoint).send({...body,partySize:2})).status).toBe(409);
  expect((await auth('post',endpoint).send(payload())).status).toBe(409);
  const mine=await auth('get','/api/reservations/mine');
  const inbox=await auth('get',endpoint,'owner');
  expect(mine.body.data.rows.map((r)=>r.id)).toContain(first.id);
  expect(inbox.body.data.rows.map((r)=>r.id)).toContain(first.id);
  expect((await auth('get',endpoint,'otherOwner')).status).toBe(403);
  expect((await auth('get','/api/reservations/mine','otherCustomer')).body.data.rows).toEqual([]);
});

test('new requests notify only their owner once and unread state persists until opened',async()=>{
  const path='/api/reservations/notifications';
  expect((await request(app).get(path)).status).toBe(401);
  expect((await auth('get',path,'customer')).status).toBe(403);
  const notices=await auth('get',path,'owner');
  expect(notices.body.data.unreadCount).toBe(1);
  expect(notices.body.data.notifications[0]).toMatchObject({reservation_id:first.id,restaurant_id:ids.restaurant,party_size:3});
  expect((await auth('get',path,'owner')).body.data.unreadCount).toBe(1);
  expect((await auth('get',path,'otherOwner')).body.data.unreadCount).toBe(0);
  expect((await auth('patch',`${path}/${first.id}/read`,'otherOwner').send({})).status).toBe(404);
  expect((await auth('patch',`${path}/${first.id}/read`,'owner').send({})).status).toBe(200);
  expect((await auth('get',path,'owner')).body.data.unreadCount).toBe(0);
});

test('only owner can confirm; capacity is rechecked; customer can see and cancel the confirmed booking',async()=>{
  const other=await auth('post',endpoint,'otherCustomer').send(payload());second=other.body.data.reservation;
  expect(other.status).toBe(201);
  const statusUrl=(id)=>`/api/reservations/${id}/status`;
  expect((await auth('patch',statusUrl(first.id)).send({status:'confirmed'})).status).toBe(403);
  expect((await auth('patch',statusUrl(first.id),'otherCustomer').send({status:'cancelled'})).status).toBe(403);
  expect((await auth('patch',statusUrl(first.id),'owner').send({status:'confirmed',ownerNote:'Your table is reserved.'})).status).toBe(200);
  expect((await auth('patch',statusUrl(second.id),'owner').send({status:'confirmed'})).status).toBe(409);
  const blocked=await request(app).get(`${endpoint}/options?date=${day}&partySize=2`);
  expect(blocked.body.data.slots.some((s)=>s.startsAt===time('12:00'))).toBe(false);
  expect((await auth('get','/api/reservations/mine')).body.data.rows[0]).toMatchObject({status:'confirmed',owner_note:'Your table is reserved.'});
  expect((await auth('patch',statusUrl(first.id)).send({status:'cancelled',ownerNote:'Not permitted to replace owner note'})).status).toBe(200);
  const cancelled=(await auth('get','/api/reservations/mine')).body.data.rows[0];
  expect(cancelled).toMatchObject({status:'cancelled',owner_note:'Your table is reserved.'});
  expect((await auth('patch',statusUrl(first.id),'owner').send({status:'confirmed'})).status).toBe(409);
  expect((await auth('patch',statusUrl(second.id),'owner').send({status:'confirmed'})).status).toBe(200);
});

test('concurrent owner confirmations cannot overbook the last seats',async()=>{
  const a=await auth('post',endpoint).send(payload('15:00'));
  const b=await auth('post',endpoint,'otherCustomer').send(payload('15:00'));
  expect(a.status).toBe(201);expect(b.status).toBe(201);
  const results=await Promise.all([a,b].map((r)=>auth('patch',`/api/reservations/${r.body.data.reservation.id}/status`,'owner').send({status:'confirmed'})));
  expect(results.map((r)=>r.status).sort()).toEqual([200,409]);
  const seats=await pool.query("SELECT sum(party_size)::int AS total FROM restaurant_reservations WHERE starts_at=$1 AND status='confirmed'",[time('15:00')]);
  expect(seats.rows[0].total).toBe(3);
  expect((await auth('patch',`${endpoint}/settings`,'owner').send({...settings,capacity:2,maxPartySize:2})).status).toBe(409);
});

test('invalid/past/closed-hour requests, invalid IDs and premature completion are rejected',async()=>{
  expect((await auth('post',endpoint).send(payload('22:00'))).status).toBe(400);
  expect((await auth('post',endpoint).send(payload('12:15'))).status).toBe(400);
  expect((await auth('post',endpoint).send({...payload(),startsAt:new Date(Date.now()-rules.DAY).toISOString()})).status).toBe(400);
  expect((await auth('post',endpoint).send({...payload(),partySize:100})).status).toBe(400);
  expect((await auth('post',endpoint,'owner').send(payload('18:00'))).status).toBe(403);
  expect((await request(app).get(`${endpoint}/options?date=2026-02-30`)).status).toBe(400);
  expect((await request(app).get('/api/restaurants/not-an-id/reservations/options')).status).toBe(400);
  expect((await auth('patch',`/api/reservations/${second.id}/status`,'owner').send({status:'completed'})).status).toBe(409);
  expect((await auth('patch',`/api/reservations/${second.id}/status`,'owner').send({status:'no_show'})).status).toBe(409);
});

test('disabling stops new requests while preserving the existing bookings',async()=>{
  expect((await auth('patch',`${endpoint}/settings`,'owner').send({...settings,enabled:false})).status).toBe(200);
  expect((await auth('post',endpoint).send(payload('18:00'))).status).toBe(409);
  expect((await auth('get','/api/reservations/mine','otherCustomer')).body.data.rows.some((r)=>r.id===second.id&&r.status==='confirmed')).toBe(true);
});

test('interval capacity and overnight hours handle boundaries rather than summing disjoint bookings',()=>{
  const start=Date.parse(time('12:00'));
  const bookings=[{starts_at:new Date(start),ends_at:new Date(start+rules.HALF_HOUR),party_size:3},{starts_at:new Date(start+rules.HALF_HOUR),ends_at:new Date(start+2*rules.HALF_HOUR),party_size:3}];
  expect(rules.seatsAvailable(bookings,start,start+2*rules.HALF_HOUR,5)).toBe(2);
  const weekday=new Date(rules.dateStart(day)+8*3600000).getUTCDay();
  const overnight=[{day_of_week:weekday,open_time:'20:00:00',close_time:'02:00:00',is_closed:false}];
  expect(rules.fitsHours(overnight,Date.parse(time('23:30')),Date.parse(time('23:30'))+3600000)).toBe(true);
  expect(rules.fitsHours(overnight,Date.parse(time('23:30')),Date.parse(time('23:30'))+3*3600000)).toBe(false);
});
