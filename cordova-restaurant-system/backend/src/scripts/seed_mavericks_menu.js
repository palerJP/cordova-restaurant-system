const { pool, withTransaction } = require('../config/db');

const RESTAURANT_SLUG = 'mavericks-by-the-baker-street';

const CATEGORIES = [
  { name: 'Sando & Ciabatta', sortOrder: 1 },
  { name: 'Assiettes', sortOrder: 2 },
  { name: 'Pasta', sortOrder: 3 },
  { name: 'Burger', sortOrder: 4 },
  { name: 'Snacks', sortOrder: 5 },
  { name: 'Foundation Coffee', sortOrder: 6 },
  { name: 'Blended Concoction', sortOrder: 7 },
  { name: 'Octane Hydration', sortOrder: 8 },
  { name: 'Octane Fruit BLNDS', sortOrder: 9 },
];

function drinkItem(category, name, price, imageName, description = '') {
  return {
    category,
    name,
    description,
    price,
    imageUrl: `/images/mavericks/${imageName}.jpg`,
  };
}

const FOUNDATION_COFFEES = [
  { name: 'AMRCN', hot: 130, iced: 125, image: 'foundation-amrcn' },
  { name: 'CAFE LTT', hot: 145, iced: 140, image: 'foundation-cafe-ltt' },
  { name: 'MACCHTT', hot: 140, image: 'foundation-cafe-ltt' },
  { name: 'CAFE MOCHA', hot: 170, iced: 165, image: 'foundation-cafe-mocha' },
  { name: 'CAPPCN', hot: 145, iced: 140, image: 'foundation-cafe-ltt' },
  { name: 'CAFE CIOCCOLATTA', hot: 165, iced: 160, image: 'foundation-cafe-cioccolatta' },
];

const FRAPPES = [
  { name: 'BISCOFF SALTED CARAMEL FRPP', price: 175, image: 'frappe-biscoff-salted-caramel', description: 'Creamy blended coffee frappe infused with rich Biscoff cookie butter and smooth salted caramel.' },
  { name: 'W MOCHA FRPP', price: 160, image: 'frappe-w-mocha', description: 'Espresso, premium W chocolate, milk, and whipped cream.' },
  { name: 'ESPRESSO CARAMEL FRPP', price: 165, image: 'frappe-espresso-caramel', description: 'Espresso, caramel syrup, milk, and cream.' },
  { name: 'VANILLA ESPRESSO FRPP', price: 165, image: 'frappe-vanilla-espresso', description: 'A milder coffee blend with vanilla.' },
  { name: 'CHOCOLAUT FRPP', price: 165, image: 'frappe-chocolaut', description: 'Rich cocoa, milk, ice, and whipped cream.' },
  { name: 'MATCHA SUPREME FRPP', price: 175, image: 'frappe-matcha-supreme', description: 'Rich matcha blended until earthy, smooth, and creamy.' },
  { name: 'STRAWBERRY MATCHA FRPP', price: 180, image: 'frappe-strawberry-matcha', description: 'Sweet strawberry meets vibrant matcha in a creamy, refreshing frappe.' },
  { name: 'JAVA CRMBLE FRPP', price: 180, image: 'frappe-java-crmble', description: 'Creamy coffee and chocolate with crunchy chocolate chips and whipped cream.' },
  { name: 'OREO CLASSIC FRPP', price: 170, image: 'frappe-oreo-classic', description: 'Creamy espresso blended with crushed Oreos for a sweet, decadent hit.' },
  { name: 'ESPRESSO CLASSIC FRPP', price: 165, image: 'frappe-espresso-classic', description: 'Bold espresso blended with ice and milk for a smooth, creamy coffee fix.' },
];

const HYDRATION_DRINKS = [
  { name: 'CRIMSON OCTN', fizz: 135, freeze: 140, image: 'octane-crimson', description: 'A bright, iced hydration blend powered with fresh strawberry tang and a smooth energy lift.' },
  { name: 'VELOCITY OCTN', fizz: 135, freeze: 140, image: 'octane-velocity', description: 'Cool, deep mixed berry refreshment with a clean boost to keep you moving.' },
  { name: 'HONEY CITRON OCTN', fizz: 145, freeze: 150, image: 'octane-honey-citron', description: 'Zesty honey citrus hydration, sharp, crisp, and instantly awakening.' },
  { name: 'GREEN APPLE OCTN', fizz: 135, freeze: 140, image: 'octane-green-apple', description: 'Crisp apple fuel with a high-voltage fizz. Sharp, tart, and built for a total system restart.' },
  { name: 'KIWI OCTN', fizz: 135, freeze: 140, image: 'octane-kiwi', description: 'A lively kiwi hydration drink with a fresh tang and smooth finish, built for recovery.' },
];

const FRUIT_BLENDS = [
  { name: 'Strawberry BLND', image: 'fruit-strawberry', description: 'Bright strawberry, smooth and sweet.' },
  // The source menu's Wildberry description describes avocado; keep this blank until corrected.
  { name: 'Wildberry BLND', image: 'fruit-wildberry', description: '' },
  { name: 'Blueberry BLND', image: 'fruit-blueberry', description: 'A smooth and fruity blend featuring the rich sweetness of fresh blueberries.' },
  { name: 'Mango BLND', image: 'fruit-mango', description: 'Ripe mango, thick and refreshing.' },
  { name: 'Avocado BLND', image: 'fruit-avocado', description: 'Creamy, smooth, and naturally rich avocado blended cold for a clean, satisfying finish.' },
  { name: 'Coconut BLND', image: 'fruit-coconut', description: 'Creamy coconut blended smooth and refreshing with a light tropical finish.' },
];

const DRINK_ITEMS = [
  ...FOUNDATION_COFFEES.flatMap((coffee) => [
    drinkItem('Foundation Coffee', `${coffee.name} (Hot)`, coffee.hot, coffee.image),
    ...(coffee.iced === undefined ? [] : [
      drinkItem('Foundation Coffee', `${coffee.name} (Iced)`, coffee.iced, coffee.image),
    ]),
  ]),
  ...FRAPPES.map((frappe) =>
    drinkItem('Blended Concoction', frappe.name, frappe.price, frappe.image, frappe.description)),
  ...HYDRATION_DRINKS.flatMap((drink) => [
    drinkItem('Octane Hydration', `${drink.name} (Fizz)`, drink.fizz, drink.image, drink.description),
    drinkItem('Octane Hydration', `${drink.name} (Freeze)`, drink.freeze, drink.image, drink.description),
  ]),
  ...FRUIT_BLENDS.flatMap((blend) => [
    drinkItem('Octane Fruit BLNDS', `${blend.name} (Classic)`, 180, blend.image, blend.description),
    drinkItem('Octane Fruit BLNDS', `${blend.name} (Yogurt)`, 210, blend.image, blend.description),
  ]),
];

const ITEMS = [
  // Sando & Ciabatta
  {
    category: 'Sando & Ciabatta',
    name: 'Croque Madamme Ciabatta',
    description: 'Gourmet toasted ciabatta croque madame layered with savory ham, melted cheese, and crowned with a sunny-side-up egg.',
    price: 250,
    imageUrl: '/images/mavericks/croque-madamme-ciabatta.jpg',
  },
  {
    category: 'Sando & Ciabatta',
    name: 'Ciabatta Pesto Chicken',
    description: 'Panini-pressed ciabatta sandwich filled with tender chicken breast, aromatic basil pesto, melted cheese, and fresh greens.',
    price: 285,
    imageUrl: '/images/mavericks/ciabatta-pesto-chicken.jpg',
  },
  {
    category: 'Sando & Ciabatta',
    name: 'Open Sando Classic',
    description: 'Artisan sourdough open-face sando topped with savory cold cuts, pesto, sun-dried tomatoes, and crisp greens.',
    price: 195,
    imageUrl: '/images/mavericks/open-sando-classic.jpg',
  },
  {
    category: 'Sando & Ciabatta',
    name: 'Waffle + Sauce',
    description: 'Crispy golden Belgian waffle drizzled with decadent warm chocolate sauce and lightly dusted with powdered sugar.',
    price: 190,
    imageUrl: '/images/mavericks/waffle-sauce.jpg',
  },
  {
    category: 'Sando & Ciabatta',
    name: 'Waffle + Fruit Confit',
    description: 'Warm golden waffle topped with house-made berry fruit confit and a dollop of whipped cream.',
    price: 195,
    imageUrl: '/images/mavericks/waffle-fruit-confit.jpg',
  },

  // Assiettes
  {
    category: 'Assiettes',
    name: 'Luncheon Meat',
    description: 'Thick-cut savory luncheon meat pan-fried to a crisp golden exterior.',
    price: 220,
    imageUrl: '/images/mavericks/luncheon-meat.jpg',
  },
  {
    category: 'Assiettes',
    name: 'Hash Brown',
    description: 'Golden fried shredded potato hash brown patties served with savory dipping sauce and ketchup.',
    price: 210,
    imageUrl: '/images/mavericks/hash-brown-assiette.jpg',
  },
  {
    category: 'Assiettes',
    name: 'Hamonada',
    description: 'Tender sweet and savory glazed pork hamonada slow-cooked in rich sauce with pineapple slices.',
    price: 210,
    imageUrl: '/images/mavericks/hamonada.jpg',
  },
  {
    category: 'Assiettes',
    name: 'Filipino Lumpia',
    description: 'Crispy golden fried Filipino spring rolls served with sweet chili dipping sauce.',
    price: 210,
    imageUrl: '/images/mavericks/filipino-lumpia.jpg',
  },
  {
    category: 'Assiettes',
    name: 'Burger Steak',
    description: 'Juicy beef patties simmered in rich savory mushroom gravy and garnished with fresh herbs.',
    price: 250,
    imageUrl: '/images/mavericks/burger-steak.jpg',
  },

  // Pasta
  {
    category: 'Pasta',
    name: 'White Capellini',
    description: 'Classic capellini garlic pepper mushroom cream sauce.',
    price: 310,
    imageUrl: '/images/mavericks/white-capellini.jpg',
  },
  {
    category: 'Pasta',
    name: 'Capellini Marinara',
    description: 'Light tomato marinara with olive oil & herbs.',
    price: 290,
    imageUrl: '/images/mavericks/capellini-marinara.jpg',
  },
  {
    category: 'Pasta',
    name: 'Penne Alfredo',
    description: 'Classic cream sauce with garlic, parmesan, and black pepper.',
    price: 290,
    imageUrl: '/images/mavericks/penne-alfredo.jpg',
  },
  {
    category: 'Pasta',
    name: 'Penne Arrabbiata',
    description: 'Tomato-based sauce with chili heat and olive oil.',
    price: 310,
    imageUrl: '/images/mavericks/penne-arrabbiata.jpg',
  },
  {
    category: 'Pasta',
    name: 'Fusilli Pesto Cream',
    description: 'Basil pesto folded into light cream sauce.',
    price: 290,
    imageUrl: '/images/mavericks/fusilli-pesto-cream.jpg',
  },
  {
    category: 'Pasta',
    name: 'Fusilli Bolognese',
    description: 'Slow-simmered meat tomato sauce that clings to every twist.',
    price: 310,
    imageUrl: '/images/mavericks/fusilli-bolognese.jpg',
  },

  // Burger
  {
    category: 'Burger',
    name: '1998 Mavericks',
    description: 'A premium Angus beef patty topped with melted cheddar, sweet relish pickles, and caramelized onions. Stacked with fresh lettuce and tomato, drizzled in Mavericks Sauce, and served on a toasted wheat bun.',
    price: 499,
    imageUrl: '/images/mavericks/1998-mavericks.png',
  },
  {
    category: 'Burger',
    name: 'Mavericks Angus Burger',
    description: 'A premium Angus beef patty topped with melted cheddar, served on a toasted wheat bun.',
    price: 390,
    imageUrl: '/images/mavericks/mavericks-angus-burger.png',
  },

  // Snacks
  {
    category: 'Snacks',
    name: 'Classic Crinkle Cut Fries',
    description: 'Golden crinkle-cut French fries fried to perfection and seasoned lightly.',
    price: 185,
    imageUrl: '/images/mavericks/classic-crinkle-cut-fries.png',
  },
  {
    category: 'Snacks',
    name: 'Nachos',
    description: 'Crispy corn tortilla chips loaded with melted cheese, savory beef sauce, sliced jalapenos, and dips.',
    price: 195,
    imageUrl: '/images/mavericks/nachos.png',
  },
  {
    category: 'Snacks',
    name: 'Hash-Brown',
    description: 'Crispy round potato hash-brown patties cooked golden brown served with dipping ketchup.',
    price: 120,
    imageUrl: '/images/mavericks/hash-brown-snack.png',
  },
  {
    category: 'Snacks',
    name: 'Tater Tots',
    description: 'Golden bite-sized grated potato tots fried crunchy on the outside and tender inside.',
    price: 195,
    imageUrl: '/images/mavericks/tater-tots.png',
  },
  ...DRINK_ITEMS,
];

async function seedMavericksMenu() {
  return withTransaction(async (client) => {
    const restaurantResult = await client.query(
      'SELECT id FROM restaurants WHERE slug = $1 FOR UPDATE',
      [RESTAURANT_SLUG]
    );
    if (restaurantResult.rows.length !== 1) {
      throw new Error(`Restaurant with slug ${RESTAURANT_SLUG} was not found`);
    }
    const restaurantId = restaurantResult.rows[0].id;
    const categoryIds = new Map();

    for (const category of CATEGORIES) {
      const existing = await client.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, category.name]
      );

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
      const existing = await client.query(
        'SELECT id FROM menu_items WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, item.name]
      );

      const categoryId = categoryIds.get(item.category);
      if (existing.rows.length >= 1) {
        await client.query(
          'UPDATE menu_items SET category_id = $1, description = $2, price = $3, image_url = $4 WHERE id = $5',
          [categoryId, item.description, item.price, item.imageUrl, existing.rows[0].id]
        );
        updated += 1;
      } else {
        await client.query(
          `INSERT INTO menu_items
             (restaurant_id, category_id, name, description, price, image_url, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [restaurantId, categoryId, item.name, item.description, item.price, item.imageUrl]
        );
        inserted += 1;
      }
    }

    return { restaurantId, inserted, updated, total: ITEMS.length };
  });
}

if (require.main === module) {
  seedMavericksMenu()
    .then(({ restaurantId, inserted, updated, total }) => {
      console.log(`Mavericks menu for ${restaurantId}: ${inserted} inserted, ${updated} updated, ${total} total.`);
    })
    .catch((error) => {
      console.error('Mavericks menu import failed:', error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { seedMavericksMenu };
