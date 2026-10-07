const fs = require('node:fs');
const path = require('node:path');
const { pool, withTransaction } = require('../config/db');

// The existing CordovaEats listing uses this slug, despite the spelling on Foodpanda.
const RESTAURANT_SLUG = 'cascaja-cafe';
const MENU_PATH = path.resolve(__dirname, '../../../frontend/src/data/cascadjaMenu.json');

function loadMenu() {
  const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
  if (!Array.isArray(menu.categories) || !Array.isArray(menu.items) || menu.items.length === 0) {
    throw new Error('Cascadja menu must contain categories and at least one item');
  }

  const categoryNames = new Set();
  for (const category of menu.categories) {
    if (typeof category.name !== 'string' || !category.name.trim() || category.name.length > 100 ||
        !Number.isInteger(category.sortOrder) || category.sortOrder < 0 ||
        categoryNames.has(category.name)) {
      throw new Error(`Invalid or duplicate Cascadja menu category: ${category.name || '(unnamed)'}`);
    }
    categoryNames.add(category.name);
  }

  const itemNames = new Set();
  for (const item of menu.items) {
    const imageUrlIsValid = typeof item.image_url === 'string' &&
      item.image_url.length <= 500 &&
      (item.image_url.startsWith('https://') || item.image_url.startsWith('/images/'));
    if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 150 ||
        !categoryNames.has(item.category) ||
        typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0 ||
        !imageUrlIsValid ||
        (item.description !== undefined &&
          (typeof item.description !== 'string' || item.description.length > 2000)) ||
        (item.startingPrice !== undefined && typeof item.startingPrice !== 'boolean') ||
        (item.image_is_representative !== undefined && typeof item.image_is_representative !== 'boolean') ||
        itemNames.has(item.name)) {
      throw new Error(`Invalid or duplicate Cascadja menu item: ${item.name || '(unnamed)'}`);
    }
    itemNames.add(item.name);
  }

  return menu;
}

function descriptionFor(item) {
  const notes = [];
  if (item.startingPrice) notes.push('Starting price; final price depends on the selected option.');
  if (item.description) notes.push(item.description.trim());
  if (item.image_is_representative) notes.push('Representative image.');
  return notes.join(' ') || null;
}

async function seedCascadjaMenu(menu = loadMenu()) {
  return withTransaction(async (client) => {
    // Serialize imports for this restaurant so concurrent runs cannot duplicate rows.
    const restaurantResult = await client.query(
      'SELECT id FROM restaurants WHERE slug = $1 FOR UPDATE',
      [RESTAURANT_SLUG]
    );
    if (restaurantResult.rows.length !== 1) {
      throw new Error(`Restaurant with slug ${RESTAURANT_SLUG} was not found`);
    }
    const restaurantId = restaurantResult.rows[0].id;
    const categoryIds = new Map();

    for (const category of menu.categories) {
      const existing = await client.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, category.name]
      );
      if (existing.rows.length > 1) {
        throw new Error(`Duplicate Cascadja menu category in database: ${category.name}`);
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
        throw new Error(`Duplicate Cascadja menu item in database: ${item.name}`);
      }

      const categoryId = categoryIds.get(item.category);
      if (existing.rows.length === 1) {
        // Keep owner descriptions, availability, and dietary tags intact.
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
          [restaurantId, categoryId, item.name, descriptionFor(item), item.price, item.image_url]
        );
        inserted += 1;
      }
    }

    return { restaurantId, inserted, updated, unchanged };
  });
}

if (require.main === module) {
  seedCascadjaMenu()
    .then(({ restaurantId, inserted, updated, unchanged }) => {
      console.log(`Cascadja menu for ${restaurantId}: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`);
    })
    .catch((error) => {
      console.error('Cascadja menu import failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { loadMenu, seedCascadjaMenu };
