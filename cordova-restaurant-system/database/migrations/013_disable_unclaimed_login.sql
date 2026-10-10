-- This directory placeholder has a published demo password. It must not log in.
UPDATE users SET is_active = FALSE
WHERE id = 'f1a69d69-0a0f-42ae-8adc-9bad5726d1ac'
  AND email = 'unclaimed-listings@cordova-restaurants.gov.ph';
UPDATE refresh_tokens SET revoked_at = NOW()
WHERE user_id = 'f1a69d69-0a0f-42ae-8adc-9bad5726d1ac' AND revoked_at IS NULL;
