const { query } = require('../config/db');

/**
 * Automatically update promotions that have passed their end_date to 'expired'
 */
async function autoExpireOldPromotions() {
  try {
    await query(
      `UPDATE promotions 
       SET status = 'expired' 
       WHERE end_date < CURRENT_DATE AND status = 'active'`
    );
  } catch (err) {
    // Non-critical, ignore if DB query fails temporarily
  }
}

async function listActive({ limit = 12, offset = 0, restaurantId } = {}) {
  await autoExpireOldPromotions();

  const params = [];
  let idx = 1;
  const conditions = [`p.status = 'active'`, `p.start_date <= CURRENT_DATE`, `p.end_date >= CURRENT_DATE`];
  if (restaurantId) {
    conditions.push(`p.restaurant_id = $${idx++}`);
    params.push(restaurantId);
  }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await query(
    `SELECT p.*, r.name AS restaurant_name, r.slug AS restaurant_slug
     FROM promotions p JOIN restaurants r ON r.id = p.restaurant_id
     ${where}
     ORDER BY p.end_date ASC, p.start_date DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM promotions p ${where}`, params
  );
  return { rows, totalCount: parseInt(countRows[0].count, 10) };
}

async function listForRestaurant(restaurantId) {
  await autoExpireOldPromotions();

  const { rows } = await query(
    `SELECT * FROM promotions WHERE restaurant_id = $1 ORDER BY created_at DESC, end_date DESC`,
    [restaurantId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query(`SELECT * FROM promotions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function create(restaurantId, data) {
  const { rows } = await query(
    `INSERT INTO promotions
      (restaurant_id, title, description, image_url, discount_label, start_date, end_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [restaurantId, data.title, data.description || null, data.imageUrl || null,
      data.discountLabel || null, data.startDate, data.endDate, data.status || 'active']
  );
  return rows[0];
}

async function update(id, restaurantId, data) {
  const fields = [];
  const params = [id, restaurantId];
  let idx = 3;
  const fieldMap = {
    title: 'title', description: 'description', imageUrl: 'image_url',
    discountLabel: 'discount_label', startDate: 'start_date', endDate: 'end_date', status: 'status',
  };
  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  const { rows } = await query(
    `UPDATE promotions SET ${fields.join(', ')} WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id, restaurantId) {
  await query(`DELETE FROM promotions WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
}

module.exports = { listActive, listForRestaurant, findById, create, update, remove, autoExpireOldPromotions };
