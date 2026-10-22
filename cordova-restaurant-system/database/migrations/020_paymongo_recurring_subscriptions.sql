-- Scheduled recurring billing is separate from legacy manually verified transactions.
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic','premium','featured')),
  interval TEXT NOT NULL CHECK (interval IN ('monthly','yearly')),
  amount_centavos INTEGER NOT NULL CHECK (amount_centavos >= 2000),
  currency CHAR(3) NOT NULL DEFAULT 'PHP' CHECK (currency = 'PHP'),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  paymongo_plan_id TEXT UNIQUE
);
INSERT INTO subscription_plans (id,name,tier,interval,amount_centavos) VALUES
  ('basic-monthly','Basic Boost monthly','basic','monthly',49900),
  ('premium-monthly','Premium Boost monthly','premium','monthly',99900),
  ('featured-monthly','Featured Partner monthly','featured','monthly',199900)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE paymongo_customers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  paymongo_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recurring_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  amount_centavos INTEGER NOT NULL CHECK (amount_centavos >= 2000),
  currency CHAR(3) NOT NULL CHECK (currency = 'PHP'),
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('creating','incomplete','active','past_due','unpaid','cancelled','incomplete_cancelled')),
  paymongo_plan_id TEXT,
  paymongo_customer_id TEXT,
  paymongo_subscription_id TEXT UNIQUE,
  first_invoice_id TEXT,
  first_payment_intent_id TEXT,
  next_billing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recurring_subscriptions_owner ON recurring_subscriptions(user_id,created_at DESC);
CREATE UNIQUE INDEX idx_recurring_subscriptions_open ON recurring_subscriptions(restaurant_id)
  WHERE status IN ('creating','incomplete','active','past_due','unpaid');
ALTER TABLE restaurants ADD COLUMN paymongo_recurring_subscription_id UUID REFERENCES recurring_subscriptions(id) ON DELETE SET NULL;
