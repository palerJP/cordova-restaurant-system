const { query } = require('../config/db');
const businessAnalytics = require('./businessAnalytics.model');

async function logRestaurantView({ restaurantId, userId, source = 'browse' }) {
  source = ['browse', 'recommendation', 'search'].includes(source) ? source : 'browse';
  await businessAnalytics.record({ restaurantIds: [restaurantId], userId, kind: 'view', source });
  await query(
    `INSERT INTO restaurant_view_logs (restaurant_id, user_id, source) VALUES ($1,$2,$3)`,
    [restaurantId, userId || null, source]
  );
}

async function logRecommendationQuery({ userId, sessionId, queryParams, resultIds, topResultId, eventType = 'search' }) {
  await query(
    `INSERT INTO recommendation_logs (user_id, session_id, query_params, result_ids, top_result_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [userId || null, sessionId || null, { ...queryParams, eventType }, resultIds, topResultId || null]
  );
  if (eventType === 'recommendation') {
    await businessAnalytics.record({ restaurantIds: resultIds, userId, kind: 'recommendation', source: 'recommendation', metadata: { cuisines: queryParams.cuisines || [] } });
  }
}

/** Owner-facing: views/clicks/recommendation-appearance stats for one restaurant. */
async function ownerRestaurantStats(restaurantId, { days = 30 } = {}) {
  return businessAnalytics.ownerStats(restaurantId, days);
}

async function adminOverview() {
  return businessAnalytics.adminStats();
}

/**
 * User-facing "View History" use case: past AI recommendation searches,
 * with the top-matched restaurant's current details attached so the user
 * can revisit what was suggested.
 */
async function getHistoryForUser(userId, { limit = 10, offset = 0 } = {}) {
  const { rows } = await query(
    `SELECT
       rl.id, rl.query_params, rl.result_ids, rl.top_result_id, rl.created_at,
       r.id AS restaurant_id, r.name AS restaurant_name, r.slug AS restaurant_slug,
       r.cover_image_url, r.avg_rating, r.price_range
     FROM recommendation_logs rl
     LEFT JOIN restaurants r ON r.id = rl.top_result_id
     WHERE rl.user_id = $1
     ORDER BY rl.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM recommendation_logs WHERE user_id = $1`,
    [userId]
  );
  return {
    rows: rows.map((r) => ({
      id: r.id,
      queryParams: r.query_params,
      resultCount: (r.result_ids || []).length,
      createdAt: r.created_at,
      topResult: r.restaurant_id
        ? {
            id: r.restaurant_id,
            name: r.restaurant_name,
            slug: r.restaurant_slug,
            coverImageUrl: r.cover_image_url,
            avgRating: r.avg_rating,
            priceRange: r.price_range,
          }
        : null,
    })),
    totalCount: parseInt(countRows[0].count, 10),
  };
}

/**
 * Logged-in user's recently viewed restaurants (deduplicated by restaurant, ordered by latest view).
 */
async function getRecentlyViewedForUser(userId, { limit = 10, offset = 0 } = {}) {
  const { rows } = await query(
    `SELECT
       rvl.restaurant_id,
       MAX(rvl.created_at) AS viewed_at,
       r.id, r.name, r.slug, r.cover_image_url, r.avg_rating, r.review_count, r.price_range, r.address, r.barangay
     FROM restaurant_view_logs rvl
     JOIN restaurants r ON r.id = rvl.restaurant_id
     WHERE rvl.user_id = $1
     GROUP BY rvl.restaurant_id, r.id, r.name, r.slug, r.cover_image_url, r.avg_rating, r.review_count, r.price_range, r.address, r.barangay
     ORDER BY viewed_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(DISTINCT restaurant_id) FROM restaurant_view_logs WHERE user_id = $1`,
    [userId]
  );
  return {
    rows: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      coverImageUrl: r.cover_image_url,
      avgRating: parseFloat(r.avg_rating) || 0,
      reviewCount: parseInt(r.review_count, 10) || 0,
      priceRange: r.price_range,
      address: r.address,
      barangay: r.barangay,
      viewedAt: r.viewed_at,
    })),
    totalCount: parseInt(countRows[0].count, 10),
  };
}

/** Clear all recently viewed records for a user */
async function clearRecentlyViewedForUser(userId) {
  await query(`DELETE FROM restaurant_view_logs WHERE user_id = $1`, [userId]);
}

/** Remove a specific restaurant from user's recently viewed history */
async function deleteRecentlyViewedItem(userId, restaurantId) {
  await query(`DELETE FROM restaurant_view_logs WHERE user_id = $1 AND restaurant_id = $2`, [userId, restaurantId]);
}

/** Clear all AI and search history logs for a user */
async function clearSearchHistoryForUser(userId) {
  await query(`DELETE FROM recommendation_logs WHERE user_id = $1`, [userId]);
}

/** Delete a single search history log entry for a user */
async function deleteSearchHistoryItem(userId, historyId) {
  await query(`DELETE FROM recommendation_logs WHERE user_id = $1 AND id = $2`, [userId, historyId]);
}

module.exports = {
  logRestaurantView,
  logRecommendationQuery,
  ownerRestaurantStats,
  adminOverview,
  getHistoryForUser,
  getRecentlyViewedForUser,
  clearRecentlyViewedForUser,
  deleteRecentlyViewedItem,
  clearSearchHistoryForUser,
  deleteSearchHistoryItem,
};
