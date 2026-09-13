const { pool } = require('../config/db');

async function seedDonMacchiatos() {
  console.log("Seeding Don Macchiatos Cordova menu from Foodpanda...");

  // 1. Find Don Macchiatos restaurant ID
  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = 'don-macchiatos-cordova' OR slug LIKE '%macchiato%' OR LOWER(name) LIKE '%macchiato%' 
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log("Restaurant don-macchiatos-cordova not found in database.");
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log("Found Restaurant:", restRes.rows[0].name, "ID:", restaurantId);

  // Categories to create
  const categories = [
    { name: 'Ice Coffee', sort_order: 1 },
    { name: 'Hot Drinks', sort_order: 2 },
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

  const menuItems = [
    {
      category: 'Ice Coffee',
      name: 'Don Pistachio',
      description: 'A smooth and creamy latte infused with rich pistachio flavor — sweet, and perfectly balanced.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/77666093.jpg',
      dietary_tags: ['iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Caramel Macchiato',
      description: 'Ice caramel Macchiato is a sweet coffee-based cold treat that combines the rich, buttery flavor of caramel.',
      price: 59.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775038.jpg',
      dietary_tags: ['caramel', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Don Darko',
      description: 'Don Darko is a refreshing drink that combines the rich flavors of coffee and premium Belgian chocolate offering a satisfying fusion of warmth, bitterness, and a touch of sweetness.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775039.jpg',
      dietary_tags: ['chocolate', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Donya Berry',
      description: 'Donya Berry is an intriguing combination that blends the deep, robust notes of coffee with the bright, fruity sweetness of real strawberry fruit syrup.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775040.jpg',
      dietary_tags: ['strawberry', 'fruity', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Don Matchatos',
      description: 'Don Matchatos is a refreshing drink that is a combination of coffee and pure matcha from Japan, blending the rich, bold flavor of coffee with the earthy, grassy taste of matcha green tea powder.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775041.jpg',
      dietary_tags: ['matcha', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Matcha Berry',
      description: 'Matcha Berry is a delightful combination of two contrasting flavors. The earthy depth of pure matcha from Japan and compliments the bright, sweet-tart nature of real strawberry fruit syrup that perfectly balanced with a shot of espresso.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775042.jpg',
      dietary_tags: ['matcha', 'strawberry', 'fruity', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Black Forest',
      description: 'Black Forest is a delightful and indulgent flavor combination, blending the rich, deep notes of coffee with the sweetness of premium dark chocolate and the fruity brightness of real fruit strawberry syrup.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775043.jpg',
      dietary_tags: ['chocolate', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Oreo Coffee',
      description: 'Oreo coffee is a sweet and indulging coffee drink that combines the rich, bold flavor of coffee and creamy taste of Oreos, topped with delicious crushed Oreo to perfectly match the drink.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775044.jpg',
      dietary_tags: ['oreo', 'iced', 'coffee']
    },
    {
      category: 'Ice Coffee',
      name: 'Iced Spanish Latte',
      description: 'Brown Spanish Latte is a delicious variation of the classic Spanish latte, featuring a rich, sweet, and creamy flavor profile with a deep, caramelized twist of our premium tiger sugar.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775045.jpg',
      dietary_tags: ['iced', 'coffee']
    },
    {
      category: 'Hot Drinks',
      name: 'Hot Don Barako',
      description: 'Don Barako is our specialty coffee known for its smooth, full-bodied flavor and distinct characteristics, originating from the Sagada region in the northern Philippines. This is purely all black coffee added with a little bit of sugar to get the perfect balance.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775046.jpg',
      dietary_tags: ['barako', 'hot', 'coffee']
    },
    {
      category: 'Hot Drinks',
      name: 'Hot Don Darko',
      description: 'Hot Darko is our rich, deep premium Belgian chocolate flavor hot drink blending a smooth and creamy texture.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/61775047.jpg',
      dietary_tags: ['chocolate', 'hot', 'coffee']
    },
    {
      category: 'Hot Drinks',
      name: 'Hot Caramel',
      description: 'Hot Caramel is a hot, indulgent coffee drink that combines the rich, bold taste of coffee with the smooth, sweet flavor of caramel.',
      price: 69.00,
      image_url: 'https://images.deliveryhero.io/image/fd-ph/Products/62187428.jpg',
      dietary_tags: ['caramel', 'hot', 'coffee']
    }
  ];

  // Optional: clear existing menu items for clean sync
  await pool.query(`DELETE FROM menu_items WHERE restaurant_id = $1`, [restaurantId]);

  for (const item of menuItems) {
    const categoryId = categoryMap[item.category];
    await pool.query(`
      INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7);
    `, [restaurantId, categoryId, item.name, item.description, item.price, item.image_url, item.dietary_tags]);
  }

  console.log(`Successfully seeded ${menuItems.length} Don Macchiatos items into database.`);
}

if (require.main === module) {
  seedDonMacchiatos()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seedDonMacchiatos };
