const { pool, withTransaction } = require('../config/db');

const RESTAURANT_SLUG = 'eat-n-repeat';

// Prices and photos supplied in the updated Eat n Repeat food menu and the two drink menus.
const CATEGORIES = [
  {
    "name": "LAMAW SERIES",
    "sortOrder": 1
  },
  {
    "name": "JAPAN / KOREAN",
    "sortOrder": 2
  },
  {
    "name": "SIZZLING",
    "sortOrder": 3
  },
  {
    "name": "FILIPINO DISHES",
    "sortOrder": 4
  },
  {
    "name": "FOOD ADD-ONS",
    "sortOrder": 5
  },
  {
    "name": "SNACKS",
    "sortOrder": 6
  },
  {
    "name": "ESPRESSO SERIES",
    "sortOrder": 7
  },
  {
    "name": "NON-COFFEE SERIES",
    "sortOrder": 8
  },
  {
    "name": "MILKTEA SERIES",
    "sortOrder": 9
  },
  {
    "name": "SHAKE / SMOOTHIES",
    "sortOrder": 10
  }
];

const ITEMS = [
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Siomai",
    "price": 89,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-siomai.jpg"
  },
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Lumpia",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-lumpia.jpg"
  },
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Spam",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-spam.jpg"
  },
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Combo",
    "price": 140,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-combo.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Curry Katsu",
    "price": 185,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-curry-katsu.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Tonkatsu",
    "price": 149,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-tonkatsu.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Teriyaki",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-teriyaki.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Special Ramen",
    "price": 180,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-special-ramen.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig w/ Spam",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-w-spam.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig w/ Siomai",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-w-siomai.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig w/ Lumpia",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-w-lumpia.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig Platter",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-platter.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Combo",
    "price": 179,
    "imageUrl": null
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Spaghetti",
    "price": 180,
    "imageUrl": "/images/eat-n-repeat/food/filipino-spaghetti.jpg"
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Carbonara",
    "price": 180,
    "imageUrl": "/images/eat-n-repeat/food/filipino-carbonara.jpg"
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Liempo",
    "price": 179,
    "imageUrl": "/images/eat-n-repeat/food/filipino-liempo.jpg"
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Pesto Buttered",
    "price": 179,
    "imageUrl": null
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Lumpia",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-lumpia.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Siomai",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-siomai.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Spam",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-spam.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Egg",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-egg.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Rice",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-rice.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Ham & Cheese",
    "price": 90,
    "imageUrl": "/images/eat-n-repeat/food/snacks-ham-cheese.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Double Bacon",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/food/snacks-double-bacon.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Fries",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/food/snacks-fries.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Nachos",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/food/snacks-nachos.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Carbonara Katsu",
    "price": 250,
    "imageUrl": "/images/eat-n-repeat/food/snacks-carbonara-katsu.jpg"
  },
  {
    "category": "SNACKS",
    "name": "3lt",
    "price": 110,
    "imageUrl": null
  },
  {
    "category": "SNACKS",
    "name": "The Hangover",
    "price": 130,
    "imageUrl": null
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Americano (Small)",
    "price": 95,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-americano.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Americano (Medium)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-americano.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Dirty Matcha (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-dirty-matcha.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Dirty Matcha (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-dirty-matcha.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Latte (Spanish Latte) (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-latte-spanish-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Latte (Spanish Latte) (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-latte-spanish-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Biscoff (Small)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-biscoff.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Biscoff (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-biscoff.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "White Chocolate Latte (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-white-chocolate-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "White Chocolate Latte (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-white-chocolate-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Caramel Macchiato (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-caramel-macchiato.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Caramel Macchiato (Medium)",
    "price": 140,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-caramel-macchiato.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Salted Caramel (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-salted-caramel.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Salted Caramel (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-salted-caramel.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Hazelnut Mocha (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-hazelnut-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Hazelnut Mocha (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-hazelnut-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha Cream (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha Cream (Medium)",
    "price": 140,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Strawberry Cream (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-strawberry-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Strawberry Cream (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-strawberry-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Chocolate (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-chocolate.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Chocolate (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-chocolate.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Mango Graham Mocha (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-mango-graham-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Mango Graham Mocha (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-mango-graham-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Biscoff (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-biscoff.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Biscoff (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-biscoff.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Matcha (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-matcha.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Matcha (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-matcha.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Caramel (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-caramel.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Caramel (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-caramel.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Okinawa (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-okinawa.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Okinawa (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-okinawa.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Strawberry (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-strawberry.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Strawberry (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-strawberry.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Wintermelon (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-wintermelon.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Wintermelon (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-wintermelon.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Hershey’s (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-hersheys.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Hershey’s (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-hersheys.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Chessy Mango (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-chessy-mango.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Chessy Mango (Medium)",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-chessy-mango.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Matcha",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-matcha.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Avocado",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-avocado.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Chocolate",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-chocolate.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Strawberry",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-strawberry.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Cookies & Cream",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-cookies-cream.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Mango Banana",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-mango-banana.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Banana Strawberry",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-banana-strawberry.png"
  }
];

const LEGACY_SAMPLE_NAMES = [
  "House Special Latte",
  "Cordova Cold Brew",
  "Uji Matcha Milktea",
  "Brown Sugar Boba Milk",
  "Signature Chicken Inasal Rice Bowl",
  "Spam & Egg Comfort Bowl",
  "French Butter Croissant",
  "Garlic Parmesan Truffle Fries"
];

async function seedEatNRepeatMenu() {
  return withTransaction(async (client) => {
    const restaurantResult = await client.query('SELECT id FROM restaurants WHERE slug = $1 FOR UPDATE', [RESTAURANT_SLUG]);
    if (restaurantResult.rows.length !== 1) throw new Error('Eat n Repeat restaurant was not found');
    const restaurantId = restaurantResult.rows[0].id;
    const categoryIds = new Map();

    for (const category of CATEGORIES) {
      const existing = await client.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, category.name]
      );
      if (existing.rows.length > 1) throw new Error('Duplicate category: ' + category.name);
      let categoryId = existing.rows[0]?.id;
      if (!categoryId) {
        const inserted = await client.query(
          'INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id',
          [restaurantId, category.name, category.sortOrder]
        );
        categoryId = inserted.rows[0].id;
      }
      categoryIds.set(category.name, categoryId);
    }

    let inserted = 0;
    let updated = 0;
    for (const item of ITEMS) {
      const categoryId = categoryIds.get(item.category);
      const existing = await client.query(
        'SELECT id FROM menu_items WHERE restaurant_id = $1 AND category_id = $2 AND name = $3 FOR UPDATE',
        [restaurantId, categoryId, item.name]
      );
      if (existing.rows.length > 1) throw new Error('Duplicate menu item: ' + item.category + ' / ' + item.name);
      if (existing.rows.length === 1) {
        await client.query(
          'UPDATE menu_items SET description = $1, price = $2, image_url = $3 WHERE id = $4',
          ['', item.price, item.imageUrl, existing.rows[0].id]
        );
        updated += 1;
      } else {
        await client.query(
          'INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags) VALUES ($1, $2, $3, $4, $5, $6, true, $7)',
          [restaurantId, categoryId, item.name, '', item.price, item.imageUrl, []]
        );
        inserted += 1;
      }
    }

    const oldNames = LEGACY_SAMPLE_NAMES.filter((name) => !ITEMS.some((item) => item.name === name));
    const hidden = oldNames.length
      ? (await client.query(
          'UPDATE menu_items SET is_available = false WHERE restaurant_id = $1 AND name = ANY($2::text[]) AND is_available = true',
          [restaurantId, oldNames]
        )).rowCount
      : 0;
    return { restaurantId, inserted, updated, hidden, total: ITEMS.length };
  });
}

if (require.main === module) {
  seedEatNRepeatMenu()
    .then(({ inserted, updated, hidden, total }) => {
      console.log(`Eat n Repeat menu: ${inserted} inserted, ${updated} updated, ${hidden} old samples hidden, ${total} source items.`);
    })
    .catch((error) => { console.error('Eat n Repeat menu import failed:', error); process.exitCode = 1; })
    .finally(() => pool.end());
}

module.exports = { seedEatNRepeatMenu };
