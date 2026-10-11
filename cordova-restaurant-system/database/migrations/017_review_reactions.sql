CREATE TABLE IF NOT EXISTS review_reactions (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 emoji TEXT NOT NULL CHECK(emoji IN ('❤️','😋','🔥','👏','🦞')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE review_reactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DELETE FROM review_reactions WHERE emoji NOT IN ('❤️','😋','🔥','👏','🦞');
DELETE FROM review_reactions WHERE ctid IN (
 SELECT row_id FROM (SELECT ctid AS row_id,ROW_NUMBER() OVER(PARTITION BY review_id,user_id ORDER BY created_at DESC,ctid DESC) AS position FROM review_reactions) ranked WHERE position>1
);
CREATE UNIQUE INDEX IF NOT EXISTS review_reactions_one_per_user ON review_reactions(review_id,user_id);
-- Legacy counters without user attribution cannot establish valid unique votes.
UPDATE reviews rv SET reactions=COALESCE((SELECT jsonb_object_agg(counts.emoji,counts.total) FROM (SELECT emoji,COUNT(*)::int total FROM review_reactions WHERE review_id=rv.id GROUP BY emoji) counts),'{}'::jsonb);
