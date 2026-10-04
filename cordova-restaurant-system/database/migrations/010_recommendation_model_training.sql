-- Persist globally trained recommendation model versions so administrators
-- can retrain the cold-start scorer from customer feedback.
CREATE TABLE IF NOT EXISTS recommendation_model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model JSONB NOT NULL,
  training_examples INTEGER NOT NULL CHECK (training_examples >= 0),
  positive_examples INTEGER NOT NULL CHECK (positive_examples >= 0),
  negative_examples INTEGER NOT NULL CHECK (negative_examples >= 0),
  trained_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (positive_examples + negative_examples = training_examples)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recommendation_model_one_active
  ON recommendation_model_versions(is_active)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_recommendation_model_versions_created
  ON recommendation_model_versions(created_at DESC);
