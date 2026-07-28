const { query } = require('../config/db');

async function listCategories(restaurantId) {
  const { rows } = await query(
    `SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY sort_order, name`,
    [restaurantId]
  );
  return rows;
}

async function createCategory(restaurantId, { name, sortOrder = 0 }) {
  const { rows } = await query(
    `INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES ($1,$2,$3) RETURNING *`,
    [restaurantId, name, sortOrder]
  );
  return rows[0];
}

async function deleteCategory(id, restaurantId) {
  await query(`DELETE FROM menu_categories WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
}

async function listItems(restaurantId) {
  const { rows } = await query(
    `SELECT mi.*, mc.name AS category_name
     FROM menu_items mi
     LEFT JOIN menu_categories mc ON mc.id = mi.category_id
     WHERE mi.restaurant_id = $1
     ORDER BY mc.sort_order NULLS LAST, mi.name`,
    [restaurantId]
  );
  return rows;
}

async function findItemById(id) {
  const { rows } = await query(`SELECT * FROM menu_items WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function createItem(restaurantId, data) {
  const { rows } = await query(
    `INSERT INTO menu_items
       (restaurant_id, category_id, name, description, price, image_url, dietary_tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [restaurantId, data.categoryId || null, data.name, data.description || null,
      data.price, data.imageUrl || null, data.dietaryTags || []]
  );
  return rows[0];
}

async function updateItem(id, restaurantId, data) {
  const fields = [];
  const params = [id, restaurantId];
  let idx = 3;
  const fieldMap = {
    categoryId: 'category_id', name: 'name', description: 'description', price: 'price',
    imageUrl: 'image_url', isAvailable: 'is_available', dietaryTags: 'dietary_tags',
  };
  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findItemById(id);
  const { rows } = await query(
    `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function deleteItem(id, restaurantId) {
  await query(`DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
}

module.exports = {
  listCategories, createCategory, deleteCategory,
  listItems, findItemById, createItem, updateItem, deleteItem,
};
