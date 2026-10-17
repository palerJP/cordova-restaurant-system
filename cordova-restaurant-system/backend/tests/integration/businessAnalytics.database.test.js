// Runs real PostgreSQL queries inside a rolled-back, isolated local schema.
const { Client } = require('pg');
const { randomUUID } = require('node:crypto');
jest.mock('../../src/config/db', () => ({ query: jest.fn(), withTransaction: jest.fn() }));
const db = require('../../src/config/db');
const env = require('../../src/config/env');
const analytics = require('../../src/models/businessAnalytics.model');
const owner = randomUUID(), customer = randomUUID(), admin = randomUUID();
const demo = '33333333-3333-3333-a333-333333333331';
const r1 = randomUUID(), r2 = randomUUID();
let client;

beforeAll(async () => {
  if (!['localhost', '127.0.0.1'].includes(new URL(env.db.url).hostname)) throw new Error('This test only runs against a local database.');
  client = new Client({ connectionString: env.db.url });
  await client.connect();
  await client.query('BEGIN');
  const schema = `analytics_test_${randomUUID().replaceAll('-', '')}`;
  await client.query(`CREATE SCHEMA ${schema}; SET LOCAL search_path TO ${schema}, public;
    CREATE TABLE users(id uuid primary key, role text, is_active boolean default true, created_at timestamptz default now());
    CREATE TYPE analytics_subscription_tier AS ENUM ('none','basic','premium');
    CREATE TABLE restaurants(id uuid primary key, owner_id uuid, status text default 'verified', subscription_tier analytics_subscription_tier default 'none', subscription_expires_at timestamptz);
    CREATE TABLE favorites(user_id uuid, restaurant_id uuid);
    CREATE TABLE reviews(restaurant_id uuid, user_id uuid, rating int, status text);
    CREATE TABLE subscription_transactions(restaurant_id uuid, tier varchar(20), status text, verified_at timestamptz, verified_by uuid, expires_at timestamptz);
    CREATE TABLE promotions(restaurant_id uuid, title text, description text, status text, start_date date, end_date date);
    CREATE TABLE cuisines(name text);
    CREATE TABLE recommendation_logs(id uuid);`);
  await client.query("INSERT INTO users(id,role) VALUES($1,'owner'),($2,'customer'),($3,'admin'),($4,'customer')", [owner,customer,admin,demo]);
  await client.query('INSERT INTO restaurants(id,owner_id) VALUES($1,$3),($2,$3)', [r1,r2,owner]);
  await client.query('INSERT INTO favorites VALUES($1,$3),($2,$3)',[customer,demo,r1]);
  await client.query("INSERT INTO reviews VALUES($1,$2,4,'visible'),($1,$3,5,'visible')",[r1,customer,demo]);
  await client.query("INSERT INTO cuisines VALUES('Seafood')");
  db.query.mockImplementation((sql, params) => client.query(sql, params));
  db.withTransaction.mockImplementation((callback) => callback(client));
});
afterAll(async () => { if (client) { await client.query('ROLLBACK'); await client.end(); } });

test('empty activity is genuinely zero and known demo review/favorite records are excluded', async () => {
  const stats = await analytics.ownerStats(r1,30);
  expect(stats.totalViews).toBe(0);
  expect(stats.timesRecommended).toBe(0);
  expect(stats.favorites).toBe(1);
  expect(stats.visibleReviews).toBe(1);
  expect(stats.averageRating).toBe(4);
  expect(stats.dailyViews).toHaveLength(30);
});

test('counts committed events once, preserves rank, and excludes owners, admins and demo actors', async () => {
  const eventId = randomUUID();
  const event = { restaurantIds:[r1,r2], userId:customer, kind:'recommendation', source:'recommendation', eventId, metadata:{cuisines:['Seafood']} };
  await analytics.record(event); await analytics.record(event);
  for (const userId of [owner,admin,demo]) await analytics.record({...event,eventId:randomUUID(),userId});
  await analytics.record({restaurantIds:[r1],userId:customer,kind:'view',source:'recommendation'});
  await analytics.record({restaurantIds:[r1],kind:'view',source:'browse'});
  await analytics.record({restaurantIds:[r1],userId:owner,kind:'view',source:'browse'});
  const first = await analytics.ownerStats(r1,30), second = await analytics.ownerStats(r2,30);
  expect(first).toMatchObject({totalViews:2,viewsFromRecommendation:1,timesRecommended:1,timesTopResult:1});
  expect(second).toMatchObject({totalViews:0,timesRecommended:1,timesTopResult:0});
  expect(first.dailyViews.reduce((n,row)=>n+row.views,0)).toBe(first.totalViews);
  const overview = await analytics.adminStats();
  expect(overview.users.customers).toBe(1);
  expect(overview.topCuisineDemand).toEqual([{name:'Seafood',search_count:1}]);
  expect(overview.peakSearchHours.reduce((n,row)=>n+row.searches,0)).toBe(1);
});

test('old events and deleted customer history cannot change the current activity totals', async () => {
  const eventId = randomUUID();
  await analytics.record({eventId,restaurantIds:[r1],kind:'view',source:'browse'});
  await client.query("UPDATE business_analytics_events SET created_at=now()-interval '40 days' WHERE event_id=$1",[eventId]);
  await client.query('DELETE FROM recommendation_logs');
  expect((await analytics.ownerStats(r1,30)).totalViews).toBe(2);
});

test('a sample tier or pending payment is not a verified paid subscription', async () => {
  await client.query("UPDATE restaurants SET subscription_tier='premium',subscription_expires_at=now()+interval '30 days'");
  await client.query("INSERT INTO subscription_transactions VALUES($1,'premium','pending_verification',NULL,NULL,NULL)",[r1]);
  expect((await analytics.ownerStats(r1,30)).activePaidSubscription).toBe(false);
  expect((await analytics.adminStats()).subscriptions.activePaidBusinesses).toBe(0);
  await client.query("INSERT INTO subscription_transactions VALUES($1,'premium','verified',now(),$2,now()+interval '30 days')",[r1,admin]);
  expect(await analytics.ownerStats(r1,30)).toMatchObject({activePaidSubscription:true,verifiedPayments:1});
  expect((await analytics.adminStats()).subscriptions.activePaidBusinesses).toBe(1);
});

test('database failures propagate instead of returning fabricated zeros', async () => {
  db.query.mockRejectedValueOnce(new Error('database offline'));
  await expect(analytics.ownerStats(r1,30)).rejects.toThrow('database offline');
});

test('promotion totals exclude the exact demo fixture and use Philippine calendar dates', async () => {
  await client.query(`INSERT INTO promotions VALUES
    ('44444444-4444-4444-a444-444444444441','Weekend Seafood Feast','Get a free side dish with any order above ₱500 on weekends.','active',CURRENT_DATE,CURRENT_DATE+30),
    ('44444444-4444-4444-a444-444444444441','Weekend Seafood Feast',NULL,'active',
      (now() AT TIME ZONE 'Asia/Manila')::date,(now() AT TIME ZONE 'Asia/Manila')::date+1)`);
  expect((await analytics.adminStats()).promotions).toMatchObject({active:1,total:1,expired:0});
});
