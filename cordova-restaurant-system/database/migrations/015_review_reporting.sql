CREATE TABLE review_reports (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
 reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 category TEXT NOT NULL CHECK (category IN ('spam','harassment','hate_speech','personal_information','irrelevant','other')),
 details TEXT NOT NULL CHECK (length(details) BETWEEN 10 AND 1000),
 snapshot JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 resolved_at TIMESTAMPTZ,
 UNIQUE(review_id, reporter_id)
);
CREATE INDEX review_reports_queue ON review_reports(review_id,status);
CREATE TABLE review_moderation_events (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
 moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
 previous_status review_status NOT NULL,
 status review_status NOT NULL,
 reason TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
