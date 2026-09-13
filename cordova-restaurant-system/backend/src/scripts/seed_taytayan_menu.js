const { pool } = require('../config/db');
const fs = require('fs');

async function seedTaytayan() {
  console.log('Seeding Taytayan Pinoy Restaurant menu items and categories...');

  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = 'taytayan-pinoy-restaurant' OR slug LIKE '%taytayan%' OR LOWER(name) LIKE '%taytayan%' 
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log('Restaurant taytayan-pinoy-restaurant not found in database.');
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log('Found Restaurant:', restRes.rows[0].name, 'ID:', restaurantId);

  const rawData = JSON.parse(fs.readFileSync('c:/Users/Hp/.gemini/antigravity/brain/65aa2864-04d3-4060-8692-9824e099912d/scratch/taytayan_menu_parsed.json', 'utf8'));

  const categoryNameMap = {
    'short orders': 'Short Orders & Appetizers',
    'all day breakfast': 'All Day Breakfast',
    'soup': 'Native Soups & Broths',
    'manok bisaya': 'Manok Bisaya (Native Chicken)',
    'seafood': 'Seafood Specialties',
    'kanding': 'Kanding (Goat Dishes)',
    'grilled': 'Charcoal Grilled & BBQ',
    'meat': 'Meat & Pork Dishes',
    'rice': 'Rice & Extras',
    'drinks': 'Beverages & Cold Drinks',
    'coffee': 'Coffee'
  };

  const categoryMap = {};
  let sortOrder = 1;

  for (const cat of rawData.categories) {
    const displayName = categoryNameMap[cat.name.toLowerCase()] || cat.name;

    let catRes = await pool.query(`
      SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 LIMIT 1;
    `, [restaurantId, displayName]);

    if (catRes.rows.length === 0) {
      catRes = await pool.query(`
        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [restaurantId, displayName, sortOrder++]);
    }
    categoryMap[cat.name] = catRes.rows[0].id;
  }

  console.log('Categories created/mapped:', categoryMap);

  for (const item of rawData.items) {
    const catId = categoryMap[item.category_name];
    if (!catId) continue;

    const existing = await pool.query(`
      SELECT id FROM menu_items WHERE restaurant_id = $1 AND name = $2 LIMIT 1;
    `, [restaurantId, item.name]);

    if (existing.rows.length > 0) {
      await pool.query(`
        UPDATE menu_items
        SET category_id = $1, description = $2, price = $3, image_url = $4, is_available = true, dietary_tags = $5
        WHERE id = $6;
      `, [catId, item.description, item.price, item.image_url, item.dietary_tags, existing.rows[0].id]);
    } else {
      await pool.query(`
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES ($1, $2, $3, $4, $5, $6, true, $7);
      `, [restaurantId, catId, item.name, item.description, item.price, item.image_url, item.dietary_tags]);
    }
  }

  console.log(`Successfully seeded ${rawData.items.length} items for Taytayan Pinoy Restaurant!`);
  await pool.end();
}

seedTaytayan().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
