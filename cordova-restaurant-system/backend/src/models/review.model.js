const { query, withTransaction } = require('../config/db');

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

async function create({ restaurantId, userId, rating, comment, photos = [], reactions = {} }) {
  const { rows } = await query(
    `INSERT INTO reviews (restaurant_id, user_id, rating, comment, photos, reactions)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [restaurantId, userId, rating, comment || null, photos, reactions]
  );
  return rows[0];
}

async function update(id, userId, { rating, comment, photos }) {
  const { rows } = await query(
    `UPDATE reviews SET rating = COALESCE($3, rating), comment = COALESCE($4, comment), photos = COALESCE($5, photos)
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, rating, comment, photos]
  );
  return rows[0] || null;
}

async function react(reviewId, emoji) {
  const safeEmoji = String(emoji || '❤️').slice(0, 10);
  const { rows } = await query(
    `UPDATE reviews
     SET reactions = jsonb_set(
       COALESCE(reactions, '{}'::jsonb),
       ARRAY[$2],
       to_jsonb(COALESCE((reactions->>$2)::int, 0) + 1),
       true
     )
     WHERE id = $1
     RETURNING reactions`,
    [reviewId, safeEmoji]
  );
  return rows[0]?.reactions || {};
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
async function report(id, reporterId, {category, details}) {
 const ApiError = require('../utils/apiError');
 return withTransaction(async client => {
  const {rows} = await client.query('SELECT * FROM reviews WHERE id=$1 FOR UPDATE',[id]);
  const review=rows[0];
  if (!review || review.status !== 'visible') throw ApiError.notFound('Review is unavailable');
  if (review.user_id === reporterId) throw ApiError.badRequest('You cannot report your own review');
  const result=await client.query('INSERT INTO review_reports(review_id,reporter_id,category,details,snapshot) VALUES($1,$2,$3,$4,$5) ON CONFLICT(review_id,reporter_id) DO NOTHING RETURNING id',[id,reporterId,category,details,JSON.stringify({comment:review.comment,rating:review.rating,photos:review.photos})]);
  if (!result.rows.length) throw ApiError.conflict('You already reported this review');
  return {id:result.rows[0].id};
 });
}
async function moderate(id, { status, flaggedReason, moderatorId }) {
 const ApiError = require('../utils/apiError');
 return withTransaction(async client => {
  const {rows}=await client.query('SELECT * FROM reviews WHERE id=$1 FOR UPDATE',[id]);
  const previous=rows[0]; if (!previous) return null;
  if (previous.user_id === moderatorId) throw ApiError.forbidden('Another administrator must moderate your review');
  const result=await client.query('UPDATE reviews SET status=$2,flagged_reason=$3,moderated_by=$4 WHERE id=$1 RETURNING *',[id,status,flaggedReason,moderatorId]);
  await client.query('INSERT INTO review_moderation_events(review_id,moderator_id,previous_status,status,reason) VALUES($1,$2,$3,$4,$5)',[id,moderatorId,previous.status,status,flaggedReason]);
  if(status !== 'flagged') await client.query("UPDATE review_reports SET status=$2,resolved_at=now() WHERE review_id=$1 AND status='open'",[id,status === 'visible'?'dismissed':'resolved']);
  await client.query("INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata) VALUES($1,'review.moderate','review',$2,$3)",[moderatorId,id,JSON.stringify({previousStatus:previous.status,status,reason:flaggedReason})]);
  await client.query("INSERT INTO notifications(user_id,type,title,body) VALUES($1,'system','Review moderation update',$2)",[previous.user_id,'Your review is now '+status+'. '+flaggedReason]);
  return result.rows[0];
 });
}

async function listFlagged({ limit, offset }) {
  return listAdminReviews({ status: 'flagged', limit, offset });
}

async function listAdminReviews({ status = 'flagged', limit = 50, offset = 0 } = {}) {
  const params = [];
  let idx = 1;
  const conditions = [];

  if (status === 'reported') {
 conditions.push("EXISTS(SELECT 1 FROM review_reports rr WHERE rr.review_id=rv.id AND rr.status='open')");
 } else if (status && status !== 'all') {
    conditions.push(`rv.status = $${idx++}`);
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT rv.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar, r.name AS restaurant_name, r.slug AS restaurant_slug,
 (SELECT COUNT(*) FROM review_reports rr WHERE rr.review_id=rv.id AND rr.status='open') AS report_count,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('category',rr.category,'details',rr.details,'snapshot',rr.snapshot,'status',rr.status,'created_at',rr.created_at) ORDER BY rr.created_at DESC) FROM review_reports rr WHERE rr.review_id=rv.id),'[]'::jsonb) AS reports,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('status',me.status,'reason',me.reason,'created_at',me.created_at) ORDER BY me.created_at DESC) FROM review_moderation_events me WHERE me.review_id=rv.id),'[]'::jsonb) AS moderation_history
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     JOIN restaurants r ON r.id = rv.restaurant_id
     ${where}
     ORDER BY rv.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(`SELECT COUNT(*) FROM reviews rv ${where}`, params);
  return { rows, totalCount: parseInt(countRows[0]?.count || '0', 10) };
}

module.exports = {
  report, listForRestaurant, findById, findByUserAndRestaurant,
  create, update, remove, ownerReply, moderate, listFlagged, listAdminReviews, toggleLike, react,
};
