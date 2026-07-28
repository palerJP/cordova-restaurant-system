const { query } = require('../config/db');

async function add(userId, restaurantId) {
  await query(
    `INSERT INTO favorites (user_id, restaurant_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
    [userId, restaurantId]
  );
}

async function remove(userId, restaurantId) {
  await query(`DELETE FROM favorites WHERE user_id = $1 AND restaurant_id = $2`, [userId, restaurantId]);
}

async function isFavorite(userId, restaurantId) {
  const { rows } = await query(
    `SELECT 1 FROM favorites WHERE user_id = $1 AND restaurant_id = $2`,
    [userId, restaurantId]
  );
  return rows.length > 0;
}

async function listForUser(userId, { limit = 12, offset = 0 }) {
  const { rows } = await query(
    `SELECT r.*, f.created_at AS favorited_at
     FROM favorites f
     JOIN restaurants r ON r.id = f.restaurant_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await query(`SELECT COUNT(*) FROM favorites WHERE user_id = $1`, [userId]);
  return { rows, totalCount: parseInt(countRows[0].count, 10) };
}

module.exports = { add, remove, isFavorite, listForUser };
