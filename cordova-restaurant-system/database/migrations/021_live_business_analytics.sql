-- Separate live activity from mutable customer history and known demo fixtures.

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
CREATE INDEX IF NOT EXISTS business_analytics_events_time ON business_analytics_events(created_at);
