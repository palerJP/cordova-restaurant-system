-- ============================================================================
-- 002_seed_data.sql
-- Seed script for Cordova Restaurant Directory System (Development / Demo)
-- ============================================================================

-- Users ----------------------------------------------------------------------
-- password is 'Password123!' hashed with bcrypt (cost factor 10)
-- $2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm
INSERT INTO users (id, email, password_hash, full_name, role, phone, email_verified_at, created_at) VALUES
('11111111-1111-1111-a111-111111111111', 'admin@cordovateats.ph',            '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'System Administrator',        'admin',    '+639171234560', now(), now()),
('11111111-1111-1111-a111-111111111112', 'admin@cordova-restaurants.gov.ph', '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'System Administrator',        'admin',    '+639171234560', now(), now()),
('20000000-0000-0000-0000-000000000001', 'owner.10000roses@cordovateats.ph',    '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Bae Min-jun',                 'owner',    '+639171000001', now(), now()),
('20000000-0000-0000-0000-000000000002', 'owner.abyroad@cordovateats.ph',       '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Abigail Sanchez',            'owner',    '+639171000002', now(), now()),
('20000000-0000-0000-0000-000000000003', 'owner.albertos@cordovateats.ph',      '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Alberto Tan',                 'owner',    '+639171000003', now(), now()),
('20000000-0000-0000-0000-000000000004', 'owner.barracks@cordovateats.ph',      '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Mario Ramos',                 'owner',    '+639171000004', now(), now()),
('20000000-0000-0000-0000-000000000005', 'owner.bric@cordovateats.ph',          '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Brian Richard Castro',         'owner',    '+639171000005', now(), now()),
('20000000-0000-0000-0000-000000000006', 'owner.burandat@cordovateats.ph',      '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Danilo Burandat',             'owner',    '+639171000006', now(), now()),
('20000000-0000-0000-0000-000000000007', 'owner.cafemafia@cordovateats.ph',      '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Marco Rossi',                 'owner',    '+639171000007', now(), now()),
('20000000-0000-0000-0000-000000000008', 'owner.cascaja@cordovateats.ph',        '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Clara Cascaja',               'owner',    '+639171000008', now(), now()),
('20000000-0000-0000-0000-000000000009', 'owner.csalt@cordovateats.ph',          '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Cynthia Salter',             'owner',    '+639171000009', now(), now()),
('20000000-0000-0000-0000-000000000010', 'owner.donmacchiatos@cordovateats.ph', '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Donato Macalinao',          'owner',    '+639171000010', now(), now()),
('20000000-0000-0000-0000-000000000011', 'owner.eatnrepeat@cordovateats.ph',     '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Eleanor Reyes',             'owner',    '+639171000011', now(), now()),
('20000000-0000-0000-0000-000000000012', 'owner.entoys@cordovateats.ph',        '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Florencio ''Entoy'' Escabas',  'owner',    '+639171000012', now(), now()),
('20000000-0000-0000-0000-000000000013', 'owner.horizon@cordovateats.ph',       '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Hazel Joy Ompad',            'owner',    '+639171000013', now(), now()),
('20000000-0000-0000-0000-000000000015', 'owner.lantaw@cordovateats.ph',        '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Leonardo Lantaw',            'owner',    '+639171000015', now(), now()),
('20000000-0000-0000-0000-000000000016', 'owner.mavericks@cordovateats.ph',     '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Michael Maverick',           'owner',    '+639171000016', now(), now()),
('20000000-0000-0000-0000-000000000017', 'owner.mcdonalds@cordovateats.ph',      '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Manuel Dy (Franchisee)',     'owner',    '+639171000017', now(), now()),
('20000000-0000-0000-0000-000000000018', 'owner.papsys@cordovateats.ph',         '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Patrick ''Papsy'' Alcordo',   'owner',    '+639171000018', now(), now()),
('20000000-0000-0000-0000-000000000019', 'owner.parola@cordovateats.ph',         '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Roberto Parola',             'owner',    '+639171000019', now(), now()),
('20000000-0000-0000-0000-000000000020', 'owner.rca@cordovateats.ph',            '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Rowena Castillo Alcover',    'owner',    '+639171000020', now(), now()),
('20000000-0000-0000-0000-000000000021', 'owner.solea@cordovateats.ph',          '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Sophia Leano',               'owner',    '+639171000021', now(), now()),
('20000000-0000-0000-0000-000000000022', 'owner.streetfoodpark@cordovateats.ph', '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Sherwin Flores',             'owner',    '+639171000022', now(), now()),
('20000000-0000-0000-0000-000000000023', 'owner.stuffednfried@cordovateats.ph',  '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Stefan Navarro',             'owner',    '+639171000023', now(), now()),
('20000000-0000-0000-0000-000000000024', 'owner.sungka@cordovateats.ph',         '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Salvador Sungka',            'owner',    '+639171000024', now(), now()),
('20000000-0000-0000-0000-000000000025', 'owner.taytayan@cordovateats.ph',       '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Tomas Taytayan',             'owner',    '+639171000025', now(), now()),
('20000000-0000-0000-0000-000000000026', 'owner.titakims@cordovateats.ph',       '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Kimberly ''Tita Kim'' Arong', 'owner',    '+639171000026', now(), now()),
('33333333-3333-3333-a333-333333333331', 'customer.carlos@example.com',        '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Carlos Reyes',               'customer', '+639171234564', now(), now()),
('33333333-3333-3333-a333-333333333332', 'customer.ana@example.com',           '$2b$10$64m6JYqwt4wOGjJW1eQSfu5ep9BUaRwr7rnsanKIP30DqmEKw9Zjm', 'Ana Lim',                    'customer', '+639171234565', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Cuisines -------------------------------------------------------------------
INSERT INTO cuisines (slug, name, icon) VALUES
('seafood',          'Seafood',           '🦞'),
('cebuano-local',    'Cebuano & Native',  '🥥'),
('grill-bbq',        'Grill & BBQ',       '🔥'),
('cafe-desserts',    'Cafe & Desserts',   '☕'),
('filipino',         'Filipino Classic',  '🍲'),
('asian-fusion',     'Asian Fusion',      '🍜'),
('fast-food',        'Fast Food',         '🍔'),
('vegetarian-vegan', 'Vegetarian / Vegan','🥗')
ON CONFLICT (slug) DO NOTHING;

-- Restaurants ----------------------------------------------------------------
INSERT INTO restaurants (
  id, owner_id, name, slug, description, address, barangay,
  latitude, longitude, phone, price_range, services_offered,
  status, verified_by, verified_at, avg_rating, review_count
) VALUES
('44444444-4444-4444-a444-444444444441', '22222222-2222-2222-a222-222222222221',
 'Horizon Bean Cafe', 'horizon-bean-cafe',
 'A cozy, small-scale neighborhood coffee shop known for its premium coffee, comfort food, and late-night chill vibe.',
 'Unit 3, JMP Building, Purok 1 San Miguel Road, Cordova', 'San Miguel', 10.2550, 123.9480, '0975 174 5866',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.8, 42),

('44444444-4444-4444-a444-444444444442', '22222222-2222-2222-a222-222222222222',
 'CSalt Cafe', 'csalt-cafe',
 'Cozy cafe with ocean views, specializing in coffee, pastries and light vegetarian meals.',
 'Poblacion Cordova, near the wharf', 'Poblacion', 10.2537, 123.9481, '+639201112234',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.7, 18),

('44444444-4444-4444-a444-444444444443', '22222222-2222-2222-a222-222222222223',
 'Grillhouse Cordova BBQ', 'grillhouse-cordova-bbq',
 'Classic Filipino BBQ and grilled favorites, budget-friendly family dining.',
 'San Miguel Road, Ibabao', 'Ibabao', 10.2561, 123.9459, '0927 296 4811',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 15),

('44444444-4444-4444-a444-444444444444', '22222222-2222-2222-a222-222222222221',
 'Street Food Park', 'street-food-park',
 'Affordable local street food and fresh seafood paired with a cool ocean breeze and sunset.',
 'Roro Port, Cordova', 'Roro Port', 10.2450, 123.9520, '+639201112236',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.5, 30),

('44444444-4444-4444-a444-444444444445', '22222222-2222-2222-a222-222222222222',
 'ABY ROAD Resto Bar', 'aby-road-resto-bar',
 'Beatles-inspired restobar with local and international favorites.',
 'Bangbang, Cordova', 'Bangbang', 10.2510, 123.9460, '(032) 238 5718',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 12),

('44444444-4444-4444-a444-444444444446', '22222222-2222-2222-a222-222222222222',
 'Eat n Repeat', 'eat-n-repeat',
 'Aesthetic and Instagram-worthy cafe and tambayan.',
 'Bangbang, Cordova', 'Bangbang', 10.2520, 123.9470, '0915 151 6595',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.7, 20),

('44444444-4444-4444-a444-444444444447', '22222222-2222-2222-a222-222222222223',
 'Taytayan Pinoy Restaurant', 'taytayan-pinoy-restaurant',
 'Kilalang open-air at lutong-bahay na kainan serving native Cebuano dishes.',
 'Ibabao, Cordova', 'Ibabao', 10.2540, 123.9440, '(032) 412 3783',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 14),

('44444444-4444-4444-a444-444444444448', '22222222-2222-2222-a222-222222222221',
 'STUFFED N FRIED Cordova Branch', 'stuffed-n-fried-cordova-branch',
 'Popular local chicken house known for signature double-fried whole chicken and lechon kawali.',
 'Gabi, Cordova', 'Gabi', 10.2485, 123.9510, '0975 985 6145',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.8, 35),

('44444444-4444-4444-a444-444444444449', '22222222-2222-2222-a222-222222222221',
 'McDonalds Cordova', 'mcdonalds-cordova',
 'World-famous fast-food hamburger restaurant serving burgers, fries, and breakfast favorites.',
 'San Miguel, Cordova', 'San Miguel', 10.2550, 123.9490, '0968 851 0931',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.5, 50),

('44444444-4444-4444-a444-44444444444a', '22222222-2222-2222-a222-222222222223',
 'Barracks Grill and Resto Bar', 'barracks-grill-and-resto-bar',
 'Casual nightspot and dining place with grilled specialties.',
 'Gabi, Cordova', 'Gabi', 10.2470, 123.9530, '0977 328 7689',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.5, 16),

('44444444-4444-4444-a444-44444444444b', '22222222-2222-2222-a222-222222222221',
 'BRIC Food Park', 'bric-food-park',
 'A vibrant, open-air al fresco dining destination with multiple food stalls.',
 'San Miguel, Cordova', 'San Miguel', 10.2560, 123.9500, 'N/A',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 22),

('44444444-4444-4444-a444-44444444444c', '22222222-2222-2222-a222-222222222221',
 'RCA Bilao Food Station', 'rca-bilao-food-station',
 'Pansit stir-fry, boneless lechon belly, and kakanin bilao food trays.',
 'Gabi, Cordova', 'Gabi', 10.2490, 123.9525, '(032) 326 8766',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.7, 19),

('44444444-4444-4444-a444-44444444444d', '22222222-2222-2222-a222-222222222222',
 'MAVERICKS by The Baker Street', 'mavericks-by-the-baker-street',
 'Creative space, collective stories, pastry party, and specialty coffee.',
 'Gabi, Cordova', 'Gabi', 10.2488, 123.9515, '0920 527 6233',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.9, 28),

('44444444-4444-4444-a444-44444444444e', '22222222-2222-2222-a222-222222222221',
 'Entoys Bakasihan', 'entoys-bakasihan',
 'Famous open-air eatery famous for its signature reef eel dish nilarang na bakasi.',
 'Buagsong, Cordova', 'Buagsong', 10.2505, 123.9420, '0966 931 7531',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.7, 40),

('44444444-4444-4444-a444-44444444444f', '22222222-2222-2222-a222-222222222223',
 'Tita Kims', 'tita-kims',
 'Affordable buffet-style Filipino restaurant located along the National Highway.',
 'Gabi, Cordova', 'Gabi', 10.2475, 123.9540, '0998 868 8573',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 25),

('44444444-4444-4444-a444-444444444450', '22222222-2222-2222-a222-222222222221',
 'Burandat Seafood Bucket', 'burandat-seafood-bucket',
 'Fresh catch-of-the-day seafood grilled to order, right by the shoreline.',
 'Gabi, Cordova', 'Gabi', 10.2465, 123.9500, '0916 473 3656',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.7, 32),

('44444444-4444-4444-a444-444444444451', '22222222-2222-2222-a222-222222222222',
 'Cafe Mafia', 'cafe-mafia',
 'Gourmet burgers, artisan coffee, and mafia-themed ambiance.',
 'Dapitan, Cordova', 'Dapitan', 10.2580, 123.9475, '0917 321 0453',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.8, 26),

('44444444-4444-4444-a444-444444444452', '22222222-2222-2222-a222-222222222221',
 'Solea Mactan Resort', 'solea-mactan-restaurant',
 'Resort dining featuring international buffets and local specialties.',
 'Alegria, Cordova', 'Alegria', 10.2390, 123.9600, '(032) 517 8889',
 'premium', ARRAY['dine_in']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.9, 65),

('44444444-4444-4444-a444-444444444454', '22222222-2222-2222-a222-222222222221',
 'Sungka Native Restaurant', 'sungka-native-restaurant',
 'Classic Filipino dishes served with warm hospitality near Cordova port.',
 'Day-as, Cordova', 'Day-as', 10.2525, 123.9430, 'sungkanative@gmail.com',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 17),

('44444444-4444-4444-a444-444444444455', '22222222-2222-2222-a222-222222222221',
 'Lantaw Floating Native Restaurant', 'lantaw-floating-native-restaurant',
 'Floating native restaurant on the Cordova waterfront with sunset views and seafood.',
 'Day-as, Cordova', 'Day-as', 10.2515, 123.9410, '0985 052 3061',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.8, 80),

('44444444-4444-4444-a444-444444444456', '22222222-2222-2222-a222-222222222221',
 'Albertos Pizza Cordova', 'albertos-pizza-cordova',
 'Affordable freshly-baked local favorites and specialty pizzas.',
 'Gabi, Cordova', 'Gabi', 10.2492, 123.9512, '0925 871 4539',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.6, 38),

('44444444-4444-4444-a444-444444444457', '22222222-2222-2222-a222-222222222222',
 'Cascaja Cafe', 'cascadja-cafe',
 'Cozy coffee shop in Cordova offering delicious coffee, rice meals, pasta, and drinks.',
 'Calan, Cordova', 'Calan', 10.2570, 123.9465, '+63 995 755 0983',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.7, 24),

('44444444-4444-4444-a444-444444444458', '22222222-2222-2222-a222-222222222222',
 'Don Macchiatos Cordova', 'don-macchiatos-cordova',
 'Budget-friendly espresso drinks, iced caramel macchiatos, and coffee favorites.',
 'San Miguel, Cordova', 'San Miguel', 10.2555, 123.9495, '0918 596 7413',
 'budget', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.8, 45),

('44444444-4444-4444-a444-444444444459', '22222222-2222-2222-a222-222222222221',
 'Parola Seaview Restaurant', 'parola-seaview-restaurant',
 'Open-air seaside dining centered around an illuminated lighthouse overlooking the bay.',
 'Poblacion, Cordova', 'Poblacion', 10.2530, 123.9470, '(032) 514 9005',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.9, 70),

('44444444-4444-4444-a444-44444444445a', '22222222-2222-2222-a222-222222222222',
 '10000 Roses Cafe & More', '10000-roses-cafe-and-more',
 'Iconic tourist attraction and cafe surrounded by thousands of LED-lit artificial white roses.',
 'Day-as, Cordova', 'Day-as', 10.2510, 123.9405, '0956 839 9427',
 'moderate', ARRAY['dine_in','takeout']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.9, 95),

('44444444-4444-4444-a444-44444444445b', '22222222-2222-2222-a222-222222222221',
 'Papsys BBQ', 'papsys-bbq',
 'A popular Filipino casual dining restaurant chain known for its signature charcoal-grilled specialties and rustic, modern ambiance.',
 'Barangay Bang-bang, Cordova, Cebu', 'Bang-bang', 10.2579, 123.9485, '0927 296 4811',
 'budget', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 4.8, 52)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  barangay = EXCLUDED.barangay,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  phone = EXCLUDED.phone,
  price_range = EXCLUDED.price_range,
  status = EXCLUDED.status;

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
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
SELECT '44444444-4444-4444-a444-44444444445b', id FROM cuisines WHERE slug IN ('grill-bbq','filipino')
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
INSERT INTO operating_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT '44444444-4444-4444-a444-44444444445b', d, '09:00', '21:00' FROM generate_series(0,6) d
ON CONFLICT DO NOTHING;

-- Default Menu ------------------------------------------------------------------
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


-- McDonalds Cordova Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('60337da8-4f8c-4fc4-834a-4d3a9047465a', '44444444-4444-4444-a444-444444444449', 'Burgers & Sandwiches', 1),
('16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '44444444-4444-4444-a444-444444444449', 'Chicken McDo & Platters', 2),
('74154098-e87d-4645-a453-22bcc2d8e7d0', '44444444-4444-4444-a444-444444444449', 'McSpaghetti & Rice Meals', 3),
('adc70935-b25c-4994-bb48-a7d1e3760b9b', '44444444-4444-4444-a444-444444444449', 'McFries & Sides', 4),
('f53513ef-1203-4338-81ec-f27f3e862819', '44444444-4444-4444-a444-444444444449', 'Desserts & Sweet Treats', 5),
('9bec9a91-c365-4764-8995-0f705fd8eef8', '44444444-4444-4444-a444-444444444449', 'McCafé & Beverages', 6),
('8440b510-d832-4cc2-a660-e69ab240fea8', '44444444-4444-4444-a444-444444444449', 'Group Meals & McShare', 7)
ON CONFLICT DO NOTHING;

-- McDonalds Cordova Menu Items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '1-pc. Chicken McDo Meal', 'Signature crispy, golden-brown chicken that is juicy on the inside, served with steamed rice and signature gravy.', 115.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Sulit-Busog-1-pc.-Chicken-Mcdo-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '1-pc. Chicken McDo with Fries Meal', '1-pc. Chicken McDo with steamed rice, world-famous golden fries, and a regular drink.', 198.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/1-pc.-Chicken-McDo-Fries-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '74154098-e87d-4645-a453-22bcc2d8e7d0', '1-pc. Chicken McDo with McSpaghetti & Fries Meal', '1-pc. Chicken McDo, McSpaghetti, world-famous golden fries, and a chilled drink.', 262.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/spagetti-meal-mcdonalds-06.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '74154098-e87d-4645-a453-22bcc2d8e7d0', '1-pc. Chicken McDo with McSpaghetti Meal', 'The iconic combination of 1-pc. crispy Chicken McDo and sweet-style McSpaghetti noodles.', 201.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/spagetti-meal-mcdonalds-08.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '1-pc. Spicy Chicken McDo & Fries Meal', '1-pc. Spicy Chicken McDo with rice, world-famous golden fries, and regular beverage.', 203.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/1-pc.-Spicy-Chicken-McDo-Fries-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '1-pc. Spicy Chicken McDo Meal', 'Crispy chicken cooked with fiery spices throughout the meat, served with warm rice and savory gravy.', 120.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/1-pc.-Spicy-Chicken-McDo-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '10-pc. Chicken McNuggets', 'Ten pieces of golden, crispy Chicken McNuggets with delicious dipping sauce.', 189.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/10-pc-chicken-mcnuggets.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '2-pc. Chicken McDo & Fries Meal', 'Two pieces of Chicken McDo, steamed rice, signature fries, and refreshing drink.', 288.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/2-pc.-Chicken-McDo-Fries-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '2-pc. Chicken McDo Meal', 'Two pieces of crispy, juicy Chicken McDo served with warm steamed rice and rich gravy.', 231.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/2-pc.-Chicken-McDo-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '2-pc. Spicy Chicken McDo Meal', 'Two pieces of hot and spicy Chicken McDo served with steamed white rice and rich gravy.', 241.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/2-pc.-Chicken-McDo-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '20-pc. Chicken McNuggets', 'Twenty golden pieces of Chicken McNuggets made with tender white meat chicken, perfect for sharing.', 375.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/20-pc-chicken-mcnuggets.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '8440b510-d832-4cc2-a660-e69ab240fea8', '4-pc. Burger McDo McShare Bundle', 'Bundle of 4 Burger McDo burgers with 4 regular fries and 4 drinks.', 460.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-05.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', '6-pc. Chicken McNuggets with Fries Meal', 'Six tender, juicy pieces of white meat chicken McNuggets with your choice of dipping sauce, fries, and drink.', 215.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/6-pc.-Chicken-McNuggets-w-Fries-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '8440b510-d832-4cc2-a660-e69ab240fea8', '6-pc. Chicken McShare Box', 'Six pieces of crispy, juicy Chicken McDo with gravy, perfect for sharing with family and friends.', 513.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/6-pc-chicken-mcshare-box-2.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '8440b510-d832-4cc2-a660-e69ab240fea8', '6-pc. Spicy Chicken McShare Box', 'Six pieces of spicy-spiced Chicken McDo pieces packed in a sharing box.', 533.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/6-pc-chicken-mcshare-box-2.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '8440b510-d832-4cc2-a660-e69ab240fea8', '8-pc. Chicken McShare Box', 'Eight pieces of freshly cooked Chicken McDo served with savory dipping gravy.', 670.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/8-pc-chicken-mcshare-box-3.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '8440b510-d832-4cc2-a660-e69ab240fea8', '8-pc. Spicy Chicken McShare Box', 'Eight pieces of spicy Chicken McDo for party bundles and family meals.', 690.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/8-pc-chicken-mcshare-box-3.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Apple Pie', 'Crispy, flaky golden pastry crust filled with warm, sweet cinnamon apple filling.', 45.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/apple-pie-mcdo-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'BFF Fries', 'Extra-large sharing size of iconic McDonald''s crispy golden fries for you and your friends.', 175.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-fries-13.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Big Mac Meal', 'Two 100% beef patties, Big Mac sauce, crisp shredded lettuce, American cheese, pickles, and onions on a toasted sesame seed bun. Served with fries and drink.', 284.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-16.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Burger McDo Meal', 'Beef patty topped with sweet-savory signature sauce in a soft toasted bun. Served with fries and drink.', 157.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-05.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Cheeseburger Meal', '100% pure beef patty seasoned with a pinch of salt and pepper, topped with a tangy pickle, chopped onions, ketchup, mustard, and a slice of melty American cheese. Served with fries and drink.', 156.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-15.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Cheesy Burger McDo Meal', 'Classic Burger McDo layered with creamy cheese. Served with fries and drink.', 167.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-19.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Choco Lava Puff', 'Crispy warm puff with an oozing, molten rich chocolate center.', 77.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2026/07/mcdo-Choco-Lava-Puff.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'Coca-Cola Medium', 'Classic ice-cold, refreshing Coca-Cola.', 59.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Coca-Cola.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Coke McFloat', 'Ice-cold bubbly Coca-Cola topped with creamy vanilla soft serve and sweet chocolate syrup.', 82.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/drinks-mcdo-image-04-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Cotton Candy McFloat', 'Fun, pastel cotton candy flavored soda topped with creamy soft serve ice cream.', 61.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/cotton-candy-mcfloat.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', 'Crispy Chicken Fillet Ala King Meal', 'Crispy chicken fillet with creamy buttery Ala King sauce over hot steamed rice.', 105.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Crispy-Chicken-Fillet-Ala-King-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '16dbacfa-94cf-4fe1-a9c4-af86ec718cde', 'Crispy Chicken Fillet Ala King with Fries Meal', 'Golden crispy chicken fillet smothered in rich, creamy Ala King sauce with steamed rice, fries, and drink.', 170.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Crispy-Chicken-Fillet-Ala-King-w-Fries-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Crispy Chicken Fillet Sandwich with Fries Meal', 'Crispy, juicy chicken fillet served with creamy sauce on a toasted bun. Served with fries and drink.', 177.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-12.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Double Big Mac Meal', 'Four 100% beef patties with signature Big Mac sauce, lettuce, cheese, pickles, and onions. Served with fries and drink.', 346.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-price-02.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Double Cheeseburger Meal', 'Two 100% pure beef patties seasoned with just a pinch of salt and pepper, topped with tangy pickles, minced onions, ketchup, mustard, and two slices of melted American cheese. Served with fries and drink.', 250.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-14.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Double McChicken Meal', 'Two crispy chicken patties topped with savory mayonnaise and shredded lettuce on a toasted bun. Served with fries and drink.', 264.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo01-price-01.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Double Quarter Pounder with Cheese Meal', 'Two quarter-pound 100% pure beef patties served hot and juicy with melted American cheese, slivered onions, and pickles. Served with fries and drink.', 346.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-07.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Ebi Burger Meal', 'Crisp, golden shrimp patty drizzled with Thousand Island dressing and fresh lettuce. Served with fries and drink.', 265.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2026/02/Ebi-Burger-Meal.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Hash Browns', 'Golden, crispy, and fluffy shredded potato patty.', 48.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/hash-brown.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Hot Caramel Sundae', 'Velvety vanilla soft serve drizzled with warm, rich caramel fudge topping.', 59.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/drinks-mcdo-image-03-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'Hot Chocolate', 'Steaming cup of rich, creamy decadent chocolate.', 85.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Hot-Chocolate.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Hot Fudge Sundae', 'Vanilla soft serve smothered in rich, warm chocolate fudge.', 59.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/drinks-mcdo-image-02-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'Iced Tea Medium', 'Chilled sweet and tangy iced tea.', 65.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Iced-Tea.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Large Fries', 'Generous serving of crispy golden fries lightly salted to perfection.', 125.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcfries-original.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Large Poptato', 'Bite-sized crispy golden potato pops seasoned to perfection.', 100.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2026/07/mcdo-Large-Poptato.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Matcha McFlurry with Oreo', 'Smooth matcha green tea swirl blended with vanilla soft-serve and crushed Oreo cookies.', 83.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/drinks-mcdo-image-10-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Caramel Frappe', 'Ice-blended coffee with rich caramel syrup, topped with fluffy whipped cream and caramel drizzle.', 169.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Caramel-Frappe.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Dalandan Smoothie', 'Refreshing citrus dalandan fruit smoothie blended icy cold.', 149.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Dalandan-Smoothie.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Iced Coffee Black', 'Bold, chilled freshly brewed coffee served over ice.', 59.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Iced-Americano-Medium.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Iced Coffee Original', 'Chilled premium roast coffee blended with sweet milk and ice.', 69.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Iced-Latte-Medium.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Iced Latte', 'Freshly pulled espresso poured over cold fresh milk and ice.', 99.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Iced-Latte-Medium.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Mocha Frappe', 'Blended coffee and rich chocolaty fudge topped with whipped cream and chocolate drizzle.', 169.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Mocha-Frappe.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Premium Roast Coffee', 'Freshly brewed 100% Arabica coffee with a rich aroma and smooth, balanced taste.', 63.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Premium-Roast-Coffee.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'McCafé Strawberry Smoothie', 'Sweet, fruity blended strawberry smoothie with real fruit flavors.', 149.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/McCafe-Strawberry-Smoothie.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'McChicken Meal', 'Crispy chicken patty topped with mayonnaise and shredded lettuce on a toasted bun. Served with fries and drink.', 234.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-06.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'McFlurry with Oreo', 'Creamy vanilla soft-serve blended with crunchy crumbled Oreo cookie pieces.', 70.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/drinks-mcdo-image-11-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '8440b510-d832-4cc2-a660-e69ab240fea8', 'McSpaghetti & Chicken McShare Bundle', 'Combo bundle featuring 6-pc Chicken McDo with McSpaghetti Platter for groups.', 765.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcspaghetti-platter-1.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '74154098-e87d-4645-a453-22bcc2d8e7d0', 'McSpaghetti Meal', 'Sweet Pinoy-style spaghetti noodles tossed with savory meat sauce, sliced hotdogs, and topped with shredded cheese.', 105.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/spagetti-meal-mcdonalds-04.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '74154098-e87d-4645-a453-22bcc2d8e7d0', 'McSpaghetti Platter', 'Generous sharing platter of iconic sweet McSpaghetti with cheesy sauce and hotdogs, great for group gatherings.', 262.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcspaghetti-platter-1.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '74154098-e87d-4645-a453-22bcc2d8e7d0', 'McSpaghetti with Fries Meal', 'Classic sweet-style McSpaghetti paired with world-famous golden fries and a refreshing beverage.', 168.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/spagetti-meal-mcdonalds-03.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Medium Fries', 'World-famous McDonald''s French Fries — crispy and golden on the outside, fluffy on the inside.', 92.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcfries-original.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Quarter Pounder with Cheese Meal', 'A quarter-pound of 100% fresh beef cooked right when you order, with two slices of melted cheese, slivered onions, and pickles on a sesame seed bun. Served with fries and drink.', 284.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-11.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Shake Shake Fries BBQ', 'Golden fries tossed with smoky, tangy barbecue seasoning.', 101.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-fries-15.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Shake Shake Fries Cheese', 'Golden fries shaken with savory, cheesy flavor powder for an addictive bite.', 101.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-fries-14.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '9bec9a91-c365-4764-8995-0f705fd8eef8', 'Sprite Medium', 'Crisp, refreshing lemon-lime flavored carbonated soda.', 59.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/Sprite.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'f53513ef-1203-4338-81ec-f27f3e862819', 'Taro Custard Pie', 'Flaky fried pie stuffed with creamy taro and sweet velvety custard.', 51.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2026/07/mcdo-Taro-Custard-Pie-philippines.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'The BCB Meal', 'Beef patty loaded with crispy bacon and cheese in a warm bun. Served with fries and drink.', 277.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-03.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', '60337da8-4f8c-4fc4-834a-4d3a9047465a', 'Triple Cheeseburger Meal', 'Three 100% pure beef patties layered with three slices of melted American cheese, pickles, ketchup, and mustard. Served with fries and drink.', 290.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/mcdo-burgers-price-13.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Twister Fries Regular', 'Crispy, spiral-cut seasoned potato curls bursting with savory flavor.', 99.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/twister-fries-regular.webp', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444449', 'adc70935-b25c-4994-bb48-a7d1e3760b9b', 'Twister Fries Sharing', 'Large sharing portion of crunchy seasoned twister fries.', 199.00, 'https://mcdomenuprices.com.ph/wp-content/uploads/2025/08/twister-fries-sharing.webp', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;


-- Papsys BBQ Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('cat-papsy-1', '44444444-4444-4444-a444-44444444445b', 'FROM THE GRILL', 1),
('cat-papsy-2', '44444444-4444-4444-a444-44444444445b', 'FROM THE FRYER', 2),
('cat-papsy-3', '44444444-4444-4444-a444-44444444445b', 'FROM THE KITCHEN', 3),
('cat-papsy-4', '44444444-4444-4444-a444-44444444445b', 'FROMT THE SIDE', 4),
('cat-papsy-5', '44444444-4444-4444-a444-44444444445b', 'From The Chiller & Dessert', 5)
ON CONFLICT DO NOTHING;

-- Papsys BBQ Menu Items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Paa With 2 Rice', 'Served with rice', 200, 'https://images.deliveryhero.io/image/fd-ph/Products/38946730.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Pecho With 2 Rice', 'Served with rice', 220, 'https://images.deliveryhero.io/image/fd-ph/Products/38946731.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Pork Belly With 2 Rice', 'Served with rice', 224, 'https://images.deliveryhero.io/image/fd-ph/Products/38946734.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Pork BBQ With 2 Rice', '2 Pcs. Served with rice', 198, 'https://images.deliveryhero.io/image/fd-ph/Products/38946732.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Tanguige Steak', 'Served with rice', 306, 'https://images.deliveryhero.io/image/fd-ph/Products/38946735.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Half Bangus With 2 Rice', 'For reference: A half portion of bangus (milkfish) served with two cups of rice.', 182, 'https://images.deliveryhero.io/image/fd-ph/Products/39822657.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Grilled Bangus', 'Fresh and flavorful milkfish marinated in savory spices and grilled to perfection, topped with minced onions and tomatoes for a fresh and tangy finish—juicy meat and crispy skin for a satisfying Filipino favorite.', 296, 'https://images.deliveryhero.io/image/fd-ph/Products/38946726.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Scallops', 'For reference: Tender and juicy scallops.', 240, 'https://images.deliveryhero.io/image/fd-ph/Products/38946733.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Sweet N Sour Meatballs With 2 Rice', 'For reference: Sweet and sour meatballs served with two cups of rice.', 172, 'https://images.deliveryhero.io/image/fd-ph/Products/40145529.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', '3pc Fried Chicken', '3 Pcs. Served with rice', 265, 'https://images.deliveryhero.io/image/fd-ph/Products/38946729.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', '6pc. Fried Chicken', 'For reference: A serving of six crispy and juicy fried chicken pieces, seasoned and deep-fried to golden perfection.', 498, 'https://images.deliveryhero.io/image/fd-ph/Products/40145524.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', '9pc Fried Chicken Bucket', 'For reference: A generous bucket of nine pieces of crispy fried chicken, seasoned and cooked to a golden crisp.', 678, 'https://images.deliveryhero.io/image/fd-ph/Products/40145526.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Calamares', 'For reference: Savor the crispy and flavorful delight of this Calamares, featuring tender squid rings coated in a light and crispy batter.', 292, 'https://images.deliveryhero.io/image/fd-ph/Products/38946723.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Camaron Rebosado', 'For reference: Savor the crispy and succulent goodness of Camaron Rebosado.', 292, 'https://images.deliveryhero.io/image/fd-ph/Products/38946738.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'French Fries', 'For reference: Savor the crispy and golden goodness of this French Fries, freshly fried to perfection and seasoned.', 88, 'https://images.deliveryhero.io/image/fd-ph/Products/38946719.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Chicken Skin', 'For reference only: Experience the indulgent taste of the Chicken Skin, seasoned to perfection with a delightful blend of spices for a mouthwatering treat.', 142, 'https://images.deliveryhero.io/image/fd-ph/Products/38946718.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', '2pc Burger Steak', '2 Pcs. Served with rice', 176, 'https://images.deliveryhero.io/image/fd-ph/Products/38946725.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Adobo Chicken Liver & Gizzard', 'For reference: A savory Filipino dish made with chicken liver and gizzard, marinated in vinegar, soy sauce, and spices.', 210, 'https://images.deliveryhero.io/image/fd-ph/Products/40145578.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Pork Sisig', 'For reference: Indulge in the sizzling flavors of this Pork Sisig.', 298, 'https://images.deliveryhero.io/image/fd-ph/Products/38946727.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Squid Adobo', 'For reference: Squid cooked adobo-style.', 308, 'https://images.deliveryhero.io/image/fd-ph/Products/38946724.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Hamburger', 'For reference: Sink your teeth into the juicy goodness of a classic Hamburger.', 88, 'https://images.deliveryhero.io/image/fd-ph/Products/38946728.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Crispy Chicken Sandwich', 'For reference only: Sandwich made with crispy fried chicken fillet served in between two slices of bread or a bun, typically accompanied by lettuce, tomato, and mayonnaise.', 196, 'https://images.deliveryhero.io/image/fd-ph/Products/40145572.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Fish Kinilaw', 'For reference only: Fresh fish marinated in vinegar and spices.', 322, 'https://images.deliveryhero.io/image/fd-ph/Products/38946739.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Chopsuey', 'For reference: Dive into a colorful and flavorful medley of vegetables with our Chopsuey, featuring a delightful mix of stir-fried veggies, all tossed in a savory sauce for a wholesome and satisfying dish.', 290, 'https://images.deliveryhero.io/image/fd-ph/Products/38946736.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Macau Canton', 'For reference: A flavorful Macau-style Cantonese dish, combining tender meats and vegetables.', 260, 'https://images.deliveryhero.io/image/fd-ph/Products/38946740.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Pancit Guisado', 'For reference only: Delight in the rich flavors of this Pancit Guisado, where perfectly cooked noodles are matched with fresh ingredients!', 260, 'https://images.deliveryhero.io/image/fd-ph/Products/38946720.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Tinola Manok', 'For reference only: A comforting bowl of tinola manok, featuring tender chicken and vegetables in a flavorful broth.', 314, 'https://images.deliveryhero.io/image/fd-ph/Products/38946742.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Baboy', 'For reference: Savory pork dish, classic Filipino flavor.', 314, 'https://images.deliveryhero.io/image/fd-ph/Products/38946747.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Shrimp', 'For reference only: Succulent shrimp prepared in various ways.', 314, 'https://images.deliveryhero.io/image/fd-ph/Products/38946746.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Tanguige', 'For reference: A delicate and flavorful tanguige (mackerel) dish.', 338, 'https://images.deliveryhero.io/image/fd-ph/Products/38946745.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Bangus', 'For reference only: Enjoy the delectable flavors of the Bangus, marinated in a special blend of herbs and spices.', 314, 'https://images.deliveryhero.io/image/fd-ph/Products/38946748.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Rice 1 Cup', 'For reference: A serving of one cup of steamed rice, perfectly cooked and fluffy.', 42, 'https://images.deliveryhero.io/image/fd-ph/Products/40145589.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Rice 2 CUP', 'For reference: A serving of two cups of steamed rice, fluffy and light.', 68, 'https://images.deliveryhero.io/image/fd-ph/Products/38946722.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Chicken Oil', 'Chix oil', 7, 'https://images.deliveryhero.io/image/fd-ph/Products/102375438.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'HALO-HALO Overload', 'For reference: A refreshing, chilled dessert with crushed ice, sweet beans, and fruits for a delightful treat.', 198, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/l1mu/product/69933109/99e74348-aa16-4771-a34a-0918b36306b7.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Mango Float Overload with Fresh Mango', 'Mango Float Overload with Fresh Mango', 228, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/l1mu/PRODUCT/0a882f29-b493-48b5-b61d-d8a2265399a5.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Mango Float Overload', 'Mango Float Overload', 215, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/l1mu/PRODUCT/cb40a9fb-a223-40ec-ba94-737e2b9190c8.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Mango Float', 'For reference only: Experience tropical temptation in this sweet treat featuring juicy mangoes and rich cream!', 108, 'https://images.deliveryhero.io/image/fd-ph/Products/38946753.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Leche Flan', 'For reference: A classic Filipino dessert made with rich and creamy caramelized custard.', 102, 'https://images.deliveryhero.io/image/fd-ph/Products/38946756.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'CANNED SODA & JUICES FPANDA', 'For reference: A selection of canned sodas and juices.', 88, 'https://images.deliveryhero.io/image/fd-ph/Products/40144814.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Bottled Water', 'For reference only: Perfect for on-the-go or as a referencereshment with any meal.', 46, 'https://images.deliveryhero.io/image/fd-ph/Products/38946765.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Avocado Shake', 'Avocado Shake', 162, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/l1mu/PRODUCT/0879e691-3622-41bd-a48d-ccdfaeac7267.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Apple Carrot', 'For reference: Fresh apple and carrot juice.', 162, 'https://images.deliveryhero.io/image/fd-ph/Products/38946768.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Apple Cucumber', 'For reference: A refreshing drink with the flavors of apple and cucumber.', 162, 'https://images.deliveryhero.io/image/fd-ph/Products/38946769.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Lychee', 'For reference: Enjoy the refreshing taste of Lychee.', 162, 'https://images.deliveryhero.io/image/fd-ph/Products/38946773.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Mango', 'For reference: Delight in the sweet and juicy flavors of this Mango, offering a tropical taste!', 162, 'https://images.deliveryhero.io/image/fd-ph/Products/38946774.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Mango Green', 'For reference: A refreshing mango green tea, blending the sweetness of ripe mango.', 162, 'https://images.deliveryhero.io/image/fd-ph/Products/38946775.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444445b', 'b4f34382-5f86-45ee-ada3-61959dc94323', 'Strawberry', 'For reference only: It offers a sweet and tangy taste that adds a burst of fruity flavor that is sure to delight.', 162, 'https://images.deliveryhero.io/image/fd-ph/Products/38946778.jpg', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Parola Seaview Restaurant Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('532987c3-038d-4083-896d-5e3e68c87f7d', '44444444-4444-4444-a444-444444444459', 'Parola Seafood & House Specialties', 1),
('b45449f6-a5d0-46a7-82f2-b7c71b57ca62', '44444444-4444-4444-a444-444444444459', 'Pork, Beef & Meat Specialties', 2),
('dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', '44444444-4444-4444-a444-444444444459', 'Soups, Noodles & Native Dishes', 3),
('d66da36b-dd99-4c24-afea-0edb0d53d352', '44444444-4444-4444-a444-444444444459', 'Parola Seafood Bilao & Group Sets', 4),
('7475bafb-7505-4d38-97e4-d9c34056aa41', '44444444-4444-4444-a444-444444444459', 'Rice & Side Extras', 5),
('d984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', '44444444-4444-4444-a444-444444444459', 'Desserts, Shakes & Drinks', 6)
ON CONFLICT DO NOTHING;

-- Parola Seaview Restaurant Menu Items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Baked Scallops with Cheese & Garlic', 'Fresh local Bantayan scallops baked to golden perfection with melted butter, rich garlic, and cheddar cheese.', 295.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU2SeIGTvOEIiD7TNoKqF_7o0tvYvvr98NZbYL50OJUA&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Crispy Calamares', 'Tender squid rings lightly battered and deep-fried to a crisp crunch, served with homemade tartar dipping sauce.', 285.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReaLRSnvc46AJDHyMj97jDsg11bLV5jFsJWM8UV5FPGA&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Garlic Butter Shrimp', 'Plump succulent prawns tossed in savory golden garlic butter sauce and fresh island spring onions.', 360.00, 'https://www.thepeachkitchen.com/wp-content/uploads/2023/12/Garlic-Butter-Shrimp-with-Ketchup2.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Grilled Tuna Panga (Seaside Grill)', 'Charcoal-grilled premium tuna jaw glazed in sweet-savory calamansi soy marinade and chili garlic.', 395.00, 'https://www.thepeachkitchen.com/wp-content/uploads/2016/09/Grilled-Tuna-Panga.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Tuna Pomelo Kinilaw', 'Fresh raw yellowfin tuna cubes ceviche cured in native coconut vinegar, ginger, chili, and sweet Davao pomelo pulp.', 275.00, 'https://kusinasecrets.com/wp-content/uploads/2025/04/u3317447599_Homemade_Filipino_Tuna_Kinilaw_in_a_white_ceramic_8957013c-ba69-4769-9a57-4b16995438df_2-500x500.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Grilled Stuffed Squid (Inihaw na Pusit)', 'Whole ocean squid stuffed with diced tomatoes, onions, and native herbs, grilled over open charcoal embers.', 330.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg2emjnvjFE_dRW9Q0SrRjJP6er1ZTRa91_fUHlv5lOJfziQFiPHt4DyA&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Sweet & Sour Lapu-Lapu', 'Crispy fried local grouper fillet smothered in vibrant sweet and sour bell pepper sauce with pineapple chunks.', 420.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFAwlbmBbi6Slexl19wcrg8DH6XvIGE2f4kvVfpvhmqM0_X1ftM0IB8aY&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '532987c3-038d-4083-896d-5e3e68c87f7d', 'Sizzling Gambas al Ajillo', 'Spanish-Filipino style spicy sautéed shrimp bubbling on a cast-iron skillet with olive oil, lots of toasted garlic, and chili peppers.', 320.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKDiLne_EaFS9DH_udyhsgNJlB2u4jQ-9U-TLRlV3rSA&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Parola Signature Crispy Pata', 'Deep-fried pork knuckle with blistered crackling skin and juicy tender meat, served with spiced soy vinegar dip.', 695.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWb4Hhn5AXUwTBjVKFCobvoPbKe_p6RD41dsZHLUSUyA&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Sizzling Pork Sisig with Egg', 'Minced pork cheeks and crispy mask seasoned with calamansi, onions, and chili peppers, topped with a fresh farm egg.', 265.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9xn7LNABu1ygwBh0BGh1pfNSOqeXOYWg9R8LRMgQ6zQ&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Signature Tinapa Sisig', 'Parola specialty smoked fish flakes sautéed with aromatics, mayonnaise, and chili on a sizzling plate.', 245.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFTq1nFAdDhUwI5x4S80vbceMXo3M16tZr9G_nwvEmnw&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Beef Kare-Kare with Bagoong Alamang', 'Tender beef shank and tripe stewed in thick savory peanut sauce with string beans, eggplant, pechay, and shrimp paste.', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5nnhGQ2QW8hYwsMqKKjxrO8xNA6OqC5lC3BtvVwylSw&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Lechon Kawali', 'Golden crunchy pork belly slabs fried to crisp perfection, accompanied by homemade liver gravy and spiced vinegar.', 330.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0B6fkOlijN29x4DYrvsedu6knlm8PKkqd3XT4NrpJ9Q&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Crispy Buttered Fried Chicken (Whole)', 'Deep-fried whole marinated chicken coated in aromatic melted garlic butter and golden seasonings.', 380.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8Xg0gDlZ7xBtAPhXaHZKBWjD3vkKK1Y6Z_qBJtVqmQw&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'b45449f6-a5d0-46a7-82f2-b7c71b57ca62', 'Pork BBQ Skewers (4 Sticks)', 'Tender skewered pork shoulder glazed in sweet Filipino banana ketchup and calamansi barbecue basting.', 195.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq-oWjQVFJoPIwFsyCFFWkD-e1KPU-7bbem-fwwwxSVQ&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Sinigang na Isda sa Bayabas & Sampalok', 'Fresh island fish simmered in tangy tamarind and guava broth with kangkong, radish, tomatoes, and long green chili.', 345.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXGSagoTqcbxLBelDoDOjIx4BZlvLjZ-rivTYhxJmrmpz2HpCywWdLeKo&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Nilarang na Tanguige / Bakasi', 'Authentic Cordova-style sour fish stew prepared with fermented black beans (tausi), ginger, tomatoes, and lemongrass.', 320.00, 'https://pbs.twimg.com/media/EhYyrC2XsAAwRAl.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Sinigang na Baboy', 'Tender pork ribs simmered in sour tamarind broth loaded with garden kangkong, taro root, eggplant, and string beans.', 340.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYo5JcyksRbq4HGY8_KLL1PTvs_yS0DUym6a5CPN7fWlsh9yw_kGest6U&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Special Bulalo Soup with Bone Marrow', 'Slow-boiled beef shank soup with rich melted bone marrow, sweet corn on the cob, pechay, and whole peppercorns.', 430.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi0CBbkVlHJ124l82AVoB4b2qdYbJ_-Yyi28hM--zI6g&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Native Tinolang Manok', 'Free-range native chicken soup infused with fresh ginger broth, green papaya slices, dahon ng sili, and lemongrass.', 310.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu8-32NmLQG5KS6zz-5TwSsSX-QFdNlG5rRqc4t7MpTQ&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Seafood Bam-i (Cebuano Pancit)', 'Stir-fried medley of egg noodles (canton) and glass vermicelli (sotanghon) with shrimp, squid, pork strips, and vegetables.', 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLsJYobXBAI8p9kc1NAy-IRnSA7rS65Bi174tPWEhTbg&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Special Pancit Canton Guisado', 'Savory stir-fried flour noodles topped with shrimp, chicken liver, tender pork, snow peas, carrots, and cabbage.', 240.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu_Q2YSY1IUYdvIKtez-RDpLL_DK_IwBMKeOrl5YtOeA&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'dcf35cc2-21bc-49f0-a4dc-b0b75a4ac0c5', 'Chopsuey Guisado with Seafood', 'Crisp garden vegetables including broccoli, cauliflower, carrots, young corn, and bell peppers sautéed with fresh shrimp and squid.', 230.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgZjroHA2g6Y5qnqzj-yUjPyAohQ7t81va7fG3ZFNAJeKXsYrF-UK6b4k&s=10', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd66da36b-dd99-4c24-afea-0edb0d53d352', 'Parola Grand Seafood Bilao (Good for 4-6)', 'Signature seaside feast platter with Baked Scallops, Grilled Squid, Garlic Butter Shrimp, Crispy Calamares, Tuna Kinilaw, and Garlic Rice.', 1350.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd66da36b-dd99-4c24-afea-0edb0d53d352', 'Barkada Sunset Fiesta Set (Good for 4-5)', 'Crispy Pata, Pork Sisig, Buttered Chicken, Sinigang na Isda, Garlic Rice Platter, and 1 Pitcher of House Iced Tea.', 1650.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd66da36b-dd99-4c24-afea-0edb0d53d352', 'Family Seaview Boodle Platter (Good for 6-8)', 'Boodle fight banquet on banana leaves with Inihaw na Pusit, Grilled Tuna Belly, Pork BBQ skewers, Lechon Kawali, Salted Eggs, Ensaladang Talong, and Unlimited Garlic Rice.', 2150.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '7475bafb-7505-4d38-97e4-d9c34056aa41', 'Garlic Butter Rice Platter (Big Bowl)', 'Fragrant jasmine rice stir-fried with lots of golden toasted garlic crisps and creamy butter.', 160.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '7475bafb-7505-4d38-97e4-d9c34056aa41', 'Seafood Fried Rice Platter', 'Wok-tossed fried rice with chopped shrimp, squid bits, scrambled egg, and green peas.', 240.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '7475bafb-7505-4d38-97e4-d9c34056aa41', 'Steamed White Jasmine Rice Platter', 'Platter of steaming fluffy white jasmine rice, good for 4-5 persons.', 120.00, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', '7475bafb-7505-4d38-97e4-d9c34056aa41', 'Ensaladang Talong with Salted Egg & Tomatoes', 'Charred grilled eggplant with diced fresh tomatoes, red onions, and cured salted duck eggs in calamansi vinaigrette.', 150.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'Parola Halo-Halo Supreme with Ice Cream', 'Classic crushed ice dessert loaded with ube halaya, sweetened bananas, nata de coco, leche flan, pinipig, and a scoop of creamy ube ice cream.', 145.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'Fresh Ripe Mango Shake', 'Refreshing blended shake made with sweet ripe Cebu mangoes and chilled milk.', 125.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'Fresh Young Coconut (Buko)', 'Fresh whole young coconut served chilled with natural sweet coconut water and soft meat.', 95.00, 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'Buko Pandan Shake', 'Creamy blended young coconut shake flavored with fragrant pandan leaves and jelly pearls.', 120.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'Traditional Creamy Leche Flan', 'Rich and silky steamed caramel egg custard made with pure egg yolks and condensed milk.', 95.00, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'House Iced Tea Pitcher (1.5L)', 'Freshly brewed sweet calamansi iced tea served ice-cold in a family sharing pitcher.', 160.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444459', 'd984b38a-b6e5-4ce2-bf7b-cda91a5f1d7e', 'San Miguel Pale Pilsen / Light (330ml)', 'Chilled iconic Filipino beer bottle, perfect companion for sunset seaside seafood dining.', 85.00, 'https://images.unsplash.com/photo-1608270119335-59427b03b174?auto=format&fit=crop&w=600&q=80', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;


-- ============================================================================
-- The Latte Cafe - Cordova (Categories & Menu Items from Foodpanda)
-- ============================================================================

-- The Latte Cafe Restaurant
INSERT INTO restaurants (
  id, owner_id, name, slug, description, address, barangay,
  latitude, longitude, phone, price_range, services_offered,
  status, verified_by, verified_at, avg_rating, review_count
) VALUES
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'e612bfa3-8ce5-4983-992a-5fac4e874111',
 'The Latte Cafe', 'the-latte-cafe-mtvn5h2j',
 'An aesthetic, pet-friendly neighborhood coffee shop serving specialty brews, fresh smoothies, pasta, burgers and all-day breakfast.',
 'The Latte Cafe, Andalucia Crest, Gabi, Cordova', 'Gabi', 10.26556, 123.96443, '0910 618 1758',
 'moderate', ARRAY['dine_in','takeout','delivery']::service_type[], 'verified',
 '11111111-1111-1111-a111-111111111111', now(), 5.0, 17)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  barangay = EXCLUDED.barangay,
  phone = EXCLUDED.phone;

-- The Latte Cafe Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('4a569bf8-034b-454e-a29c-9a45f398f9d3', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Coffee', 1),
('c52f453a-cc8e-4d5a-bbf5-7f034643928f', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Smoothies', 2),
('bfe84606-4c58-435a-abf7-8907eed89f35', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Burgers', 3),
('0f7a8653-d1ef-4231-975a-c20843f714d2', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Pasta', 4),
('0bc23645-2deb-4495-afa6-8b460f5d862f', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'All Day Breakfast', 5),
('2b924fa7-e12d-4999-8cd1-d8b20501287f', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Sides', 6),
('f5f5c396-057b-415b-97d4-3aeee964a463', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Sodas', 7),
('eebb4fa4-0927-42aa-b502-982ec37bad2e', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Fresh Lemonade', 8),
('8bf4a73a-9dc8-4a28-a3fd-e9858feef2d7', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Matcha Latte', 9),
('941d3d29-72b6-4c2d-9400-65e07cc463a4', '9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'Non-coffee Ice Blended', 10)
ON CONFLICT DO NOTHING;

-- The Latte Cafe Menu Items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '4a569bf8-034b-454e-a29c-9a45f398f9d3', 'Spanish Latte', 'Espresso, steamed milk sweetened with a touch of condensed milk for a creamy & smooth finish', 195, 'https://images.deliveryhero.io/image/fd-ph/Products/93164950.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '4a569bf8-034b-454e-a29c-9a45f398f9d3', 'Americano', 'A straightforward blended of espresso, hot water, offering a clean & bold coffee flavor', 165, 'https://images.deliveryhero.io/image/fd-ph/Products/93164944.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '4a569bf8-034b-454e-a29c-9a45f398f9d3', 'Cafe Latte', 'Smooth espresso combined with steamed milk & a light layer of foam for a balanced coffee experience', 175, 'https://images.deliveryhero.io/image/fd-ph/Products/93164945.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '4a569bf8-034b-454e-a29c-9a45f398f9d3', 'Caramel Latte', 'A blended of espresso, steamed milk, rich caramel syrup & finished with a creamy texture', 195, 'https://images.deliveryhero.io/image/fd-ph/Products/93164947.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '4a569bf8-034b-454e-a29c-9a45f398f9d3', 'Mocha Latte', 'Espresso, steamed milk meet with decadent chocolate syrup for a rich & coffee-chocolate combination', 195, 'https://images.deliveryhero.io/image/fd-ph/Products/93164948.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '4a569bf8-034b-454e-a29c-9a45f398f9d3', 'White Chocolate Latte', 'A delightful mixed of espresso, steamed milk & sweet white chocolate syrup', 195, NULL, true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'c52f453a-cc8e-4d5a-bbf5-7f034643928f', 'Stay Hydrated', 'Mango, Pineapple, Watermelon, Oatginger, Tumeric, Apple, Honey', 170, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/b4ec05ec-d2e5-4528-8c2e-9042f9c23be4.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'c52f453a-cc8e-4d5a-bbf5-7f034643928f', 'Love Your Heart', 'Banana, Apple, Cucumber, Green Lettuce, Honey, Calamansi', 170, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/109155559/6e62af5a-08ad-4aa9-af56-861e4bf7bc27.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'c52f453a-cc8e-4d5a-bbf5-7f034643928f', 'Avoid Stress', 'Banana, Pineapple, Pechay, Cucumber, Apple, Mango', 170, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/aeb1eb89-bb66-4065-8bf8-9e80463d3037.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'c52f453a-cc8e-4d5a-bbf5-7f034643928f', 'Keep Healthy Tummy', 'Banana, Strawberry, Beets, Lemon zest, Lemon juice, Chia Seeds', 179, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/c5b67617-bede-4c88-a130-be563fda10dc.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'c52f453a-cc8e-4d5a-bbf5-7f034643928f', 'Be Strong', 'Mango, Cucumber, Moringa, Honey, Lemonsito, Apple, Ginger, Lettuce, Pĩna', 170, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/109155591/70d9af1f-7af8-4cdb-b944-d412fa7810e6.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'bfe84606-4c58-435a-abf7-8907eed89f35', 'Cheeseburger Smash', 'A juicy smash-grilled beef patty topped with melted cheese, caramelized onion and our signature sauce on a toasted bun', 400, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/52f1608c-20c7-4086-a635-3680478a2da1.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'bfe84606-4c58-435a-abf7-8907eed89f35', 'Fried Chicken Burger', 'Crispy fried chicken fillet, Fresh lettuce, Juicy tomato and our special sauce, all tucked in a soft toasted bun.', 390, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/4d44fd23-380c-45fb-97e8-a958c1c9d510.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0f7a8653-d1ef-4231-975a-c20843f714d2', 'Aglio Olio with Bacon', 'Al dente pasta tossed in garlic-infused olive oil, topped with crispy bacon and a hint of fresh chopped parsley and chili for perfect flavor kick,', 300, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/109156151/f404876b-f526-4605-a621-9f91e355c366.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0f7a8653-d1ef-4231-975a-c20843f714d2', 'Penne Carbonara', 'Creamy filipino-style carbonara made with penne pasta, crispy bacon, and a rich savory sauce.', 380, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/5b830c2a-d222-433f-955c-79769dfba833.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0f7a8653-d1ef-4231-975a-c20843f714d2', 'Spaghetti Bolognese', 'Al dente spaghetti coated in a hearty bolognese sauce made with slow-cooked ground beef, tomatoes, and aromatic herbs.', 330, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/8f43e8cd-07c4-4e50-83a4-d3710a299a08.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0f7a8653-d1ef-4231-975a-c20843f714d2', 'Spanish Sardines Pasta', 'Spaghetti tossed in olive oil, garlic, fresh basil and premium mild spicy spanish sardines', 380, NULL, true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0bc23645-2deb-4495-afa6-8b460f5d862f', 'Beef Tapa', 'Flavorful, marinated beef tapa paired with garlic rice and sunny side up egg', 340, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/4a8a4fa5-95e8-4fe3-90e9-1953a788d2a0.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0bc23645-2deb-4495-afa6-8b460f5d862f', 'Pork Adobo Flakes', 'Shredded pork adobo fried until crispy, paired with garlic rice and sunny side up egg', 320, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/51ad823f-4c38-404e-ba41-5b3c23c335ad.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0bc23645-2deb-4495-afa6-8b460f5d862f', 'Lumpia Shanghai', 'Golden, crunchy lumpia shanghai paired with garlic rice and sunny side up egg', 360, NULL, true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '0bc23645-2deb-4495-afa6-8b460f5d862f', 'Bangus', 'Fried bangus (milkfish), served with garlic fried rice, sunny-side-up egg, sliced tomato, and cucumber. ', 350, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/2e9c310e-72b4-4342-b42e-950d87f0d58d.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '2b924fa7-e12d-4999-8cd1-d8b20501287f', 'Chicken Fingers', 'Juicy chicken strips coated in a crunchy flavorful crust, seasoned with our special mixed spices ', 330, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/7834174e-5eaa-43ec-b2aa-9415a56591e4.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '2b924fa7-e12d-4999-8cd1-d8b20501287f', 'Mozzarella Dice', 'Golden, crispy fried mozzarella cubes with gooey melty center, seasoned with spices, paired with tomato dip', 480, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/4b523405-a6de-4d3a-8978-1182c0999a49.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '2b924fa7-e12d-4999-8cd1-d8b20501287f', 'French Fries', 'Golden, crispy french fries', 170, NULL, true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'f5f5c396-057b-415b-97d4-3aeee964a463', 'Passionfruit Soda', 'A zesty fusion of passionfruit and sparkling soda with nata sinker, poured over ice.', 220, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/58d65913-c35a-4f5b-a655-e4953834d9b0.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'f5f5c396-057b-415b-97d4-3aeee964a463', 'Lychee Soda', 'A light and refreshing blend of sweet lychee syrup, sparkling soda, and nata sinkers, served over ice. ', 220, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/0aec05ab-ec3f-443c-b07a-c8dfe72123a4.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'f5f5c396-057b-415b-97d4-3aeee964a463', 'Strawberry Soda', 'A refreshing blend of strawberry syrup, sparkling soda, and nata sinkers, served over ice.', 220, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/ff73aa2b-486e-470a-9996-0574b87ca544.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', 'eebb4fa4-0927-42aa-b502-982ec37bad2e', 'Fresh Lemonade', 'A classic, thirst-quenching blend of freshly squeezed lemons, cold or hot water, and just right touch of sweetness.', 185, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/be3cd8a2-aa82-43c2-8a34-9c153fc27f9b.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '8bf4a73a-9dc8-4a28-a3fd-e9858feef2d7', 'Matcha Latte (12oz)', 'A smooth creamy blend of matcha and milk, whisked to perfection for a lightly sweet flavor.', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/34e13f4c-eac4-4e6b-973f-9a6483cbfbe9.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '8bf4a73a-9dc8-4a28-a3fd-e9858feef2d7', 'Matcha Latte (16oz)', 'A smooth creamy blend of matcha and milk, whisked to perfection for a lightly sweet flavor', 255, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/c4bfbb85-ef45-4550-a5d0-f295947829bb.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Coffee Jelly Ice Blended', 'coffee blended to icy perfection with soft, chewy coffee jelly and whipped cream', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/64789eac-daf6-463b-9b89-481ac96e2564.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Salted Caramel Ice Blended', 'a blended beverage made with milk, and ice, combined with the sweet and salty flavors of salted caramel syrup, and typically topped with whipped cream and a caramel drizzle.', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/100356740/04674f98-00f3-4d88-8f2e-ecddf6db6f60.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Strawberry Ice Blended', 'a refreshing, icy drink made from blended strawberries, ice, and creamy milk.', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/100356743/d1187533-869e-4180-a445-87d5f32964f7.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Cookies and Cream Ice Blended', 'The combination of sweet, creamy vanilla, coffee, and chocolate cookie pieces', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/8ee7ce6f-a06f-47f3-a507-3a2a32c89030.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Mocha Ice Blended', 'A refreshing blended beverage with rich chocolate, & a creamy texture', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/100233752/57e30eae-2d9b-4c38-b5e8-4fc244400078.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Java Chip Ice Blended', 'A cool, blended beverage featuring, chocolate chips, a smooth & creamy consistency', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/100233753/6e6fc486-7b5b-44f7-ab12-d89a8f2b1ec6.jpg', true, ARRAY[]::text[]),
('9bd735b4-1ee0-4dd9-a498-157f6007cd80', '941d3d29-72b6-4c2d-9400-65e07cc463a4', 'Pistachio Ice Blended', 'Creamy ice blended drink with rich pistachio flavor topped with whipped cream', 235, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/nsz5/product/9aeea749-b755-420f-8700-8bb677e0508e.jpg', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Eat n Repeat Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('119887f5-ed7a-4be7-a25d-654b78f10905', '44444444-4444-4444-a444-444444444446', 'Coffee & Espresso', 1),
('b8bcce17-d0f6-427a-abb8-eec8c9d609fe', '44444444-4444-4444-a444-444444444446', 'Milktea & Boba', 2),
('e1140759-f6d6-4fb2-b8e2-cc38b8daa51d', '44444444-4444-4444-a444-444444444446', 'Rice Bowls & Meals', 3),
('fe7f3ed4-6724-425d-80f6-c0721770142b', '44444444-4444-4444-a444-444444444446', 'Pastries & Desserts', 4),
('13a2968b-b7b5-41f4-b7bf-8f3bc9c8024f', '44444444-4444-4444-a444-444444444446', 'Sides & Bites', 5)
ON CONFLICT DO NOTHING;

-- Eat n Repeat Menu Items (from eatnrepeat.online)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-444444444446', '119887f5-ed7a-4be7-a25d-654b78f10905', 'House Special Latte', 'Silky double shot espresso with velvety steamed milk and vanilla bean', 145.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444446', '119887f5-ed7a-4be7-a25d-654b78f10905', 'Cordova Cold Brew', '16-hour slow-steeped single origin beans served over crystal ice', 135.00, 'https://images.unsplash.com/photo-1461023058943-07cb14a60039?w=600&auto=format&fit=crop', true, ARRAY['vegan','vegetarian']::text[]),
('44444444-4444-4444-a444-444444444446', 'b8bcce17-d0f6-427a-abb8-eec8c9d609fe', 'Uji Matcha Milktea', 'Creamy authentic Japanese matcha topped with cheese foam', 139.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444446', 'b8bcce17-d0f6-427a-abb8-eec8c9d609fe', 'Brown Sugar Boba Milk', 'Warm brown sugar tapioca pearls with cold fresh farm milk', 149.00, 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444446', 'e1140759-f6d6-4fb2-b8e2-cc38b8daa51d', 'Signature Chicken Inasal Rice Bowl', 'Flame-grilled marinated chicken thigh with annatto rice and spiced vinegar', 189.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444446', 'e1140759-f6d6-4fb2-b8e2-cc38b8daa51d', 'Spam & Egg Comfort Bowl', 'Thick slice fried Spam, sunny side egg over garlic fried rice', 165.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444446', 'fe7f3ed4-6724-425d-80f6-c0721770142b', 'French Butter Croissant', 'Flaky golden multi-layered croissant baked fresh every morning', 95.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444446', '13a2968b-b7b5-41f4-b7bf-8f3bc9c8024f', 'Garlic Parmesan Truffle Fries', 'Golden crispy skin-on fries tossed in garlic parmesan & truffle oil', 119.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop', true, ARRAY['vegetarian']::text[])
ON CONFLICT DO NOTHING;

-- STUFFED N' FRIED Cordova Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('d65b05ca-45ef-4df8-9db7-2cb826b47ce3', '44444444-4444-4444-a444-444444444448', 'Sooo Sulit Meals', 1),
('f47a527a-dde5-4046-bdc1-8d53e8e69caf', '44444444-4444-4444-a444-444444444448', 'Pork Section', 2),
('9bf18ca1-9ad8-4935-91ec-e414bd064510', '44444444-4444-4444-a444-444444444448', 'Ad-Ons', 3)
ON CONFLICT DO NOTHING;

-- STUFFED N' FRIED Cordova Menu Items (from Foodpanda)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', 'Classic meal 1', 'Qtr slice of batter-fried chicken, 3 pcs puso, 1oz garlic vinegar & 1 bottled water or coke swakto', 219.00, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/9695ec80-4750-4a81-8319-0babb1b74161.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', 'Ultimate meal 1', 'Qtr slice of batter-fried chicken, 4 pcs puso, 2pcs ngohiong, 1oz garlic vinegar & 1 bottled water or coke swakto', 249.00, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/dfd0482e-0732-4a41-9f00-281bcddbb20e.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', 'Half Batter-fried chicken', 'Half crispy batter-fried chicken with a savory, juicy inside, perfect for sharing.', 279.00, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/2bf40ef6-f921-4288-922c-dfaae8dd29c2.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', 'Family platter', '1 Batter-fried whole chicken, 520g Lechon kawali, 3pcs ngohiong, 12pcs puso, garlic vinegar, 1.5L coke', 1299.00, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/11bb2f2b-388e-409b-b52a-9f1294ae65b3.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', 'Spicy Batter-fried Whole Chicken', 'Crispy, spicy batter-fried whole chicken with bold flavors and tender meat', 539.00, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/a76336a5-7280-470f-9df6-51e2ded76dcf.jpg', true, ARRAY['spicy']::text[]),
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', 'Barkada Meal 1', '1 Whole batter-fried chicken, Garlic vinegar, 8pcs puso & 1 Coke 1.5 liter', 562.00, 'https://images.deliveryhero.io/image/fd-ph/Products/72881538.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'd65b05ca-45ef-4df8-9db7-2cb826b47ce3', '1 Whole Batter-fried Chicken', 'Marinated with our own 15 mixed spices, Stuffed with fresh onions, garlic, lemon grass and spring onions. Super crunchy outside and juicy inside', 499.00, 'https://images.deliveryhero.io/image/fd-ph/Products/72881539.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'f47a527a-dde5-4046-bdc1-8d53e8e69caf', 'Spicy Crispy Fried lechon kawali', 'Crispy, spicy fried lechon kawali with flavorful seasoning and a smoky crunch', 469.00, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/c74973f2-2d45-445c-b7a7-0966db31ede4.jpg', true, ARRAY['spicy']::text[]),
('44444444-4444-4444-a444-444444444448', 'f47a527a-dde5-4046-bdc1-8d53e8e69caf', 'Crispy Fried Lechon Kawali', 'Pork Belly Deep-fried until crisp and golden brown, yet soft and tender inside. Served with Garlic Vinegar on the side.', 429.00, 'https://images.deliveryhero.io/image/fd-ph/Products/72881534.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'f47a527a-dde5-4046-bdc1-8d53e8e69caf', 'Barkada Meal 2', '780g Lechon kawali, 8pcs puso, garlic vinegar, 1.5L coke', 849.00, 'https://images.deliveryhero.io/image/fd-ph/products/72881535.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'f47a527a-dde5-4046-bdc1-8d53e8e69caf', 'Classic Meal 2 (CM2)', '260g Lechon kawali, 3pcs puso, garlic vinegar, swakto', 279.00, 'https://images.deliveryhero.io/image/fd-ph/Products/78151007.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', 'f47a527a-dde5-4046-bdc1-8d53e8e69caf', 'Ultimate Meal 2 (UM2)', '260g Lechon kawali, 2pcs ngohiong, 4pcs puso, garlic vinegar, swakto', 329.00, 'https://images.deliveryhero.io/image/fd-ph/Products/78151051.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', '9bf18ca1-9ad8-4935-91ec-e414bd064510', 'Puso', '1pc puso or hanging rice', 10.00, 'https://images.deliveryhero.io/image/fd-ph/Products/89135816.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444448', '9bf18ca1-9ad8-4935-91ec-e414bd064510', 'Special Ngohiong', '1pc special ngohiong, garlic vinegar', 29.00, 'https://images.deliveryhero.io/image/fd-ph/Products/89135869.jpg', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;


-- Taytayan Pinoy Restaurant Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('d9de3d6b-d24c-4f40-b134-e2fe282bee71', '44444444-4444-4444-a444-444444444447', 'Short Orders & Appetizers', 1),
('77718c1e-b5de-4818-9d4b-f18a06da0c21', '44444444-4444-4444-a444-444444444447', 'All Day Breakfast', 2),
('508cf884-8c71-4149-acc0-94696091e12f', '44444444-4444-4444-a444-444444444447', 'Native Soups & Broths', 3),
('1cd60931-8dd3-46ff-8b52-355ce6360465', '44444444-4444-4444-a444-444444444447', 'Manok Bisaya (Native Chicken)', 4),
('9a780d84-aa7c-4eba-9d35-5dd4858e977f', '44444444-4444-4444-a444-444444444447', 'Seafood Specialties', 5),
('9a4fc497-d4cb-4531-a351-9e571dc5b8a9', '44444444-4444-4444-a444-444444444447', 'Kanding (Goat Dishes)', 6),
('41f98936-5816-4f5d-adf3-b16c78229834', '44444444-4444-4444-a444-444444444447', 'Charcoal Grilled & BBQ', 7),
('d9429b73-a5a3-4441-9eb1-df367a3403f2', '44444444-4444-4444-a444-444444444447', 'Meat & Pork Dishes', 8),
('24dda49e-7c7b-48df-995f-8247f434b65c', '44444444-4444-4444-a444-444444444447', 'Rice & Extras', 9),
('517d21ac-e4e8-4def-8681-c7cdb29390a5', '44444444-4444-4444-a444-444444444447', 'Beverages & Cold Drinks', 10),
('a201b274-bf37-4fa1-a6c7-5e9a16008fc3', '44444444-4444-4444-a444-444444444447', 'Coffee', 11)
ON CONFLICT DO NOTHING;

-- Taytayan Pinoy Restaurant Menu Items (from Foodpanda)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'chicharon bulaklak', 'For reference: Crispy chicharon bulaklak with a rich, savory bite.', 312.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548739.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'pancit canton/gisado', 'For reference: Stir-fried noodles with vegetables, meat, and savory sauce, a flavorful Filipino comfort dish.', 324.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548742.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'french fries', 'For reference: Golden and crispy potato fries.', 90.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548750.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'chop suey', 'For reference: Chop suey with stir-fried vegetables.', 336.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548755.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'pinakbet', 'For reference: Flavorful pinakbet with a mix of fresh vegetables.', 276.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548763.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'spring rolls', 'For reference only: Crispy fried or fresh rolls filled with vegetables and sometimes meat.', 144.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548766.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'lomi', 'For reference: Enjoy a hearty bowl of Filipino-style noodle soup with tender meat, vegetables, and a savory broth.', 336.00, 'https://images.deliveryhero.io/image/fd-ph/products/64548772.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'calamares', 'For reference: Delicious deep-fried squid rings.', 408.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548774.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'lumpia shanghai', 'For reference only: Delight in the crispy and flavorful goodness of Lumpia Shanghai!', 324.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548778.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'kropek', 'For reference only: Dive into a delightful snacking experience with the Kropek, the light and airy shrimp chips that pack a punch of umami goodness.', 70.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548784.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9de3d6b-d24c-4f40-b134-e2fe282bee71', 'eggplant salad', 'For reference: Smoky and tangy eggplant salad with fresh flavors.', 216.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548787.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', '77718c1e-b5de-4818-9d4b-f18a06da0c21', 'chorizo binungkag', 'For reference: Spicy sausage mixed with eggs, served with rice and vegetables for a hearty meal.', 264.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '77718c1e-b5de-4818-9d4b-f18a06da0c21', 'corned beef', 'For reference: A savory, tender corned beef dish with a rich familiar taste.', 264.00, 'https://images.deliveryhero.io/image/fd-ph/products/64548791.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'utan bisaya', 'For reference: Hearty vegetable soup with a rich flavor.', 276.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548748.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'balbacua', 'For reference only: Indulge in the authentic taste of the Balbacua, a culinary delight that showcases the unique blend of local herbs and spices.', 384.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548758.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'cansi', 'For reference: Sour and savory with a deeply comforting beef broth.', 540.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'sinigang shrimp', 'For reference only: Sinigang shrimp, a flavorful and tangy seafood soup.', 420.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'sinigang pork', 'For reference: Pork in sour tamarind soup.', 408.00, 'https://images.deliveryhero.io/image/fd-ph/products/64548785.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'tambayan', 'For reference: A savory broth with tender meat, vegetables, and aromatic spices, perfect for sharing.', 276.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548786.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'linarang bakasi', 'For reference: Rich, savory, zesty, and satisfying.', 228.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '508cf884-8c71-4149-acc0-94696091e12f', 'pocher0', 'For reference: A flavorful broth with tender meat, vegetables, and aromatic herbs, served hot.', 648.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548793.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '1cd60931-8dd3-46ff-8b52-355ce6360465', 'deep fried', 'For reference: Crispy fried chicken served with a flavorful dipping sauce and traditional sides.', 564.00, 'https://images.deliveryhero.io/image/fd-ph/products/64548746.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '1cd60931-8dd3-46ff-8b52-355ce6360465', 'tinola', 'For reference only: A comforting Filipino soup made with chicken, green papaya, and leafy greens in a ginger-flavored broth.', 456.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548769.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a780d84-aa7c-4eba-9d35-5dd4858e977f', 'crispy squid', 'For reference: Deep-fried crispy baby squid.', 408.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548740.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a780d84-aa7c-4eba-9d35-5dd4858e977f', 'squid adobao', 'For reference: Savory Squid Adobao.', 408.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548776.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a780d84-aa7c-4eba-9d35-5dd4858e977f', 'shrimp in garlic', 'For reference: Succulent shrimp sautéed in aromatic garlic, creating a flavorful and savory seafood delight.', 360.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a780d84-aa7c-4eba-9d35-5dd4858e977f', 'sa-ang', 'For reference: A flavorful dish featuring marinated meat, grilled to perfection, often served with fresh herbs.', 288.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548782.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a780d84-aa7c-4eba-9d35-5dd4858e977f', 'baked scallops', 'For reference: Indulge in the succulent flavors of Baked Scallops.', 252.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548797.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a4fc497-d4cb-4531-a351-9e571dc5b8a9', 'sinampalocan', 'For reference: A sour tamarind soup with tender goat meat and vegetables, served hot.', 372.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548741.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a4fc497-d4cb-4531-a351-9e571dc5b8a9', 'kilawin', 'For reference: A tangy and refreshing dish, perfect for those who enjoy a zesty, citrus-marinated flavor.', 252.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548757.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '9a4fc497-d4cb-4531-a351-9e571dc5b8a9', 'kaldereta', 'For reference: Filipino-style tomato-based stew.', 468.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548783.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '41f98936-5816-4f5d-adf3-b16c78229834', 'pork barbeque', 'For reference: Tender pork barbecue with a smoky, slightly sweet glaze, perfect for a flavorful bite.', 70.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548752.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '41f98936-5816-4f5d-adf3-b16c78229834', 'tuna panga - small', 'For reference: Grilled small tuna belly, tender and flavorful, served with a zesty sauce.', 156.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '41f98936-5816-4f5d-adf3-b16c78229834', 'spicy isaw', 'For reference: Grilled skewers of marinated intestines, seasoned with spices, offering a smoky and savory flavor.', 60.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548762.jpg', true, ARRAY['spicy']::text[]),
('44444444-4444-4444-a444-444444444447', '41f98936-5816-4f5d-adf3-b16c78229834', 'tuna panga - large', 'For reference: Grilled large tuna belly, tender and flavorful, served with a zesty sauce.', 324.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '41f98936-5816-4f5d-adf3-b16c78229834', 'grilled squid', 'For reference only: Savor the irresistible goodness of this Grilled Squid, as the tender and smoky flavor leaves a lasting impression.', 408.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'crispy pata', 'For reference: Crispy pata with a crunchy skin and tender, flavorful meat.', 780.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548751.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'sizzling sisig', 'For reference: Crispy and flavorful sizzling sisig.', 252.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548754.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'chili chicken', 'For reference: Spicy chicken dish, often deep-fried and tossed in a tangy chili sauce.', 420.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548768.jpg', true, ARRAY['spicy']::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'lechon kawali', 'For reference only: Delicious crispy pork belly.', 408.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548770.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'battered chicken', 'For reference: Crispy Battered Chicken.', 384.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548779.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'sweet & sour pork', 'For reference: Tangy and savory sweet & sour pork with a perfect balance of flavors.', 432.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548792.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'd9429b73-a5a3-4441-9eb1-df367a3403f2', 'Dinuguan', 'New', 210.00, 'https://images.deliveryhero.io/image/fd-ph/Products/91320169.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '24dda49e-7c7b-48df-995f-8247f434b65c', 'taytayan fried rice', 'For reference: Savory fried rice with vegetables, spices, and a hint of smokiness, served hot.', 250.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', '24dda49e-7c7b-48df-995f-8247f434b65c', 'unli rice (per cup)', 'For reference: Unlimited rice served by the cup, perfect for hearty meals and satisfying appetites.', 50.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', '1L Coke', 'For reference: Quench your thirst with Coke.', 90.00, 'https://images.deliveryhero.io/image/fd-ph/products/64548743.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Coke Mismo', 'For reference: Classic Coke Mismo with a crisp, refreshing taste.', 50.00, 'https://images.deliveryhero.io/image/fd-ph/products/66831510.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Coke Zero', 'For reference: Crisp and refreshing cola with zero sugar.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182399.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Sprite Mismo', 'For reference: A cold and fizzy Sprite in a convenient bottle.', 50.00, 'https://images.deliveryhero.io/image/fd-ph/products/66831512.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'bottled water', 'For reference: Refreshing bottled water to keep you hydrated throughout the day.', 30.00, 'https://images.deliveryhero.io/image/fd-ph/products/64548744.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'shakes', 'For reference: Cold and creamy with smooth, sweet flavors.', 110.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Del Monte Pineapple Juice', 'For Reference: Refreshing pineapple juice from Del Monte.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182384.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Del Monte Mango Juice', 'For reference: Sweet and juicy with a tropical mango burst.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182387.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Del Monte 4 Season', 'For reference: Refreshing Del Monte 4 Season.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182388.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Del Monte Pineapple Orange Juice', 'For reference: A refreshing blend of sweet pineapple and tangy orange for a tropical juice experience.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182393.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'San Mig Light', 'For reference: Light and crisp San Mig Light with a smooth malt flavor.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182395.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'San Mig Pilsen', 'For reference only: San Miguel Pale Pilsen is the original Pilsen beer, representing a classic style that has stood the test of time and captivated beer enthusiasts worldwide.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182396.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', '517d21ac-e4e8-4def-8681-c7cdb29390a5', 'Red Horse Stallion', 'For reference: A smooth, strong beer with a rich flavor, perfect for those who love a bold brew.', 80.00, 'https://images.deliveryhero.io/image/fd-ph/products/67182397.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'a201b274-bf37-4fa1-a6c7-5e9a16008fc3', 'cafe latte', 'For reference: Velvety cafe latte with a smooth coffee-milk balance.', 95.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', 'a201b274-bf37-4fa1-a6c7-5e9a16008fc3', 'americano', 'For reference only: Bold and rich coffee with a smooth finish.', 90.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-444444444447', 'a201b274-bf37-4fa1-a6c7-5e9a16008fc3', 'cappuccino', 'For Reference: A rich, bold espresso flavor balanced with milk, creating a smooth and velvety coffee experience.', 95.00, 'https://images.deliveryhero.io/image/fd-ph/Products/64548767.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', 'a201b274-bf37-4fa1-a6c7-5e9a16008fc3', 'coffee press (unli)', 'For reference: Unlimited brewed coffee served in a press, rich in flavor and aroma.', 95.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY['vegetarian']::text[]),
('44444444-4444-4444-a444-444444444447', 'a201b274-bf37-4fa1-a6c7-5e9a16008fc3', 'espresso', 'For reference: Strong, bold espresso with deep, roasted coffee flavors.', 90.00, 'https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;


-- Tita Kim's Restaurant Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
('b620b587-c31a-4952-b18c-ff924f73d09b', '44444444-4444-4444-a444-44444444444f', 'Eat-All-You-Can (₱299)', 1),
('37c4bca7-4d1c-401a-8558-99bc4ab01f5e', '44444444-4444-4444-a444-44444444444f', 'Seafood & Fish', 2),
('30ad4c99-7807-4865-b1a5-58ea38ddc520', '44444444-4444-4444-a444-44444444444f', 'Pork & Beef Dishes', 3),
('ba3dd032-2116-4f27-8b07-8e53bf54f620', '44444444-4444-4444-a444-44444444444f', 'Chicken, Pasta & Noodles', 4)
ON CONFLICT DO NOTHING;

-- Tita Kim's Restaurant Menu Items (Eat-All-You-Can ₱299)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES
('44444444-4444-4444-a444-44444444444f', '37c4bca7-4d1c-401a-8558-99bc4ab01f5e', '1. Grilled Seafood Mix', 'Shrimp, mussels & squid grilled in garlic butter (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-1-grilled-seafood-mix.png', true, ARRAY['seafood']::text[]),
('44444444-4444-4444-a444-44444444444f', 'ba3dd032-2116-4f27-8b07-8e53bf54f620', '2. Baked Cheesy Spaghetti', 'Filipino-style spaghetti topped with melted cheese, served with grilled chicken (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-2-baked-cheesy-spaghetti.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', '30ad4c99-7807-4865-b1a5-58ea38ddc520', '3. Lumpiang Shanghai', 'Crispy fried pork spring rolls (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-3-lumpiang-shanghai.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', '37c4bca7-4d1c-401a-8558-99bc4ab01f5e', '4. Garlic Butter Shrimp', 'Shrimp sautéed in garlic butter with chili & spring onions (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-4-garlic-butter-shrimp.png', true, ARRAY['seafood']::text[]),
('44444444-4444-4444-a444-44444444444f', '37c4bca7-4d1c-401a-8558-99bc4ab01f5e', '5. Crispy Fish Fillet Strips', 'Panko-breaded fish fillet strips, fried golden (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-5-crispy-fish-fillet-strips.png', true, ARRAY['seafood']::text[]),
('44444444-4444-4444-a444-44444444444f', '30ad4c99-7807-4865-b1a5-58ea38ddc520', '6. Beef Caldereta', 'Beef stew in tomato sauce with carrots & potatoes (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-6-beef-caldereta.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', 'ba3dd032-2116-4f27-8b07-8e53bf54f620', '7. Pancit Guisado with Shrimp', 'Sautéed noodles with shrimp, vegetables & calamansi (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-7-pancit-guisado-with-shrimp.png', true, ARRAY['seafood']::text[]),
('44444444-4444-4444-a444-44444444444f', 'ba3dd032-2116-4f27-8b07-8e53bf54f620', '8. Crispy Fried Chicken', 'Golden fried chicken pieces with fresh veggie garnish (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-8-crispy-fried-chicken.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', '30ad4c99-7807-4865-b1a5-58ea38ddc520', '9. Pork Humba', 'Braised sweet-savory pork belly with boiled egg (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-9-pork-humba.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', '30ad4c99-7807-4865-b1a5-58ea38ddc520', '10. Beef Tapa / Bistek', 'Marinated beef strips with red onions (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-10-beef-tapa-bistek.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', '37c4bca7-4d1c-401a-8558-99bc4ab01f5e', '11. Buttered Garlic Mussels (Tahong)', 'Fresh mussels in garlic butter sauce (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-11-buttered-garlic-mussels.png', true, ARRAY['seafood']::text[]),
('44444444-4444-4444-a444-44444444444f', '30ad4c99-7807-4865-b1a5-58ea38ddc520', '12. Pork Adobo with Eggplant & Okra', 'Classic pork adobo served with grilled eggplant & okra (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-12-pork-adobo-with-eggplant.png', true, ARRAY[]::text[]),
('44444444-4444-4444-a444-44444444444f', '37c4bca7-4d1c-401a-8558-99bc4ab01f5e', '13. Ginisang Dilis', 'Sautéed dried anchovies with tomato & chili (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-13-ginisang-dilis.png', true, ARRAY['seafood']::text[]),
('44444444-4444-4444-a444-44444444444f', 'ba3dd032-2116-4f27-8b07-8e53bf54f620', '14. Chicken Karaage / Popcorn Chicken', 'Crispy fried chicken bites drizzled with sauce (Included in ₱299 Eat-All-You-Can)', 299.00, '/images/tita-kims/dish-14-chicken-karaage.png', true, ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CAFE MAFIA - CORDOVA (MENU CATEGORIES & ITEMS FROM FOODPANDA)
-- ============================================================================
DO $$
DECLARE
    v_rest_id UUID;
    v_cat_1 UUID;
    v_cat_2 UUID;
    v_cat_3 UUID;
    v_cat_4 UUID;
    v_cat_5 UUID;
    v_cat_6 UUID;
    v_cat_7 UUID;
BEGIN
    SELECT id INTO v_rest_id FROM restaurants WHERE slug = 'cafe-mafia' OR slug LIKE '%cafe%mafia%' LIMIT 1;
    IF v_rest_id IS NOT NULL THEN
        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Mafia Premium Burger', 1)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_1;
        IF v_cat_1 IS NULL THEN
            SELECT id INTO v_cat_1 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Mafia Premium Burger' LIMIT 1;
        END IF;

        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Soda', 2)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_2;
        IF v_cat_2 IS NULL THEN
            SELECT id INTO v_cat_2 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Soda' LIMIT 1;
        END IF;

        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Starters', 3)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_3;
        IF v_cat_3 IS NULL THEN
            SELECT id INTO v_cat_3 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Starters' LIMIT 1;
        END IF;

        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Hot Coffee', 4)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_4;
        IF v_cat_4 IS NULL THEN
            SELECT id INTO v_cat_4 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Hot Coffee' LIMIT 1;
        END IF;

        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Iced Coffee', 5)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_5;
        IF v_cat_5 IS NULL THEN
            SELECT id INTO v_cat_5 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Iced Coffee' LIMIT 1;
        END IF;

        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Non-Coffee Based Drinks', 6)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_6;
        IF v_cat_6 IS NULL THEN
            SELECT id INTO v_cat_6 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Non-Coffee Based Drinks' LIMIT 1;
        END IF;

        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES (v_rest_id, 'Fruit Tea', 7)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_cat_7;
        IF v_cat_7 IS NULL THEN
            SELECT id INTO v_cat_7 FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'Fruit Tea' LIMIT 1;
        END IF;

        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'The Soldier', 'Brioche buns, pressed 100% beef patty, double cheddar cheese, grilled onions & mafia signature sauce', 209, 'https://images.deliveryhero.io/image/fd-ph/Products/58203792.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'The Capo', 'Brioche buns, pressed 100% beef patty, double cheddar cheese, grilled onions, tomato, pickles, lettuce & mafia signature sauce', 259, 'https://images.deliveryhero.io/image/fd-ph/Products/58203793.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'The Consigliere', 'Brioche buns, pressed 100% beef patty, grilled pineapple, double cheddar cheese, grilled onions, tomato, lettuce & mafia signature sauce', 299, 'https://images.deliveryhero.io/image/fd-ph/products/58203794.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'The Boss', 'A hearty and savory burger with a tender texture. For reference only.', 339, 'https://images.deliveryhero.io/image/fd-ph/products/58203795.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'Al Capone', 'Brioche buns, 100% beef patty, quadruple cheddar cheese, grilled onions, pickle relish, honey-cured bacon, and mafia special BARBECUE sauce', 339, 'https://images.deliveryhero.io/image/fd-ph/products/58577677.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'The Underboss', 'Brioche buns, pressed 100% beef patties, grilled bacon, double cheddar cheese, grilled onions, tomato, pickles, lettuce, jalapeno, sriracha & mafia signature sauce', 359, 'https://images.deliveryhero.io/image/fd-ph/Products/58203796.jpg', true, ARRAY['spicy'])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'Luciano', 'Brioche buns, double 100% beef patty, quadruple cheddar cheese, grilled onions, pickle relish, jalapeno, honey-cured bacon, and mafia special BARBECUE sauce', 399, 'https://images.deliveryhero.io/image/fd-ph/products/58577678.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'The Godfather', 'Brioche buns, pressed double 100% beef patties, quadruple cheddar cheese, grilled bacon, grilled onions, tomato, pickles, jalapeno, & mafia signature sauce', 439, 'https://images.deliveryhero.io/image/fd-ph/products/58203797.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_1, 'Cosa Nostra', 'Brioche buns, pressed double 100% beef patties, quadruple cheddar cheese, grilled bacon, grilled onions, tomato, pickles, jalapeno, grilled pineapple, egg, lettuce & mafia signature sauce', 479, 'https://images.deliveryhero.io/image/fd-ph/Products/58577622.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_2, 'Canada Dry', 'Ginger Ale', 110, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/i18z/product/ecc9fbb7-dbe9-412c-8ff7-0a2eb962598f.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_2, 'A&W', 'Root Beer', 110, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/i18z/product/15841123-14e4-4db1-9160-0d6f3c4c5f6b.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_2, 'Coke Cherry', 'Coke, Cherry Flavor', 110, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/i18z/product/b215c6b3-0faf-44fe-bfaf-9716f75457be.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_2, 'Dr. Pepper (Small)', 'Dr Pepper', 85, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/i18z/product/00aef373-e7fe-4300-a98d-d8e49f6048b3.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_2, 'Coke', 'Coke - Original or Regular', 85, 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/i18z/product/4eea61cc-9cdc-46b9-9384-1b7447f0e5e5.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Premium Plain Fries', 'Thick cut extra crispy fries with a coated batter that provides a heavy crunch.', 149, 'https://images.deliveryhero.io/image/fd-ph/Products/75312355.jpg', true, ARRAY['vegetarian'])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Gambino Savory Premium Fries', 'Savory with paprika, parsley and other herbs on thick cut extra crispy fries with a coated batter that provides a heavy crunch.', 159, 'https://images.deliveryhero.io/image/fd-ph/products/75312363.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Hashbrown Strips', 'Crispy hashbrown strips with our mafia signature sauce on the side', 219, 'https://images.deliveryhero.io/image/fd-ph/products/58577840.jpg', true, ARRAY['vegetarian'])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Tempura', 'For reference: Lightly battered and crispy seafood.', 100, 'https://images.deliveryhero.io/image/fd-ph/Products/58728264.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Squid Roll', 'For reference: Crunchy squid with a savory coating and mild seafood flavor.', 89, 'https://images.deliveryhero.io/image/fd-ph/products/58728267.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Cheese Sticks', 'For reference: Golden and crispy cheese sticks with a gooey cheese filling.', 139, 'https://images.deliveryhero.io/image/fd-ph/Products/58728268.jpg', true, ARRAY['vegetarian'])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Combo (Squid Roll + Tempura)', 'A hearty and savory starter featuring tender squid roll and tempura with a satisfying texture. For reference only.', 159, 'https://images.deliveryhero.io/image/fd-ph/Products/58728277.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Premium Combo Cheese Sticks & Fries', 'Premium fries & pemiento cheese sticks combo with ketchup & mayo sauce on the side.', 260, 'https://images.deliveryhero.io/image/fd-ph/Products/75314647.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_3, 'Premium Kangpae Spam Fries ', 'Korean spam and premium savory fries combo with our homemade sriracha aioli sauce', 299, 'https://images.deliveryhero.io/image/fd-ph/Products/75314640.jpg', true, ARRAY['spicy'])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Americano', 'For reference: Bold and smooth hot Americano with deep coffee notes.', 129, 'https://images.deliveryhero.io/image/fd-ph/Products/58728518.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Cafe Latte', 'For reference: A warm and creamy espresso-based latte.', 159, 'https://images.deliveryhero.io/image/fd-ph/Products/58728522.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Cappuccino', 'For reference: Frothy cappuccino with a perfect blend of espresso and milk.', 169, 'https://images.deliveryhero.io/image/fd-ph/Products/58728525.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Spanish Latte', 'For Reference: A bold and creamy hot Spanish latte.', 179, 'https://images.deliveryhero.io/image/fd-ph/Products/58728545.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Salted Caramel', 'For reference: A warm and comforting hot salted caramel drink.', 179, 'https://images.deliveryhero.io/image/fd-ph/Products/58728550.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Tiramisu', 'For reference: A hot Tiramisu.', 179, 'https://images.deliveryhero.io/image/fd-ph/Products/58728552.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Roasted Vanilla', 'For reference: A warm, sweet beverage infused with rich vanilla flavor and aromatic coffee.', 179, 'https://images.deliveryhero.io/image/fd-ph/Products/58728553.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot Cafe Mocha', 'For reference: A rich, chocolatey espresso drink with steamed milk.', 179, 'https://images.deliveryhero.io/image/fd-ph/Products/58728556.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_4, 'Hot White Choco Mocha', 'For reference only: Creamy and indulgent white chocolate mocha served hot for a delightful experience.', 179, 'https://images.deliveryhero.io/image/fd-ph/Products/58728559.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Americano', 'For reference: Bold and refreshing iced Americano with deep coffee notes.', 129, 'https://images.deliveryhero.io/image/fd-ph/Products/58728724.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Cafe Latte', 'For reference only: Enjoy a refreshing blend of smooth espresso and chilled milk for a delightful pick-me-up.', 169, 'https://images.deliveryhero.io/image/fd-ph/Products/58728718.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Spanish Latte', 'For reference: Bold espresso with sweet, creamy milk and a hint of cinnamon.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58728777.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Salted Caramel', 'For Reference: A cold and sweet caramel drink with a hint of salt.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58728789.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Tiramisu', 'For reference only: Chilled and indulgent iced drink featuring the flavors of tiramisu for a delightful treat.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58728787.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Roasted Vanilla', 'For reference: Sweet, creamy, and wonderfully aromatic.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58728791.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced Cafe Mocha', 'For reference: A refreshing iced cafe mocha with a rich coffee and chocolate blend.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58728794.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Iced White Choco Mocha', 'For reference only: Iced mocha beverage with the luxurious blend of white chocolate and coffee.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58729014.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Cold Brew White Gangster', 'For reference: Chilled coffee beverage with creamy milk, offering a smooth and refreshing taste experience.', 169, 'https://images.deliveryhero.io/image/fd-ph/Products/58729295.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Coffee Jelly', 'For reference only: A delightful frappe with the added delight of coffee jelly.', 189, 'https://images.deliveryhero.io/image/fd-ph/Products/58729297.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_5, 'Dirty Matcha Latte', 'For reference only: Iced dirty matcha latte, a chilled latte with matcha and espresso.', 225, 'https://images.deliveryhero.io/image/fd-ph/Products/58729415.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_6, 'Matcha Latte', 'For reference: Smooth matcha latte with earthy, creamy, and slightly sweet notes.', 185, 'https://images.deliveryhero.io/image/fd-ph/Products/58729420.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_6, 'Creamy Milk Chocolate', 'For reference: Rich, velvety chocolate dessert with a smooth, indulgent texture and sweet flavor.', 160, 'https://images.deliveryhero.io/image/fd-ph/Products/58729423.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_6, 'Strawberry Milk', 'For reference only: The blissful taste of this strawberry milk combines the sweetness of strawberries with creamy goodness.', 170, 'https://images.deliveryhero.io/image/fd-ph/Products/58729532.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES (v_rest_id, v_cat_7, 'Mango Lychee Fruit Tea', 'It''s a blend of mango and lychee flavors infused with a green tea. It''s sweet, fruity, and aromatic combining the tropical sweetness of mango with the delicate, floral flavor of lychee. It comes with soft & chewy fruit jelly that enhances the drink''s overall mouthfeel.', 129, 'https://images.deliveryhero.io/image/fd-ph/LH/i18z-hero.jpg', true, ARRAY[]::TEXT[])
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
