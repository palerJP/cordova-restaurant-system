const { pool } = require('../config/db');

async function seedTitaKims() {
  console.log("Seeding Tita Kim's Eat-All-You-Can menu (₱299 per person)...");

  // 1. Find Tita Kim's restaurant ID
  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = 'tita-kims' OR slug LIKE '%tita%' OR LOWER(name) LIKE '%tita%kim%' 
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log("Restaurant tita-kims not found in database.");
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log("Found Restaurant:", restRes.rows[0].name, "ID:", restaurantId);

  // Categories to create
  const categories = [
    { id: 'cat-tk-1', name: 'Eat-All-You-Can (₱299)', sort_order: 1 },
    { id: 'cat-tk-2', name: 'Seafood & Fish', sort_order: 2 },
    { id: 'cat-tk-3', name: 'Pork & Beef Dishes', sort_order: 3 },
    { id: 'cat-tk-4', name: 'Chicken, Pasta & Noodles', sort_order: 4 },
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

  // Menu items (14 dishes at ₱299 Eat-All-You-Can)
  const menuItems = [
    {
      category: 'Seafood & Fish',
      name: '1. Grilled Seafood Mix',
      description: 'Shrimp, mussels & squid grilled in garlic butter (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-1-grilled-seafood-mix.png',
      dietary_tags: ['seafood']
    },
    {
      category: 'Chicken, Pasta & Noodles',
      name: '2. Baked Cheesy Spaghetti',
      description: 'Filipino-style spaghetti topped with melted cheese, served with grilled chicken (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-2-baked-cheesy-spaghetti.png',
      dietary_tags: []
    },
    {
      category: 'Pork & Beef Dishes',
      name: '3. Lumpiang Shanghai',
      description: 'Crispy fried pork spring rolls (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-3-lumpiang-shanghai.png',
      dietary_tags: []
    },
    {
      category: 'Seafood & Fish',
      name: '4. Garlic Butter Shrimp',
      description: 'Shrimp sautéed in garlic butter with chili & spring onions (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-4-garlic-butter-shrimp.png',
      dietary_tags: ['seafood']
    },
    {
      category: 'Seafood & Fish',
      name: '5. Crispy Fish Fillet Strips',
      description: 'Panko-breaded fish fillet strips, fried golden (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-5-crispy-fish-fillet-strips.png',
      dietary_tags: ['seafood']
    },
    {
      category: 'Pork & Beef Dishes',
      name: '6. Beef Caldereta',
      description: 'Beef stew in tomato sauce with carrots & potatoes (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-6-beef-caldereta.png',
      dietary_tags: []
    },
    {
      category: 'Chicken, Pasta & Noodles',
      name: '7. Pancit Guisado with Shrimp',
      description: 'Sautéed noodles with shrimp, vegetables & calamansi (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-7-pancit-guisado-with-shrimp.png',
      dietary_tags: ['seafood']
    },
    {
      category: 'Chicken, Pasta & Noodles',
      name: '8. Crispy Fried Chicken',
      description: 'Golden fried chicken pieces with fresh veggie garnish (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-8-crispy-fried-chicken.png',
      dietary_tags: []
    },
    {
      category: 'Pork & Beef Dishes',
      name: '9. Pork Humba',
      description: 'Braised sweet-savory pork belly with boiled egg (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-9-pork-humba.png',
      dietary_tags: []
    },
    {
      category: 'Pork & Beef Dishes',
      name: '10. Beef Tapa / Bistek',
      description: 'Marinated beef strips with red onions (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-10-beef-tapa-bistek.png',
      dietary_tags: []
    },
    {
      category: 'Seafood & Fish',
      name: '11. Buttered Garlic Mussels (Tahong)',
      description: 'Fresh mussels in garlic butter sauce (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-11-buttered-garlic-mussels.png',
      dietary_tags: ['seafood']
    },
    {
      category: 'Pork & Beef Dishes',
      name: '12. Pork Adobo with Eggplant & Okra',
      description: 'Classic pork adobo served with grilled eggplant & okra (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-12-pork-adobo-with-eggplant.png',
      dietary_tags: []
    },
    {
      category: 'Seafood & Fish',
      name: '13. Ginisang Dilis',
      description: 'Sautéed dried anchovies with tomato & chili (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-13-ginisang-dilis.png',
      dietary_tags: ['seafood']
    },
    {
      category: 'Chicken, Pasta & Noodles',
      name: '14. Chicken Karaage / Popcorn Chicken',
      description: 'Crispy fried chicken bites drizzled with sauce (Included in ₱299 Eat-All-You-Can)',
      price: 299.00,
      image_url: '/images/tita-kims/dish-14-chicken-karaage.png',
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

  console.log("Tita Kim's menu seeding completed successfully!");
  await pool.end();
}

seedTitaKims().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
