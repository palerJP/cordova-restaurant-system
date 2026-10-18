CREATE TABLE IF NOT EXISTS marketing_deliveries (
  campaign_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('sending','sent','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  PRIMARY KEY(campaign_id,user_id)
);
