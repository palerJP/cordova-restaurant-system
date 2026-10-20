-- Existing accounts keep their normal login flow; future accounts onboard once.
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN onboarding_required SET DEFAULT TRUE;
UPDATE users SET onboarding_required = FALSE
WHERE onboarding_required = TRUE
  AND EXISTS (SELECT 1 FROM user_preferences WHERE user_id = users.id);
