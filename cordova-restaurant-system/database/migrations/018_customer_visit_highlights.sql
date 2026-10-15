CREATE TABLE visit_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  caption VARCHAR(300) NOT NULL CHECK (char_length(trim(caption)) BETWEEN 1 AND 300),
  category VARCHAR(24) NOT NULL CHECK (category IN ('Food', 'Ambience', 'Service', 'Overall Experience')),
  status VARCHAR(12) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  moderation_reason TEXT,
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE visit_highlight_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  highlight_id UUID NOT NULL REFERENCES visit_highlights(id) ON DELETE CASCADE,
  storage_ref TEXT NOT NULL,
  sort_order SMALLINT NOT NULL CHECK (sort_order BETWEEN 0 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (highlight_id, sort_order)
);

CREATE INDEX visit_highlights_public_idx ON visit_highlights (restaurant_id, created_at DESC) WHERE status = 'approved';
CREATE INDEX visit_highlights_customer_idx ON visit_highlights (customer_id, created_at DESC);
CREATE INDEX visit_highlights_moderation_idx ON visit_highlights (status, created_at DESC);
CREATE TRIGGER trg_visit_highlights_updated_at BEFORE UPDATE ON visit_highlights
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
