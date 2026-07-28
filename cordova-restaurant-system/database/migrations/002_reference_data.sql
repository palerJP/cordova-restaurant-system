-- ============================================================================
-- Migration 002: Reference data required for the app to function
-- (cuisines lookup + default AI recommendation weight profile)
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- ============================================================================

INSERT INTO cuisines (name, slug) VALUES
  ('Filipino', 'filipino'),
  ('Cebuano / Local', 'cebuano-local'),
  ('Seafood', 'seafood'),
  ('Grill & BBQ', 'grill-bbq'),
  ('Korean', 'korean'),
  ('Japanese', 'japanese'),
  ('Chinese', 'chinese'),
  ('Fast Food', 'fast-food'),
  ('Cafe & Desserts', 'cafe-desserts'),
  ('Pizza & Pasta', 'pizza-pasta'),
  ('Street Food', 'street-food'),
  ('Vegetarian / Vegan', 'vegetarian-vegan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recommendation_weights (
  cuisine_weight, budget_weight, proximity_weight, dietary_weight, rating_weight, is_active
) VALUES (0.30, 0.25, 0.20, 0.15, 0.10, TRUE)
ON CONFLICT DO NOTHING;
