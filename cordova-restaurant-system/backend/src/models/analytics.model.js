const { query } = require('../config/db');

async function logRestaurantView({ restaurantId, userId, source = 'browse' }) {
  await query(
    `INSERT INTO restaurant_view_logs (restaurant_id, user_id, source) VALUES ($1,$2,$3)`,
    [restaurantId, userId || null, source]
  );
}

async function logRecommendationQuery({ userId, sessionId, queryParams, resultIds, topResultId }) {
  await query(
    `INSERT INTO recommendation_logs (user_id, session_id, query_params, result_ids, top_result_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [userId || null, sessionId || null, queryParams, resultIds, topResultId || null]
  );
}

/** Owner-facing: views/clicks/recommendation-appearance stats for one restaurant. */
async function ownerRestaurantStats(restaurantId, { days = 30 } = {}) {
  const [{ rows: viewRows }, { rows: recRows }, { rows: dailyRows }] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total_views,
              COUNT(*) FILTER (WHERE source = 'recommendation') AS views_from_recommendation
       FROM restaurant_view_logs
       WHERE restaurant_id = $1 AND created_at >= now() - ($2 || ' days')::interval`,
      [restaurantId, days]
    ),
    query(
      `SELECT COUNT(*) AS times_recommended,
              COUNT(*) FILTER (WHERE top_result_id = $1) AS times_top_result
       FROM recommendation_logs
       WHERE $1 = ANY(result_ids) AND created_at >= now() - ($2 || ' days')::interval`,
      [restaurantId, days]
    ),
    query(
      `SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS views
       FROM restaurant_view_logs
       WHERE restaurant_id = $1 AND created_at >= now() - ($2 || ' days')::interval
       GROUP BY 1 ORDER BY 1`,
      [restaurantId, days]
    ),
  ]);

  return {
    totalViews: parseInt(viewRows[0].total_views, 10),
    viewsFromRecommendation: parseInt(viewRows[0].views_from_recommendation, 10),
    timesRecommended: parseInt(recRows[0].times_recommended, 10),
    timesTopResult: parseInt(recRows[0].times_top_result, 10),
    dailyViews: dailyRows.map((r) => ({ day: r.day, views: parseInt(r.views, 10) })),
  };
}

/** Admin-facing: system-wide dashboard numbers. */
async function adminOverview() {
  const [{ rows: userStats }, { rows: restaurantStats }, { rows: reviewStats }, { rows: cuisineTrend }, { rows: peakHours }] =
    await Promise.all([
      query(
        `SELECT
           COUNT(*) FILTER (WHERE role = 'customer') AS customers,
           COUNT(*) FILTER (WHERE role = 'owner') AS owners,
           COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days') AS new_last_30d
         FROM users`
      ),
      query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'verified') AS verified,
           COUNT(*) FILTER (WHERE status = 'pending') AS pending,
           COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
           COUNT(*) FILTER (WHERE status = 'suspended') AS suspended
         FROM restaurants`
      ),
      query(
        `SELECT COUNT(*) FILTER (WHERE status = 'flagged') AS flagged,
                COUNT(*) FILTER (WHERE status = 'visible') AS visible
         FROM reviews`
      ),
      query(
        `SELECT c.name, COUNT(*) AS search_count
         FROM recommendation_logs rl, jsonb_array_elements_text(COALESCE(rl.query_params->'cuisines', '[]'::jsonb)) cuisine_name
         JOIN cuisines c ON c.name = cuisine_name
         WHERE rl.created_at >= now() - interval '30 days'
         GROUP BY c.name ORDER BY search_count DESC LIMIT 10`
      ),
      query(
        `SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*) AS searches
         FROM recommendation_logs
         WHERE created_at >= now() - interval '30 days'
         GROUP BY 1 ORDER BY 1`
      ),
    ]);

  return {
    users: userStats[0],
    restaurants: restaurantStats[0],
    reviews: reviewStats[0],
    topCuisineDemand: cuisineTrend,
    peakSearchHours: peakHours.map((r) => ({ hour: r.hour, searches: parseInt(r.searches, 10) })),
  };
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

module.exports = { logRestaurantView, logRecommendationQuery, ownerRestaurantStats, adminOverview, getHistoryForUser };
