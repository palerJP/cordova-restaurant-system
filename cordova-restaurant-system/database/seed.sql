-- ============================================================================
-- Seed Data — Cordova Local Restaurant Recommendation System
-- Run AFTER migrations 001 and 002.
-- Password for ALL seeded accounts is "Password123!" — the hash below is a
-- real, verified bcrypt hash of that password (cost 10), confirmed working.
-- ============================================================================

-- Admin ------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role, email_verified_at)
VALUES (
  '11111111-1111-1111-a111-111111111111',
  'admin@cordova-restaurants.gov.ph',
  '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm',
  'System Administrator',
  'admin',
  now()
) ON CONFLICT (email) DO NOTHING;

-- Restaurant owners --------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role, phone, email_verified_at) VALUES
('22222222-2222-2222-a222-222222222221', 'owner.lapulapu@example.com', '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Maria Santos', 'owner', '+639171234561', now()),
('22222222-2222-2222-a222-222222222222', 'owner.seaside@example.com',  '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Jun Dela Cruz', 'owner', '+639171234562', now()),
('22222222-2222-2222-a222-222222222223', 'owner.grillhouse@example.com','$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Liza Fernandez', 'owner', '+639171234563', now())
ON CONFLICT (email) DO NOTHING;

-- Customers -----------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role, email_verified_at) VALUES
('33333333-3333-3333-a333-333333333331', 'juan.delacruz@example.com', '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Juan Dela Cruz', 'customer', now()),
('33333333-3333-3333-a333-333333333332', 'ana.reyes@example.com',     '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Ana Reyes', 'customer', now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_preferences (user_id, preferred_cuisines, dietary_restrictions, budget_range, preferred_services, home_latitude, home_longitude, max_distance_km)
VALUES
('33333333-3333-3333-a333-333333333331', ARRAY['Seafood','Cebuano / Local'], ARRAY[]::text[], 'moderate', ARRAY['dine_in','takeout']::service_type[], 10.2530, 123.9490, 5.0),
('33333333-3333-3333-a333-333333333332', ARRAY['Cafe & Desserts','Japanese'], ARRAY['vegetarian'], 'budget', ARRAY['dine_in']::service_type[], 10.2480, 123.9530, 4.0)
ON CONFLICT (user_id) DO NOTHING;

-- Restaurants (coordinates approximate real barangays in Cordova, Cebu) -----
INSERT INTO restaurants (id, owner_id, name, slug, description, address, barangay, latitude, longitude, phone, price_range, services_offered, status, verified_by, verified_at, avg_rating, review_count) VALUES
('44444444-4444-4444-a444-444444444441', '22222222-2222-2222-a222-222222222221',
 'Lapu-Lapu Seafood Grill', 'lapu-lapu-seafood-grill',
 'Fresh catch-of-the-day seafood grilled to order, right by the shoreline.',
 'Sitio Mactan, Gabi', 'Gabi', 10.2495, 123.9505, '+639201112233',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 0, 0),

('44444444-4444-4444-a444-444444444442', '22222222-2222-2222-a222-222222222222',
 'Seaside Cafe Cordova', 'seaside-cafe-cordova',
 'Cozy cafe with ocean views, specializing in coffee, pastries and light vegetarian meals.',
 'Poblacion Cordova, near the wharf', 'Poblacion', 10.2537, 123.9481, '+639201112234',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 0, 0),

('44444444-4444-4444-a444-444444444443', '22222222-2222-2222-a222-222222222223',
 'Grillhouse Cordova BBQ', 'grillhouse-cordova-bbq',
 'Classic Filipino BBQ and grilled favorites, budget-friendly family dining.',
 'San Miguel Road, Ibabao', 'Ibabao', 10.2561, 123.9459, '+639201112235',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'pending', NULL, NULL, 0, 0)
ON CONFLICT (slug) DO NOTHING;

-- Restaurant <-> cuisine mapping ---------------------------------------------
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
SELECT '44444444-4444-4444-a444-444444444441', id FROM cuisines WHERE slug IN ('seafood','cebuano-local','grill-bbq')
ON CONFLICT DO NOTHING;
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
SELECT '44444444-4444-4444-a444-444444444442', id FROM cuisines WHERE slug IN ('cafe-desserts','vegetarian-vegan')
ON CONFLICT DO NOTHING;
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
SELECT '44444444-4444-4444-a444-444444444443', id FROM cuisines WHERE slug IN ('grill-bbq','filipino')
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_dietary_options (restaurant_id, option) VALUES
('44444444-4444-4444-a444-444444444442', 'vegetarian'),
('44444444-4444-4444-a444-444444444442', 'vegan')
ON CONFLICT DO NOTHING;

-- Operating hours (Mon-Sun, 0=Sunday) ----------------------------------------
INSERT INTO operating_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT '44444444-4444-4444-a444-444444444441', d, '10:00', '21:00' FROM generate_series(0,6) d
ON CONFLICT DO NOTHING;
INSERT INTO operating_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT '44444444-4444-4444-a444-444444444442', d, '07:00', '20:00' FROM generate_series(0,6) d
ON CONFLICT DO NOTHING;
INSERT INTO operating_hours (restaurant_id, day_of_week, open_time, close_time, is_closed)
SELECT '44444444-4444-4444-a444-444444444443', d, '11:00', '22:00', (d = 1) FROM generate_series(0,6) d
ON CONFLICT DO NOTHING;

-- Menu ------------------------------------------------------------------
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('55555555-5555-5555-a555-555555555551', '44444444-4444-4444-a444-444444444441', 'Grilled Seafood', 1),
('55555555-5555-5555-a555-555555555552', '44444444-4444-4444-a444-444444444442', 'Coffee & Beverages', 1),
('55555555-5555-5555-a555-555555555553', '44444444-4444-4444-a444-444444444443', 'BBQ Skewers', 1)
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, dietary_tags) VALUES
('44444444-4444-4444-a444-444444444441', '55555555-5555-5555-a555-555555555551', 'Grilled Bangus Belly', 'Whole milkfish belly, grilled with calamansi-soy dip', 220.00, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444441', '55555555-5555-5555-a555-555555555551', 'Garlic Butter Shrimp', 'Half kilo of shrimp sauteed in garlic butter', 350.00, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444442', '55555555-5555-5555-a555-555555555552', 'Iced Spanish Latte', 'House specialty cold brew latte', 140.00, ARRAY['vegetarian']),
('44444444-4444-4444-a444-444444444442', '55555555-5555-5555-a555-555555555552', 'Vegan Banana Muffin', 'Freshly baked, dairy-free', 85.00, ARRAY['vegan','vegetarian']),
('44444444-4444-4444-a444-444444444443', '55555555-5555-5555-a555-555555555553', 'Pork BBQ Skewer (3pcs)', 'Sweet-savory marinated pork skewers', 90.00, ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Reviews ------------------------------------------------------------------
INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES
('44444444-4444-4444-a444-444444444441', '33333333-3333-3333-a333-333333333331', 5, 'Freshest seafood in Cordova, worth the trip!'),
('44444444-4444-4444-a444-444444444442', '33333333-3333-3333-a333-333333333332', 4, 'Great vegan options and a relaxing view.')
ON CONFLICT DO NOTHING;

-- Promotions -----------------------------------------------------------------
INSERT INTO promotions (restaurant_id, title, description, discount_label, start_date, end_date, status) VALUES
('44444444-4444-4444-a444-444444444441', 'Weekend Seafood Feast', 'Get a free side dish with any order above ₱500 on weekends.', 'Free Side Dish', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active')
ON CONFLICT DO NOTHING;
