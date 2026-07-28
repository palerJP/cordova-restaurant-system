-- ============================================================================
-- Migration 005: Review "Helpful" Likes
-- ============================================================================
-- Lets any logged-in user mark a review as helpful. One like per user per
-- review (enforced by the composite primary key). Like counts are computed
-- via a join at query time rather than denormalized — review lists are a
-- modest read volume at this scale, so the extra join cost is negligible
-- and it avoids needing a trigger to keep a counter column in sync.
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_likes (
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id);
