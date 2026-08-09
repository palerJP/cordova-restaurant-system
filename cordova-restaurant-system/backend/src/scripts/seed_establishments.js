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
      'Famous for authentic Cebuano bakasi and traditional Filipino seafood dishes. Family-owned since 1995.',
      'Buagsong, Cordova, Cebu',
      'Buagsong',
      10.2450, 123.9460,
      '+63 912 345 6789',
      'budget',
      ARRAY['dine_in','takeout']::service_type[],
      'verified',
      now(), 4.8, 24
    ) ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
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
      ($1, $2, 'Linaong na Bakasi', 'Authentic Cebuano eel soup in tangy tomato tamarind broth', 180.00),
      ($1, $2, 'Nilapwaan Kinsahon', 'Fresh local shellfish boiled in aromatic herbs', 160.00),
      ($1, $2, 'Fried Bakasi', 'Crispy deep-fried seasoned reef eels', 170.00),
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
      'Popular local food joint in Gabi, Cordova serving home-cooked Filipino favorites and grilled specialties.',
      'Gabi, Cordova, Cebu',
      'Gabi',
      10.2490, 123.9520,
      '+63 917 888 9900',
      'budget',
      ARRAY['dine_in','takeout']::service_type[],
      'verified',
      now(), 4.4, 18
    ) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = 'verified'
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
      'Sungka',
      'sungka-restaurant',
      'A scenic waterfront native restaurant in Day-as, Cordova offering traditional Filipino sea feasts.',
      'Day-as, Cordova, Cebu',
      'Day-as',
      10.2670, 123.9680,
      '+63 918 777 5544',
      'moderate',
      ARRAY['dine_in','takeout']::service_type[],
      'verified',
      now(), 4.5, 15
    ) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = 'verified'
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
