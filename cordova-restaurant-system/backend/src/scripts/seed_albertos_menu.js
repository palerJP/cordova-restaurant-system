const { pool } = require('../config/db');
const fs = require('fs');

async function seedAlbertos() {
  console.log("Seeding Alberto's Pizza Cordova menu from Foodpanda...");

  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = 'albertos-pizza-cordova' OR slug LIKE '%alberto%' OR LOWER(name) LIKE '%alberto%' 
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log("Restaurant albertos-pizza-cordova not found in database.");
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log("Found Restaurant:", restRes.rows[0].name, "ID:", restaurantId);

  const rawPath = 'C:/Users/Hp/.gemini/antigravity/brain/ec6b608f-add3-416d-8d3e-18427c99bc2b/scratch/albertos_menu.json';
  const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

  const categoryMap = {};

  for (let idx = 0; idx < data.length; idx++) {
    const cat = data[idx];
    let catRes = await pool.query(`
      SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 LIMIT 1;
    `, [restaurantId, cat.name]);

    if (catRes.rows.length === 0) {
      catRes = await pool.query(`
        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [restaurantId, cat.name, idx + 1]);
    }
    categoryMap[cat.name] = catRes.rows[0].id;
  }

  console.log('Categories created/found:', categoryMap);

  // Clear existing items for clean sync
  await pool.query(`DELETE FROM menu_items WHERE restaurant_id = $1`, [restaurantId]);

  let totalItems = 0;

  for (const cat of data) {
    const categoryId = categoryMap[cat.name];
    for (const p of cat.products) {
      let dietary_tags = [];
      const nameLower = p.name.toLowerCase();
      if (cat.name === 'Pizza') dietary_tags.push('pizza');
      if (nameLower.includes('cheese')) dietary_tags.push('cheese');
      if (nameLower.includes('spicy')) dietary_tags.push('spicy');
      if (nameLower.includes('chicken')) dietary_tags.push('chicken');
      if (nameLower.includes('beef')) dietary_tags.push('beef');
      if (nameLower.includes('pork') || nameLower.includes('bacon') || nameLower.includes('ham') || nameLower.includes('pepperoni') || nameLower.includes('hungarian')) dietary_tags.push('pork');
      if (nameLower.includes('shrimp') || nameLower.includes('tuna') || nameLower.includes('anchovy') || nameLower.includes('marine') || nameLower.includes('marina') || nameLower.includes('surf')) dietary_tags.push('seafood');
      if (nameLower.includes('vegetarian') || nameLower.includes('spinach') || nameLower.includes('cucumber') || nameLower.includes('garden')) dietary_tags.push('vegetarian');
      if (nameLower.includes('tea') || nameLower.includes('milktea') || nameLower.includes('boba')) dietary_tags.push('milktea');
      if (nameLower.includes('shake')) dietary_tags.push('shake');
      if (nameLower.includes('coffee') || nameLower.includes('mocha') || nameLower.includes('latte') || nameLower.includes('macchiato')) dietary_tags.push('coffee');
      if (cat.name === 'Beverages' || cat.name === 'Coolers') dietary_tags.push('beverage');

      await pool.query(`
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES ($1, $2, $3, $4, $5, $6, true, $7);
      `, [restaurantId, categoryId, p.name.trim(), p.description.trim(), p.price, p.image || null, Array.from(new Set(dietary_tags))]);
      totalItems++;
    }
  }

  console.log(`Successfully seeded ${totalItems} Alberto's Pizza items into database.`);
}

if (require.main === module) {
  seedAlbertos()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seedAlbertos };
