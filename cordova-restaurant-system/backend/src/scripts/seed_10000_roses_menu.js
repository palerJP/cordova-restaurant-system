const { pool } = require('../config/db');

async function seed10000Roses() {
  console.log("Seeding 10,000 Roses Cafe & More menu with official photos...");

  // 1. Find 10000 Roses restaurant ID
  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = '10000-roses-cafe-and-more' OR slug LIKE '%10000%' OR LOWER(name) LIKE '%10,000%roses%' OR LOWER(name) LIKE '%10000%roses%' 
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.log("Restaurant 10000-roses-cafe-and-more not found in database.");
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log("Found Restaurant:", restRes.rows[0].name, "ID:", restaurantId);

  const categories = [
    { name: 'Pasta & Pizza', sort_order: 1 },
    { name: 'Chef Picks & Snacks', sort_order: 2 },
    { name: 'Special Sets', sort_order: 3 },
    { name: 'Desserts & Crepe Cakes', sort_order: 4 },
    { name: 'Espresso & Coffee', sort_order: 5 },
    { name: 'Pearl Drinks & Milk Tea', sort_order: 6 },
    { name: 'Ice Blended & Real Fruit Smoothies', sort_order: 7 },
    { name: 'Coffee-Free & Drinks', sort_order: 8 },
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

  // Clear existing items for clean sync
  await pool.query(`DELETE FROM menu_items WHERE restaurant_id = $1`, [restaurantId]);

  const items = [
    // Pasta & Pizza
    { category: 'Pasta & Pizza', name: 'Aglio Olio', description: 'Classic al dente pasta tossed in fragrant extra virgin olive oil, garlic slivers, and chili flakes. (Official 10k Roses Photo)', price: 320, image: '/images/10000-roses/aglio-olio.png', tags: ['pasta', 'italian', 'garlic'] },
    { category: 'Pasta & Pizza', name: 'Marinara Pasta', description: 'Rich tomato marinara sauce infused with herbs, squid, and shrimp over tender pasta. (Official 10k Roses Photo)', price: 370, image: '/images/10000-roses/marinara-pasta.png', tags: ['pasta', 'bestseller', 'italian'] },
    { category: 'Pasta & Pizza', name: 'Carbonara Pasta', description: 'Creamy rich egg and parmesan cream sauce with savory bacon bits and black pepper. (Official 10k Roses Photo)', price: 370, image: '/images/10000-roses/carbonara-pasta.png', tags: ['pasta', 'bestseller', 'creamy'] },
    { category: 'Pasta & Pizza', name: 'Bacon Pasta', description: 'Savory sautéed bacon tossed with garlic, herbs, parmesan, and pasta. (Official 10k Roses Photo)', price: 370, image: '/images/10000-roses/bacon-pasta.png', tags: ['pasta', 'bacon'] },
    { category: 'Pasta & Pizza', name: 'Margherita Pizza', description: 'Crisp crust topped with aromatic tomato sauce, melted mozzarella, roasted chicken, and fresh basil leaves. (Official 10k Roses Photo)', price: 395, image: '/images/10000-roses/margherita-pizza.png', tags: ['pizza', 'bestseller'] },
    { category: 'Pasta & Pizza', name: 'Hawaiian Pizza', description: 'Fresh baked pizza loaded with sweet pineapple chunks, sliced savory ham, onions, and mozzarella cheese. (Official 10k Roses Photo)', price: 395, image: '/images/10000-roses/hawaiian-pizza.png', tags: ['pizza', 'pineapple', 'ham'] },
    { category: 'Pasta & Pizza', name: 'Mushroom Pizza', description: 'Earthy sliced mushrooms with melted mozzarella, red onions, and herbs on thin crust. (Official 10k Roses Photo)', price: 395, image: '/images/10000-roses/mushroom-pizza.png', tags: ['pizza', 'mushroom', 'vegetarian'] },

    // Chef Picks & Snacks
    { category: 'Chef Picks & Snacks', name: 'Korean Spicy Noodle', description: 'Spicy savory Korean ramen noodles with rich broth, kimchi, greens, and veggies. (Official 10k Roses Photo)', price: 195, image: '/images/10000-roses/korean-spicy-noodle.png', tags: ['korean', 'spicy', 'noodles', 'bestseller'] },
    { category: 'Chef Picks & Snacks', name: 'French Fries', description: 'Crisp golden potato fries lightly salted and served hot with dip. (Official 10k Roses Photo)', price: 235, image: '/images/10000-roses/french-fries.png', tags: ['fries', 'snacks'] },
    { category: 'Chef Picks & Snacks', name: 'Cheese French Fries', description: 'Golden crispy fries generously seasoned with savory cheese powder. (Official 10k Roses Photo)', price: 265, image: '/images/10000-roses/cheese-french-fries.png', tags: ['fries', 'cheese', 'snacks'] },
    { category: 'Chef Picks & Snacks', name: 'Cheese Nacho Chips', description: 'Crunchy tortilla chips loaded with melted cheese sauce and savory toppings. (Official 10k Roses Photo)', price: 265, image: '/images/10000-roses/cheese-nacho-chips.png', tags: ['nachos', 'cheese', 'snacks'] },
    { category: 'Chef Picks & Snacks', name: 'Mozzarella Cheese Sticks', description: 'Crispy breaded mozzarella sticks with stringy melted cheese center. (Official 10k Roses Photo)', price: 265, image: '/images/10000-roses/mozzarella-cheese-sticks.png', tags: ['cheese', 'promo', 'finger-food'] },
    { category: 'Chef Picks & Snacks', name: 'Pop Dumpling (Mandu)', description: 'Crispy bite-sized Korean pork and vegetable dumplings served with savory dip. (Official 10k Roses Photo)', price: 280, image: '/images/10000-roses/pop-dumpling-mandu.png', tags: ['dumplings', 'korean', 'bestseller'] },
    { category: 'Chef Picks & Snacks', name: 'Crispy Calamari', description: 'Tender squid rings fried in light seasoned batter, served golden with dip. (Official 10k Roses Photo)', price: 320, image: '/images/10000-roses/crispy-calamari.png', tags: ['seafood', 'calamari', 'crispy'] },
    { category: 'Chef Picks & Snacks', name: "Nel's Chicken Wings", description: 'Juicy crispy fried chicken wings with savory dip. (Official 10k Roses Photo)', price: 360, image: '/images/10000-roses/nels-chicken-wings.png', tags: ['chicken', 'wings', 'bestseller'] },

    // Special Sets
    { category: 'Special Sets', name: 'Pop Dumpling Mandu with 2 Sodas', description: 'Crispy Korean pop dumplings set meal served with 2 cold sodas. (Soda can be changed to Beer +₱50)', price: 399, image: '/images/10000-roses/pop-dumpling-mandu.png', tags: ['combo', 'set-meal', 'bestseller'] },
    { category: 'Special Sets', name: 'Crispy Calamari with 2 Sodas', description: 'Golden fried calamari squid rings served with 2 cold sodas. (Soda can be changed to Beer +₱50)', price: 439, image: '/images/10000-roses/crispy-calamari.png', tags: ['combo', 'set-meal', 'seafood'] },
    { category: 'Special Sets', name: "Nel's Chicken Wings with 2 Sodas", description: "House favorite crispy Nel's chicken wings served with 2 cold sodas. (Soda can be changed to Beer +₱50)", price: 479, image: '/images/10000-roses/nels-chicken-wings.png', tags: ['combo', 'set-meal', 'chicken'] },

    // Desserts & Crepe Cakes
    { category: 'Desserts & Crepe Cakes', name: 'Tiramisu Crepe Cake', description: 'Delicate multi-layered French mille crepe with espresso coffee cream and rich cocoa dusting. (Official 10k Roses Photo)', price: 185, image: '/images/10000-roses/tiramisu-cake.png', tags: ['dessert', 'crepe-cake', 'tiramisu', 'official-photo'] },
    { category: 'Desserts & Crepe Cakes', name: 'Matcha Crepe Cake', description: 'Thin delicate crepe layers infused with Japanese Uji green tea matcha cream.', price: 185, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', tags: ['dessert', 'matcha', 'crepe-cake'] },
    { category: 'Desserts & Crepe Cakes', name: 'Cocoa Crepe Cake', description: 'Indulgent Belgian cocoa crepe layers filled with dark chocolate cream. (Official 10k Roses Photo)', price: 185, image: '/images/10000-roses/tiramisu-cake.png', tags: ['dessert', 'chocolate', 'crepe-cake', 'official-photo'] },
    { category: 'Desserts & Crepe Cakes', name: 'Vanilla Melting Muffin', description: 'Warm oven-baked vanilla muffin with a molten lava center that melts in your mouth. (Must Try)', price: 195, image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80', tags: ['dessert', 'muffin', 'must-try'] },

    // Espresso & Coffee
    { category: 'Espresso & Coffee', name: 'Espresso (Hot)', description: 'Intense and rich single-shot espresso with golden crema in signature 10000 Roses cup.', price: 130, image: '/images/10000-roses/hot-coffee.png', tags: ['coffee', 'hot', 'espresso', 'official-photo'] },
    { category: 'Espresso & Coffee', name: 'Americano (Hot / Iced)', description: 'Bold espresso shots lengthened with hot water or poured over ice (Hot ?135 / Iced ?145).', price: 135, image: '/images/10000-roses/iced-coffee.png', tags: ['coffee', 'americano', 'official-photo'] },
    { category: 'Espresso & Coffee', name: 'Cappuccino (Hot / Iced)', description: 'Smooth espresso topped with thick velvety steamed milk foam in signature 10000 Roses cup (Hot ?165 / Iced ?175).', price: 165, image: '/images/10000-roses/hot-coffee.png', tags: ['coffee', 'cappuccino', 'official-photo'] },
    { category: 'Espresso & Coffee', name: 'Cafe Latte (Hot / Iced)', description: 'Silky micro-foam steamed milk balanced with rich dark roast espresso (Hot ?165 / Iced ?175).', price: 165, image: '/images/10000-roses/iced-coffee.png', tags: ['coffee', 'latte', 'official-photo'] },
    { category: 'Espresso & Coffee', name: 'Cafe Mocha (Hot / Iced)', description: 'Espresso infused with rich dark chocolate syrup and steamed milk (Hot ?170 / Iced ?180).', price: 170, image: '/images/10000-roses/iced-coffee.png', tags: ['coffee', 'mocha', 'chocolate', 'official-photo'] },
    { category: 'Espresso & Coffee', name: 'Caramel Latte (Hot / Iced)', description: 'Signature espresso and milk drizzled with buttery sweet caramel syrup (Hot ?175 / Iced ?185). (Best Seller)', price: 175, image: '/images/10000-roses/iced-coffee.png', tags: ['coffee', 'caramel', 'bestseller', 'official-photo'] },
    { category: 'Espresso & Coffee', name: 'Vanilla Latte (Hot / Iced)', description: 'Fragrant French vanilla syrup combined with espresso and milk (Hot ?170 / Iced ?180).', price: 170, image: '/images/10000-roses/hot-coffee.png', tags: ['coffee', 'vanilla', 'official-photo'] },

    // Pearl Drinks & Milk Tea
    { category: 'Pearl Drinks & Milk Tea', name: 'Cafe Latte with Black Pearl (Iced)', description: 'Creamy iced latte served with chewy brown sugar tapioca boba pearls in 10k Roses cup.', price: 185, image: '/images/10000-roses/milktea-pearl.png', tags: ['boba', 'pearl', 'coffee', 'iced', 'official-photo'] },
    { category: 'Pearl Drinks & Milk Tea', name: 'Cafe Mocha with Black Pearl (Iced)', description: 'Iced chocolate mocha infused with black tapioca pearls in 10k Roses cup.', price: 190, image: '/images/10000-roses/milktea-pearl.png', tags: ['boba', 'pearl', 'mocha', 'iced', 'official-photo'] },
    { category: 'Pearl Drinks & Milk Tea', name: 'Caramel Latte with Black Pearl (Iced)', description: 'Iced caramel latte layered over brown sugar black pearls in 10k Roses cup.', price: 195, image: '/images/10000-roses/milktea-pearl.png', tags: ['boba', 'pearl', 'caramel', 'iced', 'official-photo'] },
    { category: 'Pearl Drinks & Milk Tea', name: 'Taro Milk Tea with Pearl (Iced)', description: 'Sweet and fragrant purple taro milk tea loaded with chewy black pearls in signature 10000 Roses cup.', price: 180, image: '/images/10000-roses/milktea-pearl.png', tags: ['milktea', 'taro', 'boba', 'iced', 'official-photo'] },
    { category: 'Pearl Drinks & Milk Tea', name: 'Okinawa Milk Tea with Pearl (Iced)', description: 'Roasted brown sugar Okinawa black milk tea with soft tapioca pearls in signature 10000 Roses cup.', price: 180, image: '/images/10000-roses/milktea-pearl.png', tags: ['milktea', 'okinawa', 'boba', 'iced', 'official-photo'] },
    { category: 'Pearl Drinks & Milk Tea', name: 'Matcha Milk Tea with Pearl (Iced)', description: 'Earthy Japanese matcha milk tea combined with black boba pearls in signature 10000 Roses cup.', price: 185, image: '/images/10000-roses/milktea-pearl.png', tags: ['milktea', 'matcha', 'boba', 'iced', 'official-photo'] },
    { category: 'Pearl Drinks & Milk Tea', name: 'Wintermelon Milk Tea with Pearl (Iced)', description: 'Refreshing sweet wintermelon brewed milk tea with chewy black pearls in signature 10000 Roses cup.', price: 180, image: '/images/10000-roses/milktea-pearl.png', tags: ['milktea', 'wintermelon', 'boba', 'iced', 'official-photo'] },

    // Ice Blended Frappes & Smoothies
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Mocha Frappe (Iced)', description: 'Ice blended coffee and dark chocolate frappe crowned with whipped cream. (Official 10k Roses Photo)', price: 185, image: '/images/10000-roses/frappe.png', tags: ['frappe', 'mocha', 'bestseller'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Nutella Choco Frappe (Iced)', description: 'Decadent hazelnut Nutella chocolate blended with ice and whipped cream. (Official 10k Roses Photo)', price: 185, image: '/images/10000-roses/frappe.png', tags: ['frappe', 'nutella', 'chocolate', 'bestseller'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Nutella Mocha Frappe (Iced)', description: 'Rich Nutella hazelnut blended with espresso shots and chocolate. (Official 10k Roses Photo)', price: 195, image: '/images/10000-roses/frappe.png', tags: ['frappe', 'nutella', 'coffee', 'bestseller'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Matcha Frappe (Iced)', description: 'Japanese matcha green tea blended with milk and crushed ice. (Official 10k Roses Photo)', price: 180, image: '/images/10000-roses/frappe.png', tags: ['frappe', 'matcha'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Caramel Frappe (Iced)', description: 'Smooth blended caramel coffee drink with whipped topping and caramel drizzle. (Official 10k Roses Photo)', price: 190, image: '/images/10000-roses/frappe.png', tags: ['frappe', 'caramel'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Strawberry Yogurt Smoothie (Iced)', description: 'Real strawberry fruit blended with creamy tart yogurt.', price: 235, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80', tags: ['smoothie', 'strawberry', 'yogurt'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Strawberry and Banana Smoothie (Iced)', description: 'Fresh strawberries and ripe bananas blended with crushed ice and milk.', price: 235, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80', tags: ['smoothie', 'banana', 'strawberry'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Fresh Mango / Mango Yogurt Smoothie (Iced)', description: 'Sweet Cebu mangoes blended fresh or with creamy yogurt.', price: 235, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80', tags: ['smoothie', 'mango', 'cebu-mango'] },
    { category: 'Ice Blended & Real Fruit Smoothies', name: 'Watermelon Smoothie (Iced)', description: 'Crisp fresh red watermelon blended icy cold and refreshing.', price: 235, image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=600&auto=format&fit=crop&q=80', tags: ['smoothie', 'watermelon', 'fruit'] },

    // Coffee-Free & Drinks
    { category: 'Coffee-Free & Drinks', name: 'Signature Chocolate (Hot / Iced)', description: 'Rich velvety European hot cocoa or over ice with chocolate swirl (Hot ?140 / Iced ?150). (Best Seller)', price: 140, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80', tags: ['chocolate', 'hot-chocolate', 'bestseller'] },
    { category: 'Coffee-Free & Drinks', name: 'Matcha Tea Latte (Hot / Iced)', description: 'Steamed milk infused with pure green tea matcha powder (Hot ?165 / Iced ?175).', price: 165, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80', tags: ['matcha', 'latte'] },
    { category: 'Coffee-Free & Drinks', name: '10K Roserita Cocktail (Mango / Strawberry)', description: 'Signature fruity cafe margarita blend served with complimentary seasoned peanuts (Plain/Spicy/Garlic/Sweet). (Try It)', price: 350, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80', tags: ['cocktail', 'roserita', 'signature'] },
    { category: 'Coffee-Free & Drinks', name: 'Beer Bucket (5 Bottles)', description: 'Bucket of 5 ice-cold beers served with free peanuts (Plain/Spicy/Garlic/Sweet).', price: 499, image: '/images/10000-roses/beer-bucket.png', tags: ['beer', 'alcoholic', 'bucket'] },
    { category: 'Coffee-Free & Drinks', name: 'San Miguel Beer (Pilsen / Light / Flavored / Red Horse)', description: 'Chilled bottle of beer with free seasoned peanuts.', price: 105, image: '/images/10000-roses/san-miguel-beer.png', tags: ['beer', 'alcoholic'] },
    { category: 'Coffee-Free & Drinks', name: 'Soda Can (Coke, Coke Zero, Sprite, Royal, Cali)', description: 'Refreshing chilled 330ml canned soda.', price: 90, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', tags: ['soda', 'beverage'] },
    { category: 'Coffee-Free & Drinks', name: 'Bottled Mineral Water (500ml)', description: 'Purified mineral drinking water.', price: 55, image: '/images/10000-roses/bottled-water.png', tags: ['water', 'beverage'] }
  ];

  for (const item of items) {
    const catId = categoryMap[item.category];
    await pool.query(`
      INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7);
    `, [restaurantId, catId, item.name, item.description, item.price, item.image, item.tags]);
  }

  console.log(`Successfully seeded ${items.length} items for 10,000 Roses Cafe with official photos into database.`);
}

if (require.main === module) {
  seed10000Roses()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seed10000Roses };
