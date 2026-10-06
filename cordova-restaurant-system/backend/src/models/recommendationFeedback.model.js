const { query } = require('../config/db');

async function save({ userId, restaurantId, sentiment, preferenceSnapshot }) {
  const { rows } = await query(
    `INSERT INTO recommendation_feedback
       (user_id, restaurant_id, sentiment, preference_snapshot)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, restaurant_id) DO UPDATE SET
       sentiment = EXCLUDED.sentiment,
       preference_snapshot = EXCLUDED.preference_snapshot,
       updated_at = now()
     RETURNING restaurant_id, sentiment`,
    [userId, restaurantId, sentiment, preferenceSnapshot]
  );
  return rows[0];
}

/**
 * Build a user's training set from direct votes, saved favorites and reviews.
 * A direct vote takes precedence; favorites are positive labels and reviews
 * rated 1–2 or 4–5 are negative/positive labels. Neutral reviews are ignored.
 */
async function getTrainingExamples(userId) {
  const { rows } = await query(
    `WITH profile AS (
       SELECT jsonb_build_object(
         'preferredCuisines', COALESCE(p.preferred_cuisines, '{}'::text[]),
         'budgetRange', p.budget_range,
         'dietaryRestrictions', COALESCE(p.dietary_restrictions, '{}'::text[]),
         'requiredServices', COALESCE(p.preferred_services, '{}'::text[]),
         'maxDistanceKm', p.max_distance_km,
         'userLat', p.home_latitude,
         'userLng', p.home_longitude
       ) AS preference_snapshot
       FROM (SELECT $1::uuid AS user_id) selected_user
       LEFT JOIN user_preferences p ON p.user_id = selected_user.user_id
     ), feedback_rows AS (
       SELECT f.restaurant_id, f.sentiment, f.preference_snapshot, 'direct'::text AS source
       FROM recommendation_feedback f
       WHERE f.user_id = $1

       UNION ALL

       SELECT fav.restaurant_id, 1::smallint, profile.preference_snapshot, 'favorite'::text
       FROM favorites fav CROSS JOIN profile
       WHERE fav.user_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM recommendation_feedback f
           WHERE f.user_id = fav.user_id AND f.restaurant_id = fav.restaurant_id
         )

       UNION ALL

       SELECT rv.restaurant_id,
              CASE WHEN rv.rating >= 4 THEN 1 ELSE -1 END::smallint,
              profile.preference_snapshot,
              'review'::text
       FROM reviews rv CROSS JOIN profile
       WHERE rv.user_id = $1
         AND rv.status = 'visible'
         AND rv.rating IN (1, 2, 4, 5)
         AND NOT EXISTS (
           SELECT 1 FROM recommendation_feedback f
           WHERE f.user_id = rv.user_id AND f.restaurant_id = rv.restaurant_id
         )
         AND NOT EXISTS (
           SELECT 1 FROM favorites fav
           WHERE fav.user_id = rv.user_id AND fav.restaurant_id = rv.restaurant_id
         )
     )
     SELECT f.restaurant_id, f.sentiment, f.preference_snapshot, f.source,
            r.*,
            COALESCE(
              (SELECT array_agg(c.name) FROM restaurant_cuisines rc
               JOIN cuisines c ON c.id = rc.cuisine_id WHERE rc.restaurant_id = r.id),
              '{}'::text[]
            ) AS cuisines,
            COALESCE(
              (SELECT array_agg(o.option) FROM restaurant_dietary_options o
               WHERE o.restaurant_id = r.id),
              '{}'::text[]
            ) AS dietary_options
     FROM feedback_rows f
     JOIN restaurants r ON r.id = f.restaurant_id
     WHERE r.is_active = TRUE AND r.status = 'verified'`,
    [userId]
  );

  return rows.map((row) => ({
    sentiment: Number(row.sentiment),
    preferenceSnapshot: row.preference_snapshot || {},
    source: row.source,
    restaurant: row,
  }));
}

module.exports = { save, getTrainingExamples };
