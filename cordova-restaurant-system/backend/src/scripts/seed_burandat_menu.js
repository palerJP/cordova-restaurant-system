const fs = require('node:fs');
const path = require('node:path');
const { pool, withTransaction } = require('../config/db');

const RESTAURANT_SLUG = 'burandat-seafood-bucket';
const HORIZON_SLUG = 'horizon-bean-cafe';
const MENU_PATH = path.resolve(__dirname, '../../../frontend/src/data/burandatMenu.json');

// A previous import left an exact copy of Horizon Bean Cafe's 65 menu items
// attached to Burandat. Limit the correction to that known import batch.
const CLONE_BATCH_START = '2026-09-10T05:54:55.000Z';
const CLONE_BATCH_END = '2026-09-10T05:54:56.000Z';

function loadMenu() {
  const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
  if (!Array.isArray(menu.categories) || !Array.isArray(menu.items)) {
    throw new Error('Burandat menu must contain categories and items arrays');
  }

  const categoryNames = new Set();
  for (const category of menu.categories) {
    if (typeof category.name !== 'string' || !category.name.trim() || category.name.length > 100 ||
        !Number.isInteger(category.sortOrder)) {
      throw new Error('Invalid Burandat menu category');
    }
    if (categoryNames.has(category.name)) {
      throw new Error(`Duplicate Burandat menu category: ${category.name}`);
    }
    categoryNames.add(category.name);
  }

  const itemNames = new Set();
  for (const item of menu.items) {
    if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 150 ||
        !categoryNames.has(item.category) || !Number.isFinite(item.price) || item.price < 0 ||
        typeof item.image_url !== 'string' || !item.image_url.startsWith('/images/burandat/') ||
        item.image_url.length > 500 ||
        (item.unit !== undefined && (typeof item.unit !== 'string' || !item.unit.trim() || item.unit.length > 30))) {
      throw new Error(`Invalid Burandat menu item: ${item.name || '(unnamed)'}`);
    }
    if (itemNames.has(item.name)) {
      throw new Error(`Duplicate Burandat menu item: ${item.name}`);
    }
    itemNames.add(item.name);
  }

  return menu;
}

async function seedBurandatMenu(menu = loadMenu()) {
  return withTransaction(async (client) => {
    // Lock the restaurant row so concurrent imports cannot add duplicate rows.
    const restaurantResult = await client.query(
      'SELECT id FROM restaurants WHERE slug = $1 FOR UPDATE',
      [RESTAURANT_SLUG]
    );
    if (restaurantResult.rows.length !== 1) {
      throw new Error(`Restaurant with slug ${RESTAURANT_SLUG} was not found`);
    }
    const restaurantId = restaurantResult.rows[0].id;

    // Preserve the misplaced records for recovery. Archive only items that
    // match Horizon's name, price, photo, description, and category exactly.
    const archivedResult = await client.query(
      `UPDATE menu_items AS b
       SET is_available = false
       FROM menu_categories AS bc
       WHERE b.restaurant_id = $1
         AND b.category_id = bc.id
         AND b.is_available = true
         AND b.created_at >= $2::timestamptz
         AND b.created_at < $3::timestamptz
         AND EXISTS (
           SELECT 1
           FROM restaurants AS hr
           JOIN menu_items AS h ON h.restaurant_id = hr.id
           JOIN menu_categories AS hc ON hc.id = h.category_id
           WHERE hr.slug = $4
             AND h.name = b.name
             AND h.price = b.price
             AND h.image_url IS NOT DISTINCT FROM b.image_url
             AND h.description IS NOT DISTINCT FROM b.description
             AND hc.name = bc.name
         )`,
      [restaurantId, CLONE_BATCH_START, CLONE_BATCH_END, HORIZON_SLUG]
    );

    const categoryIds = new Map();
    for (const category of menu.categories) {
      const existing = await client.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, category.name]
      );
      if (existing.rows.length > 1) {
        throw new Error(`Duplicate Burandat menu category in database: ${category.name}`);
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
    let unchanged = 0;
    for (const item of menu.items) {
      const existing = await client.query(
        'SELECT id FROM menu_items WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, item.name]
      );
      if (existing.rows.length > 1) {
        throw new Error(`Duplicate Burandat menu item in database: ${item.name}`);
      }

      const categoryId = categoryIds.get(item.category);
      if (existing.rows.length === 1) {
        // Keep any owner-written description, availability, and dietary tags.
        const changed = await client.query(
          `UPDATE menu_items
           SET category_id = $1, price = $2, image_url = $3
           WHERE id = $4 AND (
             category_id IS DISTINCT FROM $1 OR
             price IS DISTINCT FROM $2 OR
             image_url IS DISTINCT FROM $3
           )`,
          [categoryId, item.price, item.image_url, existing.rows[0].id]
        );
        if (changed.rowCount) updated += 1;
        else unchanged += 1;
      } else {
        await client.query(
          `INSERT INTO menu_items
             (restaurant_id, category_id, name, description, price, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [restaurantId, categoryId, item.name,
            item.unit ? `Price per ${item.unit}.` : null,
            item.price, item.image_url]
        );
        inserted += 1;
      }
    }

    return { restaurantId, archived: archivedResult.rowCount, inserted, updated, unchanged };
  });
}

if (require.main === module) {
  seedBurandatMenu()
    .then(({ restaurantId, archived, inserted, updated, unchanged }) => {
      console.log(`Burandat menu for ${restaurantId}: ${archived} misplaced items archived, ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`);
    })
    .catch((error) => {
      console.error('Burandat menu import failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { loadMenu, seedBurandatMenu };
