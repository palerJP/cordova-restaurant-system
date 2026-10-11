ALTER TABLE restaurants ADD COLUMN ownership_claimed BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE restaurants SET ownership_claimed = FALSE WHERE owner_id IN
  (SELECT id FROM users WHERE email = 'unclaimed-listings@cordova-restaurants.gov.ph');

CREATE TABLE business_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  expected_owner_id UUID NOT NULL,
  applicant_name VARCHAR(150) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  explanation TEXT NOT NULL,
  is_dispute BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','info_requested','approved','rejected','withdrawn')),
  review_note TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_open_claim_per_applicant ON business_claims(restaurant_id, applicant_id)
  WHERE status IN ('pending','info_requested');
CREATE INDEX business_claims_queue ON business_claims(status, created_at);
CREATE INDEX business_claims_applicant ON business_claims(applicant_id, created_at);
CREATE TABLE business_claim_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES business_claims(id) ON DELETE RESTRICT,
  filename VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE business_claim_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES business_claims(id) ON DELETE RESTRICT,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(40) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
