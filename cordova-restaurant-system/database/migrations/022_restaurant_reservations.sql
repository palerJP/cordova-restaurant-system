-- Owner-confirmed reservations; no sample bookings or automatic enablement.

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
CREATE INDEX IF NOT EXISTS restaurant_reservations_customer ON restaurant_reservations(customer_id,starts_at);
