const { query } = require('../config/db');

async function listForRestaurant(restaurantId, { limit = 10, offset = 0, includeModerated = false, userId = null }) {
  const statusFilter = includeModerated ? '' : `AND rv.status = 'visible'`;
  const { rows } = await query(
    `SELECT rv.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar,
       COALESCE((SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = rv.id), 0) AS like_count,
       EXISTS(SELECT 1 FROM review_likes rl WHERE rl.review_id = rv.id AND rl.user_id = $4) AS liked_by_me
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     WHERE rv.restaurant_id = $1 ${statusFilter}
     ORDER BY rv.created_at DESC
     LIMIT $2 OFFSET $3`,
    [restaurantId, limit, offset, userId]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM reviews rv WHERE rv.restaurant_id = $1 ${statusFilter}`,
    [restaurantId]
  );
  return { rows, totalCount: parseInt(countRows[0].count, 10) };
}

/** Toggles a "helpful" like on a review for the given user. Returns the new liked state. */
async function toggleLike(reviewId, userId) {
  const { rows: existing } = await query(
    `SELECT 1 FROM review_likes WHERE review_id = $1 AND user_id = $2`,
    [reviewId, userId]
  );
  if (existing.length > 0) {
    await query(`DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2`, [reviewId, userId]);
    return false;
  }
  await query(`INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2)`, [reviewId, userId]);
  return true;
}

async function findById(id) {
  const { rows } = await query(`SELECT * FROM reviews WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findByUserAndRestaurant(userId, restaurantId) {
  const { rows } = await query(
    `SELECT * FROM reviews WHERE user_id = $1 AND restaurant_id = $2`,
    [userId, restaurantId]
  );
  return rows[0] || null;
}

async function create({ restaurantId, userId, rating, comment }) {
  const { rows } = await query(
    `INSERT INTO reviews (restaurant_id, user_id, rating, comment)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [restaurantId, userId, rating, comment || null]
  );
  return rows[0];
}

async function update(id, userId, { rating, comment }) {
  const { rows } = await query(
    `UPDATE reviews SET rating = COALESCE($3, rating), comment = COALESCE($4, comment)
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, rating, comment]
  );
  return rows[0] || null;
}

async function remove(id, userId) {
  await query(`DELETE FROM reviews WHERE id = $1 AND user_id = $2`, [id, userId]);
}

async function ownerReply(id, restaurantOwnerId, replyText) {
  const { rows } = await query(
    `UPDATE reviews rv SET owner_reply = $3, owner_reply_at = now()
     FROM restaurants r
     WHERE rv.id = $1 AND rv.restaurant_id = r.id AND r.owner_id = $2
     RETURNING rv.*`,
    [id, restaurantOwnerId, replyText]
  );
  return rows[0] || null;
}

/** Admin moderation: flag, remove, or restore a review. */
async function moderate(id, { status, flaggedReason, moderatorId }) {
  const { rows } = await query(
    `UPDATE reviews SET status = $2, flagged_reason = $3, moderated_by = $4
     WHERE id = $1 RETURNING *`,
    [id, status, flaggedReason || null, moderatorId]
  );
  return rows[0] || null;
}

async function listFlagged({ limit, offset }) {
  const { rows } = await query(
    `SELECT rv.*, u.full_name AS reviewer_name, r.name AS restaurant_name
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     JOIN restaurants r ON r.id = rv.restaurant_id
     WHERE rv.status = 'flagged'
     ORDER BY rv.updated_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const { rows: countRows } = await query(`SELECT COUNT(*) FROM reviews WHERE status = 'flagged'`);
  return { rows, totalCount: parseInt(countRows[0].count, 10) };
}

module.exports = {
  listForRestaurant, findById, findByUserAndRestaurant,
  create, update, remove, ownerReply, moderate, listFlagged, toggleLike,
};
