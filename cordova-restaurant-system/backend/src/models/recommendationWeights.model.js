const { query } = require('../config/db');

async function getActive() {
  const { rows } = await query(
    `SELECT * FROM recommendation_weights WHERE is_active = TRUE ORDER BY updated_at DESC LIMIT 1`
  );
  return rows[0] || null;
}

/**
 * Admin "Update AI Model" use case: writes a new active weight profile and
 * deactivates the previous one, keeping full history for audit purposes.
 */
async function setActive(weights, updatedBy) {
  const { cuisineWeight, budgetWeight, proximityWeight, dietaryWeight, ratingWeight } = weights;
  const sum = cuisineWeight + budgetWeight + proximityWeight + dietaryWeight + ratingWeight;
  if (Math.abs(sum - 1) > 0.01) {
    throw new Error('Recommendation weights must sum to 1.0');
  }

  await query(`UPDATE recommendation_weights SET is_active = FALSE WHERE is_active = TRUE`);
  const { rows } = await query(
    `INSERT INTO recommendation_weights
       (cuisine_weight, budget_weight, proximity_weight, dietary_weight, rating_weight, is_active, updated_by)
     VALUES ($1,$2,$3,$4,$5, TRUE, $6)
     RETURNING *`,
    [cuisineWeight, budgetWeight, proximityWeight, dietaryWeight, ratingWeight, updatedBy]
  );
  return rows[0];
}

module.exports = { getActive, setActive };
