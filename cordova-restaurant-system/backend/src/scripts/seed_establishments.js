const { pool } = require('../config/db');

async function addCordovaEstablishments() {
  console.log('Seeding Entoy\'s Bakasihan, Tita Kim\'s, Sungka, and category tags...');

  // Ensure cuisines exist
  await pool.query(`
    INSERT INTO cuisines (name, slug) VALUES
      ('Filipino', 'filipino'),
      ('Cebuano / Local', 'cebuano-local'),
      ('Seafood', 'seafood'),
      ('Grill & BBQ', 'grill-bbq'),
      ('Cafe & Desserts', 'cafe-desserts'),
      ('Resort Dining', 'resort-dining')
    ON CONFLICT (slug) DO NOTHING;
  `);

  // Insert Entoy's Bakasihan
  const entoyRes = await pool.query(`
    INSERT INTO restaurants (
      id, owner_id, name, slug, description, address, barangay, latitude, longitude,
      phone, price_range, services_offered, status, verified_at, avg_rating, review_count
    ) VALUES (
      '77777777-7777-7777-a777-777777777771',
      'f1a69d69-0a0f-42ae-8adc-9bad5726d1ac',
      'Entoy''s Bakasihan',
      'entoys-bakasihan',
      'World-famous authentic Cebuano bakasi (salted reef eel soup and fried bakasi) featured on Netflix Street Food Asia. Established in Buagsong since 1995.',
      'Buagsong Barangay Rd (Wharf), Buagsong',
      'Buagsong',
      10.2448, 123.9458,
      '0966 931 7531',
      'budget',
      ARRAY['dine_in','takeout']::service_type[],
      'verified',
      now(), 4.8, 24
    ) ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      address = EXCLUDED.address,
      barangay = EXCLUDED.barangay,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      phone = EXCLUDED.phone,
      status = 'verified',
      avg_rating = 4.8
    RETURNING id;
  `);
  const entoyId = entoyRes.rows[0].id;

  // Tag Entoy's Bakasihan with seafood, filipino, cebuano-local
  await pool.query(`
    INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
    SELECT $1, id FROM cuisines WHERE slug IN ('seafood','filipino','cebuano-local')
    ON CONFLICT DO NOTHING;
  `, [entoyId]);

  // Add menu categories & items for Entoy's Bakasihan
  const catRes = await pool.query(`
    INSERT INTO menu_categories (restaurant_id, name, sort_order)
    VALUES ($1, 'Signature Dishes', 1)
    RETURNING id;
  `, [entoyId]);
  const catId = catRes.rows[0]?.id;

  if (catId) {
    await pool.query(`
      INSERT INTO menu_items (restaurant_id, category_id, name, description, price) VALUES
      ($1, $2, 'Linarang Bakasi', 'Signature sour and spicy eel soup with tomatoes, fermented black beans, and local chili', 150.00),
      ($1, $2, 'Crispy Fried Bakasi', 'Crunchy deep-fried reef eels served with spicy vinegar dip', 130.00),
      ($1, $2, 'Nilapwaan Kinsahon', 'Fresh local shellfish boiled in aromatic herbs and ginger', 160.00),
      ($1, $2, 'Garlic Butter Shrimp', 'Fresh Cordova sea shrimp in garlic butter sauce', 250.00),
      ($1, $2, 'Sinugbang Bangus', 'Grilled stuffed milkfish with tomato onion salsa', 220.00),
      ($1, $2, 'Lambay (Steamed Crab)', 'Fresh local mud crabs steamed with native vinegar dip', 300.00)
      ON CONFLICT DO NOTHING;
    `, [entoyId, catId]);
  }

  // Insert Tita Kim's
  const titaRes = await pool.query(`
    INSERT INTO restaurants (
      id, owner_id, name, slug, description, address, barangay, latitude, longitude,
      phone, price_range, services_offered, status, verified_at, avg_rating, review_count
    ) VALUES (
      '77777777-7777-7777-a777-777777777772',
      'f1a69d69-0a0f-42ae-8adc-9bad5726d1ac',
      'Tita Kim''s',
      'tita-kims',
      'Popular Eat All You Can buffet, unlimited grill, and unlimited chicken wings in Purok 5, Gabi.',
      'Lot 747 National Hwy, Purok 5, Gabi',
      'Gabi',
      10.2605, 123.9682,
      '0998 868 8573',
      'budget',
      ARRAY['dine_in','takeout']::service_type[],
      'verified',
      now(), 4.4, 18
    ) ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      address = EXCLUDED.address,
      barangay = EXCLUDED.barangay,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      phone = EXCLUDED.phone,
      status = 'verified'
    RETURNING id;
  `);
  if (titaRes.rows[0]) {
    await pool.query(`
      INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
      SELECT $1, id FROM cuisines WHERE slug IN ('filipino','seafood','grill-bbq')
      ON CONFLICT DO NOTHING;
    `, [titaRes.rows[0].id]);
  }

  // Insert Sungka
  const sungkaRes = await pool.query(`
    INSERT INTO restaurants (
      id, owner_id, name, slug, description, address, barangay, latitude, longitude,
      phone, price_range, services_offered, status, verified_at, avg_rating, review_count
    ) VALUES (
      '77777777-7777-7777-a777-777777777773',
      'f1a69d69-0a0f-42ae-8adc-9bad5726d1ac',
      'Sungka Native Restaurant',
      'sungka-native-restaurant',
      'Overwater bamboo dining huts, fresh seafood, live fish tanks, and native Cebuano delicacies along Day-as Wharf.',
      'Day-as Barangay Rd, Day-as',
      'Day-as',
      10.2673, 123.9678,
      NULL,
      'moderate',
      ARRAY['dine_in','takeout']::service_type[],
      'verified',
      now(), 4.5, 15
    ) ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      description = EXCLUDED.description,
      address = EXCLUDED.address,
      barangay = EXCLUDED.barangay,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      phone = EXCLUDED.phone,
      status = 'verified'
    RETURNING id;
  `);
  if (sungkaRes.rows[0]) {
    await pool.query(`
      INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
      SELECT $1, id FROM cuisines WHERE slug IN ('seafood','filipino','cebuano-local')
      ON CONFLICT DO NOTHING;
    `, [sungkaRes.rows[0].id]);
  }

  // Ensure Solea Resort has resort-dining cuisine
  await pool.query(`
    INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
    SELECT '2d9bdb3c-5cb3-4e1b-b6a6-82137087d563', id FROM cuisines WHERE slug IN ('resort-dining','filipino','seafood')
    ON CONFLICT DO NOTHING;
  `);

  console.log('Successfully inserted Entoy\'s Bakasihan, Tita Kim\'s, Sungka, and updated cuisine mappings!');
  await pool.end();
}

addCordovaEstablishments().catch(err => {
  console.error('Failed to seed:', err);
  process.exit(1);
});
