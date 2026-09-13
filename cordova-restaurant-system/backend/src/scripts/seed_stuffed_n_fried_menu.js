const { pool } = require('../config/db');

async function seedStuffedNFried() {
  console.log("Seeding STUFFED N' FRIED Cordova menu items and categories...");

  // 1. Find Stuffed N' Fried restaurant ID
  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = 'stuffed-n-fried-cordova' OR slug LIKE '%stuffed%' OR LOWER(name) LIKE '%stuffed%fried%' 
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log("Restaurant stuffed-n-fried-cordova not found in database.");
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log("Found Restaurant:", restRes.rows[0].name, "ID:", restaurantId);

  // Categories to create
  const categories = [
    { id: 'cat-snf-1', name: 'Sooo Sulit Meals', sort_order: 1 },
    { id: 'cat-snf-2', name: 'Pork Section', sort_order: 2 },
    { id: 'cat-snf-3', name: 'Ad-Ons', sort_order: 3 }
  ];

  const categoryMap = {};

  for (const cat of categories) {
    let catRes = await pool.query(`
      SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 LIMIT 1;
    `, [restaurantId, cat.name]);

    if (catRes.rows.length === 0) {
      catRes = await pool.query(`
        INSERT INTO menu_categories (restaurant_id, name, sort_order)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [restaurantId, cat.name, cat.sort_order]);
    }
    categoryMap[cat.name] = catRes.rows[0].id;
  }

  console.log('Categories created/found:', categoryMap);

  // Menu items from foodpanda.ph
  const menuItems = [
    {
      category: 'Sooo Sulit Meals',
      name: 'Classic meal 1',
      description: 'Qtr slice of batter-fried chicken, 3 pcs puso, 1oz garlic vinegar & 1 bottled water or coke swakto',
      price: 219.00,
      image_url: 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/9695ec80-4750-4a81-8319-0babb1b74161.jpg',
      dietary_tags: []
    },
    {
      category: 'Sooo Sulit Meals',
      name: 'Ultimate meal 1',
      description: 'Qtr slice of batter-fried chicken, 4 pcs puso, 2pcs ngohiong, 1oz garlic vinegar & 1 bottled water or coke swakto',
      price: 249.00,
      image_url: 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/dfd0482e-0732-4a41-9f00-281bcddbb20e.jpg',
      dietary_tags: []
    },
    {
      category: 'Sooo Sulit Meals',
      name: 'Half Batter-fried chicken',
      description: 'Half crispy batter-fried chicken with a savory, juicy inside, perfect for sharing.',
      price: 279.00,
      image_url: 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/2bf40ef6-f921-4288-922c-dfaae8dd29c2.jpg',
      dietary_tags: []
    },
    {
      category: 'Sooo Sulit Meals',
      name: 'Family platter',
      description: '1 Batter-fried whole chicken, 520g Lechon kawali, 3pcs ngohiong, 12pcs puso, garlic vinegar, 1.5L coke',
      price: 1299.00,
      image_url: 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/11bb2f2b-388e-409b-b52a-9f1294ae65b3.jpg',
      dietary_tags: []
    },
    {
      category: 'Sooo Sulit Meals',
      name: 'Spicy Batter-fried Whole Chicken',
      description: 'Crispy, spicy batter-fried whole chicken with bold flavors and tender meat',
      price: 539.00,
      image_url: 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/a76336a5-7280-470f-9df6-51e2ded76dcf.jpg',
      dietary_tags: ['spicy']
    },
    {
      category: 'Sooo Sulit Meals',
      name: 'Barkada Meal 1',
      description: '1 Whole batter-fried chicken, Garlic vinegar, 8pcs puso & 1 Coke 1.5 liter',
      price: 562.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/72881538.jpg',
      dietary_tags: []
    },
    {
      category: 'Sooo Sulit Meals',
      name: '1 Whole Batter-fried Chicken',
      description: 'Marinated with our own 15 mixed spices, Stuffed with fresh onions, garlic, lemon grass and spring onions. Super crunchy outside and juicy inside',
      price: 499.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/72881539.jpg',
      dietary_tags: []
    },
    {
      category: 'Pork Section',
      name: 'Spicy Crispy Fried lechon kawali',
      description: 'Crispy, spicy fried lechon kawali with flavorful seasoning and a smoky crunch',
      price: 469.00,
      image_url: 'https://images.deliveryhero.io/image/global-menu-service/FP_PH/vendor/dxb3/product/c74973f2-2d45-445c-b7a7-0966db31ede4.jpg',
      dietary_tags: ['spicy']
    },
    {
      category: 'Pork Section',
      name: 'Crispy Fried Lechon Kawali',
      description: 'Pork Belly Deep-fried until crisp and golden brown, yet soft and tender inside. Served with Garlic Vinegar on the side.',
      price: 429.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/72881534.jpg',
      dietary_tags: []
    },
    {
      category: 'Pork Section',
      name: 'Barkada Meal 2',
      description: '780g Lechon kawali, 8pcs puso, garlic vinegar, 1.5L coke',
      price: 849.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/products/72881535.jpg',
      dietary_tags: []
    },
    {
      category: 'Pork Section',
      name: 'Classic Meal 2 (CM2)',
      description: '260g Lechon kawali, 3pcs puso, garlic vinegar, swakto',
      price: 279.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/78151007.jpg',
      dietary_tags: []
    },
    {
      category: 'Pork Section',
      name: 'Ultimate Meal 2 (UM2)',
      description: '260g Lechon kawali, 2pcs ngohiong, 4pcs puso, garlic vinegar, swakto',
      price: 329.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/78151051.jpg',
      dietary_tags: []
    },
    {
      category: 'Ad-Ons',
      name: 'Puso',
      description: '1pc puso or hanging rice',
      price: 10.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/89135816.jpg',
      dietary_tags: []
    },
    {
      category: 'Ad-Ons',
      name: 'Special Ngohiong',
      description: '1pc special ngohiong, garlic vinegar',
      price: 29.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/89135869.jpg',
      dietary_tags: []
    }
  ];

  for (const item of menuItems) {
    const catId = categoryMap[item.category];
    const existing = await pool.query(`
      SELECT id FROM menu_items WHERE restaurant_id = $1 AND name = $2 LIMIT 1;
    `, [restaurantId, item.name]);

    if (existing.rows.length > 0) {
      await pool.query(`
        UPDATE menu_items
        SET category_id = $1, description = $2, price = $3, image_url = $4, is_available = true, dietary_tags = $5
        WHERE id = $6;
      `, [catId, item.description, item.price, item.image_url, item.dietary_tags, existing.rows[0].id]);
      console.log('Updated item:', item.name);
    } else {
      await pool.query(`
        INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
        VALUES ($1, $2, $3, $4, $5, $6, true, $7);
      `, [restaurantId, catId, item.name, item.description, item.price, item.image_url, item.dietary_tags]);
      console.log('Inserted item:', item.name);
    }
  }

  console.log("STUFFED N' FRIED Cordova menu seeding completed successfully!");
  await pool.end();
}

seedStuffedNFried().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
