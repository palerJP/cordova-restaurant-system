const { query, withTransaction } = require('../config/db');
const { randomUUID } = require('node:crypto');

// New, append-only records. Historic search/demo logs are deliberately not backfilled.
// Provision only these additive tables; do not run unrelated pending migrations.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS business_analytics_tracking (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO business_analytics_tracking(singleton) VALUES (TRUE) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS business_analytics_demo_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO business_analytics_demo_users(user_id)
  SELECT id FROM users WHERE id::text LIKE '20000000-0000-0000-0000-%'
    OR id::text IN ('11111111-1111-1111-a111-111111111111', '11111111-1111-1111-a111-111111111112',
      '33333333-3333-3333-a333-333333333331', '33333333-3333-3333-a333-333333333332')
  ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS business_analytics_events (
  event_id UUID NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('view', 'recommendation')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('browse', 'recommendation', 'search')),
  position INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(event_id, restaurant_id, kind)
);
CREATE INDEX IF NOT EXISTS business_analytics_events_restaurant_time ON business_analytics_events(restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS business_analytics_events_time ON business_analytics_events(created_at);`;
let ready;
function ensureSchema() {
  if (!ready) ready = withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('cordova_business_analytics_v2'))");
    await client.query(SCHEMA_SQL);
  }).catch((err) => { ready = null; throw err; });
  return ready;
}

async function record({ restaurantIds, userId, kind, source, metadata = {}, eventId = randomUUID() }) {
  await ensureSchema();
  // An event id makes repeated writes idempotent. Owners/admins cannot inflate their own metrics.
  await query(`INSERT INTO business_analytics_events(event_id, restaurant_id, kind, user_id, source, position, metadata)
    SELECT $1, r.id, $3, $4, $5, ids.position, $6::jsonb
    FROM unnest($2::uuid[]) WITH ORDINALITY AS ids(id, position)
    JOIN restaurants r ON r.id = ids.id
    LEFT JOIN users actor ON actor.id = $4::uuid
    WHERE ($4::uuid IS NULL OR (r.owner_id IS DISTINCT FROM $4::uuid AND actor.role <> 'admin'))
      AND NOT EXISTS(SELECT 1 FROM business_analytics_demo_users demo WHERE demo.user_id=$4::uuid)
    ON CONFLICT DO NOTHING`,
  [eventId, [...new Set(restaurantIds)], kind, userId || null, source, JSON.stringify(metadata)]);
}

async function ownerStats(restaurantId, days) {
  await ensureSchema();
  const { rows } = await query(`WITH bounds AS (
    SELECT now() AS as_of,
      (date_trunc('day', now() AT TIME ZONE 'Asia/Manila') - ($2::int - 1) * interval '1 day') AT TIME ZONE 'Asia/Manila' AS start_at
  ), events AS (
    SELECT e.* FROM business_analytics_events e, bounds b
    WHERE e.restaurant_id=$1 AND e.created_at >= b.start_at AND e.created_at <= b.as_of
  ) SELECT jsonb_build_object(
    'schemaVersion', 2, 'asOf', b.as_of, 'trackingSince', t.started_at, 'days', $2::int, 'periodStart', b.start_at,
    'totalViews', (SELECT count(*) FROM events WHERE kind='view'),
    'viewsFromRecommendation', (SELECT count(*) FROM events WHERE kind='view' AND source='recommendation'),
    'timesRecommended', (SELECT count(*) FROM events WHERE kind='recommendation'),
    'timesTopResult', (SELECT count(*) FROM events WHERE kind='recommendation' AND position=1),
    'favorites', (SELECT count(*) FROM favorites f JOIN users u ON u.id=f.user_id JOIN restaurants r ON r.id=f.restaurant_id
      WHERE f.restaurant_id=$1 AND f.user_id IS DISTINCT FROM r.owner_id AND u.role <> 'admin' AND u.is_active
        AND NOT EXISTS(SELECT 1 FROM business_analytics_demo_users demo WHERE demo.user_id=f.user_id)),
    'visibleReviews', (SELECT count(*) FROM reviews WHERE restaurant_id=$1 AND status='visible'
      AND NOT EXISTS(SELECT 1 FROM business_analytics_demo_users demo WHERE demo.user_id=reviews.user_id)),
    'averageRating', (SELECT round(avg(rating)::numeric, 2) FROM reviews WHERE restaurant_id=$1 AND status='visible'
      AND NOT EXISTS(SELECT 1 FROM business_analytics_demo_users demo WHERE demo.user_id=reviews.user_id)),
    'verifiedPayments', (SELECT count(*) FROM subscription_transactions s WHERE s.restaurant_id=$1
      AND s.status='verified' AND s.verified_at IS NOT NULL AND s.verified_by IS NOT NULL AND s.verified_at >= b.start_at AND s.verified_at <= b.as_of),
    'activePaidSubscription', EXISTS(SELECT 1 FROM restaurants r JOIN subscription_transactions s ON s.restaurant_id=r.id
      WHERE r.id=$1 AND r.subscription_tier::text=s.tier::text AND r.subscription_tier <> 'none' AND r.subscription_expires_at>b.as_of
      AND s.status='verified' AND s.verified_at IS NOT NULL AND s.verified_at<=b.as_of AND s.verified_by IS NOT NULL AND s.expires_at>b.as_of),
    'dailyViews', (SELECT jsonb_agg(jsonb_build_object('day', d.day::date::text, 'views',
      (SELECT count(*) FROM events e WHERE e.kind='view' AND (e.created_at AT TIME ZONE 'Asia/Manila')::date=d.day::date)) ORDER BY d.day)
      FROM generate_series(b.start_at AT TIME ZONE 'Asia/Manila', b.as_of AT TIME ZONE 'Asia/Manila', interval '1 day') d(day))
  ) AS data FROM bounds b CROSS JOIN business_analytics_tracking t`, [restaurantId, days]);
  if (!rows[0]?.data) throw new Error('Analytics snapshot unavailable');
  return rows[0].data;
}

async function adminStats() {
  await ensureSchema();
  const { rows } = await query(`WITH bounds AS (
    SELECT now() AS as_of,
      (date_trunc('day', now() AT TIME ZONE 'Asia/Manila') - interval '29 days') AT TIME ZONE 'Asia/Manila' AS start_at
  ), events AS (SELECT e.* FROM business_analytics_events e, bounds b WHERE e.created_at >= b.start_at AND e.created_at <= b.as_of),
  demand AS (SELECT c.name, count(DISTINCT e.event_id) AS search_count FROM events e
    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(e.metadata->'cuisines', '[]'::jsonb)) cuisine(name)
    JOIN cuisines c ON lower(c.name)=lower(cuisine.name) WHERE e.kind='recommendation' GROUP BY c.name ORDER BY search_count DESC LIMIT 10),
  hours AS (SELECT extract(hour FROM created_at AT TIME ZONE 'Asia/Manila')::int AS hour,
    count(DISTINCT event_id) AS searches FROM events WHERE kind='recommendation' GROUP BY 1 ORDER BY 1)
  SELECT jsonb_build_object('schemaVersion',2, 'asOf',b.as_of,'trackingSince',t.started_at,
    'users', (SELECT jsonb_build_object('customers',count(*) FILTER(WHERE role='customer'), 'owners',count(*) FILTER(WHERE role='owner'),
      'new_last_30d',count(*) FILTER(WHERE created_at>=b.start_at)) FROM users
        WHERE NOT EXISTS(SELECT 1 FROM business_analytics_demo_users demo WHERE demo.user_id=users.id)),
    'restaurants', (SELECT jsonb_build_object('verified',count(*) FILTER(WHERE status='verified'), 'pending',count(*) FILTER(WHERE status='pending'),
      'rejected',count(*) FILTER(WHERE status='rejected'), 'suspended',count(*) FILTER(WHERE status='suspended')) FROM restaurants),
    'reviews', (SELECT jsonb_build_object('flagged',count(*) FILTER(WHERE status='flagged'),'visible',count(*) FILTER(WHERE status='visible')) FROM reviews
      WHERE NOT EXISTS(SELECT 1 FROM business_analytics_demo_users demo WHERE demo.user_id=reviews.user_id)),
    'promotions', (SELECT jsonb_build_object('active',count(*) FILTER(WHERE status='active' AND start_date<=(b.as_of AT TIME ZONE 'Asia/Manila')::date AND end_date>=(b.as_of AT TIME ZONE 'Asia/Manila')::date),
      'expired',count(*) FILTER(WHERE status='expired' OR end_date<(b.as_of AT TIME ZONE 'Asia/Manila')::date), 'total',count(*)) FROM promotions
      WHERE NOT (restaurant_id='44444444-4444-4444-a444-444444444441' AND title='Weekend Seafood Feast'
        AND description IS NOT DISTINCT FROM 'Get a free side dish with any order above ₱500 on weekends.')),
    'subscriptions', jsonb_build_object('activePaidBusinesses', (SELECT count(*) FROM restaurants r WHERE r.subscription_tier<>'none' AND r.subscription_expires_at>b.as_of
      AND EXISTS(SELECT 1 FROM subscription_transactions s WHERE s.restaurant_id=r.id AND s.tier::text=r.subscription_tier::text AND s.status='verified'
        AND s.verified_at IS NOT NULL AND s.verified_at<=b.as_of AND s.verified_by IS NOT NULL AND s.expires_at>b.as_of)),
      'pendingPayments',(SELECT count(*) FROM subscription_transactions WHERE status='pending_verification')),
    'topCuisineDemand',COALESCE((SELECT jsonb_agg(to_jsonb(demand)) FROM demand),'[]'::jsonb),
    'peakSearchHours',COALESCE((SELECT jsonb_agg(to_jsonb(hours)) FROM hours),'[]'::jsonb)
  ) AS data FROM bounds b CROSS JOIN business_analytics_tracking t`);
  if (!rows[0]?.data) throw new Error('Analytics snapshot unavailable');
  return rows[0].data;
}

module.exports = { ensureSchema, record, ownerStats, adminStats, SCHEMA_SQL };
