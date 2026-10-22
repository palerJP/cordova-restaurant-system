-- PayMongo test checkout extends existing promotions; legacy records are untouched.
CREATE TABLE IF NOT EXISTS promotion_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount_centavos INTEGER NOT NULL CHECK (amount_centavos > 0),
  currency CHAR(3) NOT NULL DEFAULT 'PHP' CHECK (currency = 'PHP'),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT INTO promotion_packages (id, name, amount_centavos, duration_days)
VALUES ('standard-30', '30-day promotion', 19900, 30)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS promotion_payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE RESTRICT,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  package_id TEXT NOT NULL REFERENCES promotion_packages(id),
  amount_centavos INTEGER NOT NULL CHECK (amount_centavos > 0),
  currency CHAR(3) NOT NULL CHECK (currency = 'PHP'),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','expired','refunded')),
  checkout_session_id TEXT UNIQUE,
  checkout_url TEXT,
  paymongo_payment_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_promotion_payment_orders_owner ON promotion_payment_orders(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_payment_open ON promotion_payment_orders(promotion_id) WHERE status = 'pending';
CREATE TABLE IF NOT EXISTS paymongo_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
