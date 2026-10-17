const { query, withTransaction } = require('../config/db');
const ApiError = require('../utils/apiError');
const rules = require('../services/reservationRules');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS restaurant_reservation_settings (
  restaurant_id UUID PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  capacity INTEGER NOT NULL DEFAULT 20 CHECK(capacity BETWEEN 1 AND 200),
  max_party_size INTEGER NOT NULL DEFAULT 10 CHECK(max_party_size BETWEEN 1 AND 20 AND max_party_size<=capacity),
  duration_minutes INTEGER NOT NULL DEFAULT 90 CHECK(duration_minutes IN(60,90,120)),
  min_notice_minutes INTEGER NOT NULL DEFAULT 60 CHECK(min_notice_minutes BETWEEN 0 AND 4320),
  advance_days INTEGER NOT NULL DEFAULT 90 CHECK(advance_days BETWEEN 1 AND 90),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS restaurant_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_key UUID NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL CHECK(ends_at>starts_at),
  party_size INTEGER NOT NULL CHECK(party_size BETWEEN 1 AND 20),
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  owner_note VARCHAR(500) NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','confirmed','rejected','cancelled','completed','no_show')),
  status_changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id,request_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS restaurant_reservations_active_request ON restaurant_reservations(restaurant_id,customer_id,starts_at) WHERE status IN('pending','confirmed');
CREATE INDEX IF NOT EXISTS restaurant_reservations_schedule ON restaurant_reservations(restaurant_id,starts_at,ends_at) WHERE status='confirmed';
CREATE INDEX IF NOT EXISTS restaurant_reservations_customer ON restaurant_reservations(customer_id,starts_at);`;
let ready;
function ensureSchema() {
  if (!ready) ready = withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('cordova_reservations_v1'))");
    await client.query(SCHEMA_SQL);
  }).catch((err) => { ready = null; throw err; });
  return ready;
}

const canManage = (actor,p) => actor.role==='admin' || p.owner_id===actor.id;
const bookable = (p) => p.enabled && p.restaurant_status==='verified' && p.restaurant_active && p.owner_active;
const publicSettings = (p) => ({ enabled:bookable(p), configuredEnabled:p.enabled, capacity:p.capacity, maxPartySize:p.max_party_size,
  durationMinutes:p.duration_minutes, minNoticeMinutes:p.min_notice_minutes, advanceDays:p.advance_days });

async function policy(client, restaurantId, lock=false) {
  const restaurant = await client.query(`SELECT id FROM restaurants WHERE id=$1 ${lock?'FOR UPDATE':''}`,[restaurantId]);
  if (!restaurant.rows.length) throw ApiError.notFound('Restaurant not found');
  await client.query('INSERT INTO restaurant_reservation_settings(restaurant_id) VALUES($1) ON CONFLICT DO NOTHING',[restaurantId]);
  const { rows } = await client.query(`SELECT s.*,r.owner_id,r.status AS restaurant_status,r.is_active AS restaurant_active,
    u.is_active AS owner_active,clock_timestamp() AS server_time FROM restaurant_reservation_settings s
    JOIN restaurants r ON r.id=s.restaurant_id LEFT JOIN users u ON u.id=r.owner_id
    WHERE s.restaurant_id=$1 ${lock?'FOR UPDATE OF s':''}`,[restaurantId]);
  return rows[0];
}
const hoursFor = async (client,id) => (await client.query('SELECT day_of_week,open_time::text,close_time::text,is_closed FROM operating_hours WHERE restaurant_id=$1',[id])).rows;
const overlaps = async (client,id,start,end,exclude=null) => (await client.query(`SELECT starts_at,ends_at,party_size FROM restaurant_reservations
  WHERE restaurant_id=$1 AND status='confirmed' AND starts_at<$3 AND ends_at>$2 AND ($4::uuid IS NULL OR id<>$4::uuid)`,[id,new Date(start),new Date(end),exclude])).rows;

async function options(restaurantId,date,partySize=1) {
  await ensureSchema();
  const p = await policy({query},restaurantId);
  const settings = publicSettings(p);
  if (!date) return {settings,slots:[]};
  const midnight = rules.dateStart(date), now=new Date(p.server_time).getTime();
  if (midnight<rules.dateStart(rules.localDate(now)) || midnight>rules.dateStart(rules.localDate(now))+p.advance_days*rules.DAY) throw ApiError.badRequest('Choose a date within the next 90 days.');
  if (!Number.isInteger(partySize) || partySize<1 || partySize>p.max_party_size) throw ApiError.badRequest(`Choose a party size between 1 and ${p.max_party_size}.`);
  if (!bookable(p)) return {settings,slots:[],message:'This restaurant is not accepting online reservation requests.'};
  const hours=await hoursFor({query},restaurantId);
  const bookings=await overlaps({query},restaurantId,midnight,midnight+rules.DAY+p.duration_minutes*60000);
  const slots=[];
  for (let start=midnight;start<midnight+rules.DAY;start+=rules.HALF_HOUR) {
    const end=start+p.duration_minutes*60000;
    if (start<now+p.min_notice_minutes*60000 || !rules.fitsHours(hours,start,end)) continue;
    const availableSeats=rules.seatsAvailable(bookings,start,end,p.capacity);
    if (availableSeats>=partySize) slots.push({startsAt:new Date(start).toISOString(),endsAt:new Date(end).toISOString(),availableSeats});
  }
  return {settings,slots,message:slots.length?null:'No times are available for this party size and date. Choose another date or contact the restaurant.'};
}

async function getSettings(restaurantId,actor) {
  await ensureSchema();
  const p=await policy({query},restaurantId);
  if (!canManage(actor,p)) throw ApiError.forbidden('You do not manage this restaurant');
  const hours=await hoursFor({query},restaurantId);
  return {...publicSettings(p),hasHours:hours.some((h)=>!h.is_closed && h.open_time && h.close_time)};
}

async function saveSettings(restaurantId,actor,body) {
  rules.validatePolicy(body);
  await ensureSchema();
  return withTransaction(async (client) => {
    const p=await policy(client,restaurantId,true);
    if (!canManage(actor,p)) throw ApiError.forbidden('You do not manage this restaurant');
    const hours=await hoursFor(client,restaurantId);
    if (body.enabled && !hours.some((h)=>!h.is_closed && h.open_time && h.close_time)) throw ApiError.badRequest('Publish your business hours before enabling reservations.');
    const peak=await client.query(`SELECT COALESCE(max(occupied),0)::int AS peak FROM (
      SELECT sum(party_size) OVER(ORDER BY at,delta ROWS UNBOUNDED PRECEDING) AS occupied FROM (
        SELECT starts_at AS at,party_size,1 AS delta FROM restaurant_reservations WHERE restaurant_id=$1 AND status='confirmed' AND ends_at>now()
        UNION ALL SELECT ends_at AS at,-party_size,-1 AS delta FROM restaurant_reservations WHERE restaurant_id=$1 AND status='confirmed' AND ends_at>now()
      ) changes) occupied`,[restaurantId]);
    if (body.capacity<peak.rows[0].peak) throw ApiError.conflict('Capacity cannot be lower than your existing confirmed bookings.');
    await client.query(`UPDATE restaurant_reservation_settings SET enabled=$2,capacity=$3,max_party_size=$4,duration_minutes=$5,min_notice_minutes=$6,updated_at=now() WHERE restaurant_id=$1`,
      [restaurantId,body.enabled,body.capacity,body.maxPartySize,body.durationMinutes,body.minNoticeMinutes]);
    return {saved:true};
  });
}

async function create(restaurantId,actor,body) {
  await ensureSchema();
  try {
    return await withTransaction(async (client) => {
      const p=await policy(client,restaurantId,true);
      if (p.owner_id===actor.id || actor.role==='admin') throw ApiError.forbidden('Use a customer account to reserve at a business you do not manage.');
      if (!rules.UUID.test(body.requestKey||'')) throw ApiError.badRequest('A valid request key is required. Please reload the form.');
      const existing=await client.query('SELECT * FROM restaurant_reservations WHERE customer_id=$1 AND request_key=$2',[actor.id,body.requestKey]);
      if (existing.rows[0]) {
        const r=existing.rows[0];
        if (r.restaurant_id!==restaurantId || new Date(r.starts_at).toISOString()!==body.startsAt || r.party_size!==body.partySize
          || r.contact_name!==(typeof body.contactName==='string'?body.contactName.trim():'')
          || r.contact_phone!==(typeof body.contactPhone==='string'?body.contactPhone.trim():'')
          || r.notes!==(typeof body.notes==='string'?body.notes.trim():'')) throw ApiError.conflict('This request key was already used for a different reservation.');
        return {reservation:r,created:false};
      }
      const v=rules.validateBooking(body,p,new Date(p.server_time).getTime());
      if (!bookable(p)) throw ApiError.conflict('This restaurant is not accepting online reservations.');
      if (!rules.fitsHours(await hoursFor(client,restaurantId),v.starts,v.ends)) throw ApiError.badRequest('The entire reservation must fit within published business hours.');
      if (rules.seatsAvailable(await overlaps(client,restaurantId,v.starts,v.ends),v.starts,v.ends,p.capacity)<body.partySize) throw ApiError.conflict('This time is fully booked for your party. Choose another time.');
      const {rows}=await client.query(`INSERT INTO restaurant_reservations(request_key,restaurant_id,customer_id,starts_at,ends_at,party_size,contact_name,contact_phone,notes)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[body.requestKey,restaurantId,actor.id,new Date(v.starts),new Date(v.ends),body.partySize,v.name,v.phone,v.notes]);
      return {reservation:rows[0],created:true};
    });
  } catch(err) {
    if (err.code==='23505') throw ApiError.conflict('You already have a pending or confirmed reservation at this time. Check My reservations.');
    throw err;
  }
}

async function list({actor,restaurantId,page=1,status,scope='all'}) {
  await ensureSchema();
  if (restaurantId) {
    const p=await policy({query},restaurantId);
    if (!canManage(actor,p)) throw ApiError.forbidden('You do not manage this restaurant');
  }
  const params=[restaurantId||actor.id];
  const where=restaurantId?'b.restaurant_id=$1':'b.customer_id=$1';
  if (status) params.push(status);
  const filter=where+(status?' AND b.status=$2':'')+(scope==='upcoming'?' AND b.ends_at>now()':scope==='past'?' AND b.ends_at<=now()':'');
  const count=await query(`SELECT count(*)::int AS total FROM restaurant_reservations b WHERE ${filter}`,params);
  const {rows}=await query(`SELECT b.*,r.name AS restaurant_name,r.slug AS restaurant_slug,r.address AS restaurant_address FROM restaurant_reservations b JOIN restaurants r ON r.id=b.restaurant_id
    WHERE ${filter} ORDER BY b.starts_at ${scope==='upcoming'?'ASC':'DESC'},b.id DESC LIMIT 20 OFFSET $${params.length+1}`,[...params,(page-1)*20]);
  return {rows,total:count.rows[0].total,page,pageSize:20};
}

async function changeStatus(id,actor,body) {
  const allowed=['confirmed','rejected','cancelled','completed','no_show'];
  if (!allowed.includes(body.status) || (body.ownerNote!==undefined && (typeof body.ownerNote!=='string' || body.ownerNote.length>500))) throw ApiError.badRequest('Choose a valid reservation status and a note of 500 characters or fewer.');
  await ensureSchema();
  return withTransaction(async (client) => {
    const lookup=await client.query('SELECT restaurant_id FROM restaurant_reservations WHERE id=$1',[id]);
    if (!lookup.rows[0]) throw ApiError.notFound('Reservation not found');
    const p=await policy(client,lookup.rows[0].restaurant_id,true);
    const {rows}=await client.query('SELECT * FROM restaurant_reservations WHERE id=$1 FOR UPDATE',[id]);
    const r=rows[0];
    if (!r) throw ApiError.notFound('Reservation not found');
    const manage=canManage(actor,p),now=new Date(p.server_time).getTime();
    if (!manage && r.customer_id!==actor.id) throw ApiError.forbidden('You cannot change this reservation');
    if (!manage && body.status!=='cancelled') throw ApiError.forbidden('Only the restaurant can confirm or manage a reservation');
    if (r.status===body.status) return r;
    const transitions={pending:['confirmed','rejected','cancelled'],confirmed:['cancelled','completed','no_show']};
    if (!(transitions[r.status]||[]).includes(body.status)) throw ApiError.conflict('This reservation status can no longer be changed that way. Refresh the list.');
    const starts=new Date(r.starts_at).getTime(),ends=new Date(r.ends_at).getTime();
    if (!manage && starts<=now) throw ApiError.conflict('This reservation has already started. Contact the restaurant.');
    if (body.status==='confirmed') {
      if (starts<=now || r.party_size>p.max_party_size || p.restaurant_status!=='verified' || !p.restaurant_active || !p.owner_active) throw ApiError.conflict('This request can no longer be confirmed.');
      if (!rules.fitsHours(await hoursFor(client,r.restaurant_id),starts,ends)) throw ApiError.conflict('The requested time no longer fits your published hours.');
      if (rules.seatsAvailable(await overlaps(client,r.restaurant_id,starts,ends,id),starts,ends,p.capacity)<r.party_size) throw ApiError.conflict('Confirming this request would exceed your booking capacity.');
    }
    if (body.status==='completed' && now<ends) throw ApiError.conflict('A reservation can be completed only after its booked end time.');
    if (body.status==='no_show' && now<starts) throw ApiError.conflict('A no-show can be recorded only after the booked start time.');
    const updated=await client.query(`UPDATE restaurant_reservations SET status=$2,owner_note=CASE WHEN $3 THEN $4 ELSE owner_note END,status_changed_by=$5,updated_at=now() WHERE id=$1 RETURNING *`,
      [id,body.status,manage,body.ownerNote===undefined?r.owner_note:body.ownerNote.trim(),actor.id]);
    return updated.rows[0];
  });
}

module.exports={ensureSchema,options,getSettings,saveSettings,create,list,changeStatus,SCHEMA_SQL};
