const { pool } = require('../config/db');

async function seedEatNRepeat() {
  console.log('Seeding Eat n Repeat menu items and categories...');

  // 1. Find Eat n Repeat restaurant ID
  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants WHERE slug = 'eat-n-repeat' OR LOWER(name) LIKE '%eat%repeat%' LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log('Restaurant eat-n-repeat not found in database.');
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log('Found Restaurant:', restRes.rows[0].name, 'ID:', restaurantId);

  // Categories to create
  const categories = [
    { name: 'Coffee & Espresso', sort_order: 1 },
    { name: 'Milktea & Boba', sort_order: 2 },
    { name: 'Rice Bowls & Meals', sort_order: 3 },
    { name: 'Pastries & Desserts', sort_order: 4 },
    { name: 'Sides & Bites', sort_order: 5 }
  ];

  const categoryMap = {};

  for (const cat of categories) {
    // Check if category exists
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

  // Menu items from eatnrepeat.online
  const menuItems = [
    {
      category: 'Coffee & Espresso',
      name: 'House Special Latte',
      description: 'Silky double shot espresso with velvety steamed milk and vanilla bean',
      price: 145.00,
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop',
      dietary_tags: ['vegetarian']
    },
    {
      category: 'Coffee & Espresso',
      name: 'Cordova Cold Brew',
      description: '16-hour slow-steeped single origin beans served over crystal ice',
      price: 135.00,
      image_url: 'https://images.unsplash.com/photo-1461023058943-07cb14a60039?w=600&auto=format&fit=crop',
      dietary_tags: ['vegan', 'vegetarian']
    },
    {
      category: 'Milktea & Boba',
      name: 'Uji Matcha Milktea',
      description: 'Creamy authentic Japanese matcha topped with cheese foam',
      price: 139.00,
      image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop',
      dietary_tags: ['vegetarian']
    },
    {
      category: 'Milktea & Boba',
      name: 'Brown Sugar Boba Milk',
      description: 'Warm brown sugar tapioca pearls with cold fresh farm milk',
      price: 149.00,
      image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop',
      dietary_tags: ['vegetarian']
    },
    {
      category: 'Rice Bowls & Meals',
      name: 'Signature Chicken Inasal Rice Bowl',
      description: 'Flame-grilled marinated chicken thigh with annatto rice and spiced vinegar',
      price: 189.00,
      image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop',
      dietary_tags: []
    },
    {
      category: 'Rice Bowls & Meals',
      name: 'Spam & Egg Comfort Bowl',
      description: 'Thick slice fried Spam, sunny side egg over garlic fried rice',
      price: 165.00,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
      dietary_tags: []
    },
    {
      category: 'Pastries & Desserts',
      name: 'French Butter Croissant',
      description: 'Flaky golden multi-layered croissant baked fresh every morning',
      price: 95.00,
      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop',
      dietary_tags: ['vegetarian']
    },
    {
      category: 'Sides & Bites',
      name: 'Garlic Parmesan Truffle Fries',
      description: 'Golden crispy skin-on fries tossed in garlic parmesan & truffle oil',
      price: 119.00,
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop',
      dietary_tags: ['vegetarian']
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

  console.log('Eat n Repeat menu seeding completed successfully!');
  await pool.end();
}

seedEatNRepeat().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
