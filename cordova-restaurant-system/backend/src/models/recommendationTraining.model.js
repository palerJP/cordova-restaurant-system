const { query, withTransaction } = require('../config/db');

const TRAINING_SIGNALS_CTE = `
  WITH profiles AS (
    SELECT u.id AS user_id,
           jsonb_build_object(
             'preferredCuisines', COALESCE(p.preferred_cuisines, '{}'::text[]),
             'budgetRange', p.budget_range,
             'dietaryRestrictions', COALESCE(p.dietary_restrictions, '{}'::text[]),
             'requiredServices', COALESCE(p.preferred_services, '{}'::text[]),
             'maxDistanceKm', p.max_distance_km,
             'userLat', p.home_latitude,
             'userLng', p.home_longitude
           ) AS preference_snapshot
    FROM users u
    LEFT JOIN user_preferences p ON p.user_id = u.id
  ), signals AS (
    SELECT f.user_id, f.restaurant_id, f.sentiment, f.preference_snapshot
    FROM recommendation_feedback f

    UNION ALL

    SELECT fav.user_id, fav.restaurant_id, 1::smallint, profiles.preference_snapshot
    FROM favorites fav
    JOIN profiles ON profiles.user_id = fav.user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM recommendation_feedback f
      WHERE f.user_id = fav.user_id AND f.restaurant_id = fav.restaurant_id
    )

    UNION ALL

    SELECT rv.user_id, rv.restaurant_id,
           CASE WHEN rv.rating >= 4 THEN 1 ELSE -1 END::smallint,
           profiles.preference_snapshot
    FROM reviews rv
    JOIN profiles ON profiles.user_id = rv.user_id
    WHERE rv.status = 'visible'
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
`;

const TRAINING_RESTAURANT_SELECT = `
  SELECT s.user_id, s.restaurant_id, s.sentiment, s.preference_snapshot,
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
  FROM signals s
  JOIN restaurants r ON r.id = s.restaurant_id
  WHERE r.is_active = TRUE AND r.status = 'verified'
`;

async function getTrainingStats() {
  const { rows } = await query(`
    ${TRAINING_SIGNALS_CTE}
    SELECT COUNT(*)::integer AS total_examples,
           COUNT(*) FILTER (WHERE s.sentiment = 1)::integer AS positive_examples,
           COUNT(*) FILTER (WHERE s.sentiment = -1)::integer AS negative_examples
    FROM signals s
    JOIN restaurants r ON r.id = s.restaurant_id
    WHERE r.is_active = TRUE AND r.status = 'verified'
  `);
  return rows[0];
}

async function getTrainingExamples() {
  const { rows } = await query(`${TRAINING_SIGNALS_CTE} ${TRAINING_RESTAURANT_SELECT}`);
  return rows.map((row) => ({
    sentiment: Number(row.sentiment),
    preferenceSnapshot: row.preference_snapshot || {},
    source: 'global',
    restaurant: row,
  }));
}

async function getActiveModel() {
  const { rows } = await query(
    `SELECT id, model, training_examples, positive_examples, negative_examples, trained_by, created_at
     FROM recommendation_model_versions
     WHERE is_active = TRUE
     ORDER BY created_at DESC
     LIMIT 1`
  );
  return rows[0] || null;
}

async function getTrainingHistory(limit = 10) {
  const { rows } = await query(
    `SELECT id, training_examples, positive_examples, negative_examples, trained_by, created_at,
            (is_active) AS is_active
     FROM recommendation_model_versions
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function countVersions() {
  const { rows } = await query(`SELECT COUNT(*)::integer AS count FROM recommendation_model_versions`);
  return rows[0].count;
}

async function saveTrainedModel({ model, trainingExamples, positiveExamples, negativeExamples, trainedBy }) {
  return withTransaction(async (client) => {
    await client.query(`UPDATE recommendation_model_versions SET is_active = FALSE WHERE is_active = TRUE`);
    const { rows } = await client.query(
      `INSERT INTO recommendation_model_versions
         (model, training_examples, positive_examples, negative_examples, trained_by, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id, training_examples, positive_examples, negative_examples, trained_by, created_at, is_active`,
      [model, trainingExamples, positiveExamples, negativeExamples, trainedBy]
    );
    return rows[0];
  });
}

module.exports = {
  getTrainingStats,
  getTrainingExamples,
  getActiveModel,
  getTrainingHistory,
  countVersions,
  saveTrainedModel,
};
