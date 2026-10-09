const fs = require('node:fs');
const path = require('node:path');
const { pool, withTransaction } = require('../config/db');
const menu = require('../../../frontend/src/data/entoysMenuSource.json');

const RESTAURANT_SLUG = 'entoys-bakasihan';
const IMAGE_PREFIX = '/images/entoys-bakasihan/';
const PUBLIC_DIR = path.resolve(__dirname, '../../../frontend/public');

// Exact demo records inserted by the older seed_establishments.js script.
// Keep owner-edited records; only hide unchanged demo rows after the real menu is imported.
const LEGACY_SAMPLES = [
  ['Linarang Bakasi', 'Signature sour and spicy eel soup with tomatoes, fermented black beans, and local chili', 150],
  ['Crispy Fried Bakasi', 'Crunchy deep-fried reef eels served with spicy vinegar dip', 130],
  ['Nilapwaan Kinsahon', 'Fresh local shellfish boiled in aromatic herbs and ginger', 160],
  ['Garlic Butter Shrimp', 'Fresh Cordova sea shrimp in garlic butter sauce', 250],
  ['Sinugbang Bangus', 'Grilled stuffed milkfish with tomato onion salsa', 220],
  ['Lambay (Steamed Crab)', 'Fresh local mud crabs steamed with native vinegar dip', 300],
];

function validateMenu(source = menu) {
  if (!Array.isArray(source.categories) || source.categories.length === 0 ||
      !Array.isArray(source.items) || source.items.length === 0) {
    throw new Error('Entoy menu must contain categories and items');
  }

  const categoryNames = new Set();
  for (const category of source.categories) {
    if (typeof category.name !== 'string' || !category.name.trim() || category.name.length > 100 ||
        !Number.isInteger(category.sortOrder) || categoryNames.has(category.name)) {
      throw new Error(`Invalid or duplicate Entoy category: ${category.name}`);
    }
    categoryNames.add(category.name);
  }

  const itemNames = new Set();
  for (const item of source.items) {
    const firstPrice = typeof item.priceLabel === 'string'
      ? item.priceLabel.match(/^₱\s*([\d,]+(?:\.\d{1,2})?)/u)
      : null;
    if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 150 ||
        itemNames.has(item.name) || !categoryNames.has(item.category) ||
        typeof item.description !== 'string' || !Number.isFinite(item.price) || item.price < 0 ||
        !firstPrice || Number(firstPrice[1].replace(/,/g, '')) !== item.price ||
        ((item.priceLabel.includes('–') || item.priceLabel.includes('+')) &&
          !item.description.includes('₱')) ||
        typeof item.imageUrl !== 'string' || !item.imageUrl.startsWith(IMAGE_PREFIX) ||
        item.imageUrl.includes('..') || item.imageUrl.length > 500 ||
        !fs.existsSync(path.resolve(PUBLIC_DIR, item.imageUrl.slice(1)))) {
      throw new Error(`Invalid Entoy item, price, or photo: ${item.name || '(unnamed)'}`);
    }
    itemNames.add(item.name);
  }

  return source;
}

function isLegacySample(row) {
  return row.category_name === 'Signature Dishes' && LEGACY_SAMPLES.some(
    ([name, description, price]) =>
      row.name === name && row.description === description && Number(row.price) === price
  );
}

function selectExisting(rows, item, categoryId) {
  const current = rows.filter((row) =>
    row.category_id === categoryId && row.image_url === item.imageUrl
  );
  if (current.length === 1) return current[0];
  if (current.length > 1) throw new Error(`Duplicate Entoy menu item: ${item.name}`);

  const legacy = rows.filter(isLegacySample);
  if (legacy.length) return legacy[0];
  if (rows.length === 1) return rows[0];
  if (rows.length > 1) throw new Error(`Duplicate Entoy menu item: ${item.name}`);
  return null;
}

async function seedEntoysMenu(source = menu) {
  validateMenu(source);
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

    for (const category of source.categories) {
      const existing = await client.query(
        'SELECT id, sort_order FROM menu_categories WHERE restaurant_id = $1 AND name = $2 FOR UPDATE',
        [restaurantId, category.name]
      );
      if (existing.rows.length > 1) {
        throw new Error(`Duplicate Entoy menu category: ${category.name}`);
      }

      let categoryId = existing.rows[0]?.id;
      if (categoryId) {
        if (existing.rows[0].sort_order !== category.sortOrder) {
          await client.query('UPDATE menu_categories SET sort_order = $1 WHERE id = $2',
            [category.sortOrder, categoryId]);
        }
      } else {
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
    for (const item of source.items) {
      const categoryId = categoryIds.get(item.category);
      const existing = await client.query(
        `SELECT mi.id, mi.name, mi.category_id, mi.description, mi.price, mi.image_url,
                mi.is_available, mc.name AS category_name
         FROM menu_items AS mi
         LEFT JOIN menu_categories AS mc ON mc.id = mi.category_id
         WHERE mi.restaurant_id = $1 AND mi.name = $2
         ORDER BY mi.created_at, mi.id
         FOR UPDATE OF mi`,
        [restaurantId, item.name]
      );
      const selected = selectExisting(existing.rows, item, categoryId);

      if (selected) {
        const restoreDemo = isLegacySample(selected);
        const changed = await client.query(
          `UPDATE menu_items
           SET category_id = $1, description = $2, price = $3, image_url = $4,
               is_available = CASE WHEN $5::boolean THEN true ELSE is_available END
           WHERE id = $6 AND restaurant_id = $7 AND (
             category_id IS DISTINCT FROM $1 OR description IS DISTINCT FROM $2 OR
             price IS DISTINCT FROM $3 OR image_url IS DISTINCT FROM $4 OR
             ($5::boolean AND is_available = false)
           )`,
          [categoryId, item.description || null, item.price, item.imageUrl,
            restoreDemo, selected.id, restaurantId]
        );
        if (changed.rowCount) updated += 1;
        else unchanged += 1;
      } else {
        await client.query(
          `INSERT INTO menu_items
             (restaurant_id, category_id, name, description, price, image_url, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [restaurantId, categoryId, item.name, item.description || null,
            item.price, item.imageUrl]
        );
        inserted += 1;
      }
    }

    let archivedLegacy = 0;
    for (const [name, description, price] of LEGACY_SAMPLES) {
      const result = await client.query(
        `UPDATE menu_items AS mi SET is_available = false
         FROM menu_categories AS mc
         WHERE mi.restaurant_id = $1 AND mi.category_id = mc.id
           AND mc.restaurant_id = $1 AND mc.name = 'Signature Dishes'
           AND mi.name = $2 AND mi.description = $3 AND mi.price = $4
           AND mi.is_available = true`,
        [restaurantId, name, description, price]
      );
      archivedLegacy += result.rowCount;
    }

    return { restaurantId, inserted, updated, unchanged, archivedLegacy, total: source.items.length };
  });
}

if (require.main === module) {
  seedEntoysMenu()
    .then(({ restaurantId, inserted, updated, unchanged, archivedLegacy, total }) => {
      console.log(`Entoy menu for ${restaurantId}: ${inserted} inserted, ${updated} updated, ` +
        `${unchanged} unchanged, ${archivedLegacy} old demo rows hidden, ${total} supplied items.`);
    })
    .catch((error) => {
      console.error('Entoy menu import failed:', error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { seedEntoysMenu, validateMenu };
