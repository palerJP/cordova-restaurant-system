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
  const conditions = [
    `p.status = 'active'`,
    `(p.payment_status = 'verified' OR p.payment_status IS NULL)`,
    `p.start_date <= CURRENT_DATE`,
    `p.end_date >= CURRENT_DATE`,
    `r.status = 'verified'`,
    `r.is_active = TRUE`
  ];
  if (restaurantId) {
    conditions.push(`p.restaurant_id = $${idx++}`);
    params.push(restaurantId);
  }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await query(
    `SELECT p.id, p.restaurant_id, p.title, p.description, p.image_url,
       p.discount_label, p.start_date, p.end_date, p.status, p.created_at,
       r.name AS restaurant_name, r.slug AS restaurant_slug
     FROM promotions p JOIN restaurants r ON r.id = p.restaurant_id
     ${where}
     ORDER BY p.end_date ASC, p.start_date DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM promotions p JOIN restaurants r ON r.id = p.restaurant_id ${where}`, params
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
      (restaurant_id, title, description, image_url, discount_label, start_date, end_date, status, payment_method, payment_reference, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      restaurantId,
      data.title,
      data.description || null,
      data.imageUrl || null,
      data.discountLabel || null,
      data.startDate,
      data.endDate,
      data.status || 'pending_verification',
      data.paymentMethod || data.payment_method || 'gcash',
      data.paymentReference || data.payment_reference || data.referenceNo || null,
      data.paymentStatus || data.payment_status || 'pending_verification',
    ]
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
    paymentMethod: 'payment_method', paymentReference: 'payment_reference', paymentStatus: 'payment_status',
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

async function adminRemove(id) {
  await query(`DELETE FROM promotions WHERE id = $1`, [id]);
}

async function listAllAdmin({ status, search, limit = 50, offset = 0 } = {}) {
  await autoExpireOldPromotions();
  const params = [];
  let idx = 1;
  const conditions = [];

  if (status && status !== 'all') {
    if (status === 'active') {
      conditions.push(`p.status = 'active' AND (p.payment_status = 'verified' OR p.payment_status IS NULL) AND p.end_date >= CURRENT_DATE`);
    } else if (status === 'expired') {
      conditions.push(`(p.status = 'expired' OR p.end_date < CURRENT_DATE)`);
    } else if (status === 'pending_verification') {
      conditions.push(`(p.payment_status = 'pending_verification' OR p.status = 'pending_verification')`);
    } else if (status === 'rejected') {
      conditions.push(`(p.status = 'rejected' OR p.payment_status = 'rejected')`);
    } else {
      conditions.push(`p.status = $${idx++}`);
      params.push(status);
    }
  }

  if (search && search.trim()) {
    conditions.push(`(p.title ILIKE $${idx} OR r.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.payment_reference ILIKE $${idx})`);
    params.push(`%${search.trim()}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT p.*, r.name AS restaurant_name, r.slug AS restaurant_slug, r.cover_image_url AS restaurant_cover
     FROM promotions p
     JOIN restaurants r ON r.id = p.restaurant_id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM promotions p JOIN restaurants r ON r.id = p.restaurant_id ${where}`,
    params
  );
  return { rows, totalCount: parseInt(countRows[0]?.count || '0', 10) };
}

async function adminUpdate(id, data) {
  const fields = [];
  const params = [id];
  let idx = 2;
  const fieldMap = {
    title: 'title', description: 'description', imageUrl: 'image_url',
    discountLabel: 'discount_label', startDate: 'start_date', endDate: 'end_date', status: 'status',
    paymentMethod: 'payment_method', paymentReference: 'payment_reference', paymentStatus: 'payment_status',
  };
  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  const { rows } = await query(
    `UPDATE promotions SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    params
  );
  return rows[0] || null;
}

// ---------------- Subscription Transactions Model ----------------
async function listSubscriptionTransactions({ status, search, limit = 50, offset = 0 } = {}) {
  const params = [];
  let idx = 1;
  const conditions = [];

  if (status && status !== 'all') {
    if (status === 'pending_verification' || status === 'pending') {
      conditions.push(`st.status = 'pending_verification'`);
    } else if (status === 'verified') {
      conditions.push(`st.status = 'verified'`);
    } else if (status === 'rejected') {
      conditions.push(`st.status = 'rejected'`);
    } else {
      conditions.push(`st.status = $${idx++}`);
      params.push(status);
    }
  }

  if (search && search.trim()) {
    conditions.push(`(r.name ILIKE $${idx} OR st.tier ILIKE $${idx} OR st.payment_reference ILIKE $${idx})`);
    params.push(`%${search.trim()}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT st.*, r.name AS restaurant_name, r.slug AS restaurant_slug, r.cover_image_url AS restaurant_cover,
            r.subscription_tier AS current_restaurant_tier, r.subscription_expires_at AS current_restaurant_expires_at
     FROM subscription_transactions st
     JOIN restaurants r ON r.id = st.restaurant_id
     ${where}
     ORDER BY st.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );

  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM subscription_transactions st JOIN restaurants r ON r.id = st.restaurant_id ${where}`,
    params
  );

  return { rows, totalCount: parseInt(countRows[0]?.count || '0', 10) };
}

async function getLatestSubscriptionTransactionForRestaurant(restaurantId) {
  const { rows } = await query(
    `SELECT * FROM subscription_transactions 
     WHERE restaurant_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [restaurantId]
  );
  return rows[0] || null;
}

const subscriptionModel = require('./subscription.model');
const updateSubscriptionTransactionStatus = (id,options) => subscriptionModel.change(id,options);
const deleteSubscriptionTransaction = id => subscriptionModel.remove(id);

module.exports = {
  listActive, listForRestaurant, findById, create, update, remove,
  adminRemove, listAllAdmin, adminUpdate, autoExpireOldPromotions,
  listSubscriptionTransactions, updateSubscriptionTransactionStatus,
  getLatestSubscriptionTransactionForRestaurant, deleteSubscriptionTransaction,
};
