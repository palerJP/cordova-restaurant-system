const { query } = require('../config/db');

async function listForRestaurant(restaurantId) {
  const { rows } = await query(
    `SELECT * FROM restaurant_images WHERE restaurant_id = $1 ORDER BY sort_order, created_at`,
    [restaurantId]
  );
  return rows;
}

async function add(restaurantId, imageUrl) {
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM restaurant_images WHERE restaurant_id = $1`,
    [restaurantId]
  );
  const sortOrder = parseInt(countRows[0].count, 10);
  const { rows } = await query(
    `INSERT INTO restaurant_images (restaurant_id, image_url, sort_order) VALUES ($1,$2,$3) RETURNING *`,
    [restaurantId, imageUrl, sortOrder]
  );
  return rows[0];
}

async function remove(imageId, restaurantId) {
  await query(`DELETE FROM restaurant_images WHERE id = $1 AND restaurant_id = $2`, [imageId, restaurantId]);
}

module.exports = { listForRestaurant, add, remove };
