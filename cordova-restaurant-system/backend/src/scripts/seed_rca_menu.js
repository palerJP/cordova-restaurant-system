const { pool, withTransaction } = require('../config/db');

const RESTAURANT_SLUG = 'rca-bilao-food-station';
const IMAGE_BASE = 'https://foodpanda.dhmedia.io/image/fd-ph/Products';

// Names, starting prices, and product images are from the RCA Food Station
// Foodpanda menu. Items with options are listed at their lowest shown price.
const CATEGORIES = [
  { name: 'RCA Lechon Belly', sortOrder: 1 },
  { name: 'RCA Food Set', sortOrder: 2 },
  { name: 'RCA Kakanin', sortOrder: 3 },
];

const ITEMS = [
  { category: 'RCA Lechon Belly', name: 'Lechon Belly', price: 2779, imageId: 72198320, startingPrice: true },
  { category: 'RCA Food Set', name: 'Round Bilao Set A', price: 1535, imageId: 72198321 },
  { category: 'RCA Food Set', name: 'Round Bilao Set B', price: 2790, imageId: 72198322 },
  { category: 'RCA Food Set', name: 'Budget A', price: 3060, imageId: 72198323 },
  { category: 'RCA Food Set', name: 'Budget B', price: 3480, imageId: 72198324 },
  { category: 'RCA Food Set', name: 'Bilao Set A', price: 4180, imageId: 72198325 },
  { category: 'RCA Food Set', name: 'Bilao Set B', price: 4180, imageId: 72227052 },
  { category: 'RCA Food Set', name: 'Seafood Bilao Set A', price: 2780, imageId: 72198326 },
  { category: 'RCA Food Set', name: 'Food Set A', price: 3755, imageId: 72198327 },
  { category: 'RCA Food Set', name: 'Food Set B', price: 3755, imageId: 72198328 },
  { category: 'RCA Food Set', name: 'Food Set C', price: 3755, imageId: 72198329 },
  { category: 'RCA Food Set', name: 'Food Set D', price: 3755, imageId: 72198330 },
  { category: 'RCA Food Set', name: 'Food Set E', price: 3755, imageId: 72198331 },
  { category: 'RCA Kakanin', name: 'RCA KAKANIN', price: 973, imageId: 72198332, startingPrice: true },
];

async function seedRcaMenu() {
  return withTransaction(async (client) => {
    // Lock the restaurant row so two imports cannot create duplicate rows.
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
      if (existing.rows.length > 1) {
        throw new Error(`Duplicate RCA menu category: ${category.name}`);
      }

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
      if (existing.rows.length > 1) {
        throw new Error(`Duplicate RCA menu item: ${item.name}`);
      }

      const categoryId = categoryIds.get(item.category);
      const imageUrl = `${IMAGE_BASE}/${item.imageId}.jpg`;
      if (existing.rows.length === 1) {
        // Keep owner-written descriptions, availability, and dietary tags.
        await client.query(
          'UPDATE menu_items SET category_id = $1, price = $2, image_url = $3 WHERE id = $4',
          [categoryId, item.price, imageUrl, existing.rows[0].id]
        );
        updated += 1;
      } else {
        await client.query(
          `INSERT INTO menu_items
             (restaurant_id, category_id, name, description, price, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [restaurantId, categoryId, item.name,
            item.startingPrice ? 'Starting price; final price depends on the selected option.' : null,
            item.price, imageUrl]
        );
        inserted += 1;
      }
    }

    return { restaurantId, inserted, updated };
  });
}

seedRcaMenu()
  .then(({ restaurantId, inserted, updated }) => {
    console.log(`RCA menu for ${restaurantId}: ${inserted} inserted, ${updated} updated.`);
  })
  .catch((error) => {
    console.error('RCA menu import failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
