-- Existing accounts keep their normal login flow. Only future accounts onboard.
ALTER TABLE users ADD COLUMN onboarding_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN onboarding_required SET DEFAULT TRUE;
UPDATE users SET onboarding_required = TRUE WHERE role <> 'admin' AND email_verified = FALSE;
