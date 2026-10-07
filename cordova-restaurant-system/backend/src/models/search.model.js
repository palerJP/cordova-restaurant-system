const { query } = require('../config/db');

/**
 * Fetches all candidate restaurants with their cuisines, dietary options, and operating hours
 */
async function getSearchCandidates() {
  const sql = `
    SELECT
      r.id,
      r.owner_id,
      r.name,
      r.slug,
      r.description,
      r.address,
      r.barangay,
      r.latitude,
      r.longitude,
      r.phone,
      r.email,
      r.price_range,
      r.services_offered,
      r.cover_image_url,
      r.status,
      r.avg_rating,
      r.review_count,
      r.view_count,
      r.is_active,
      r.is_open,
      r.subscription_tier,
      r.subscription_expires_at,
      r.created_at,
      COALESCE(
        (SELECT array_agg(c.name) FROM restaurant_cuisines rc
          JOIN cuisines c ON c.id = rc.cuisine_id WHERE rc.restaurant_id = r.id),
        '{}'
      ) AS cuisines,
      COALESCE(
        (SELECT array_agg(o.option) FROM restaurant_dietary_options o WHERE o.restaurant_id = r.id),
        '{}'
      ) AS dietary_options
    FROM restaurants r
    WHERE r.is_active = TRUE
    ORDER BY r.avg_rating DESC
  `;

  const { rows } = await query(sql);
  return rows;
}

/**
 * Fetches menu items for a list of restaurant IDs
 */
async function getMenuItemsForRestaurants(restaurantIds = []) {
  if (!restaurantIds || restaurantIds.length === 0) return {};

  const sql = `
    SELECT
      id,
      restaurant_id,
      name,
      description,
      price,
      image_url,
      is_available,
      dietary_tags
    FROM menu_items
    WHERE restaurant_id = ANY($1::uuid[])
      AND is_available = true
  `;

  const { rows } = await query(sql, [restaurantIds]);

  const map = {};
  for (const item of rows) {
    if (!map[item.restaurant_id]) {
      map[item.restaurant_id] = [];
    }
    map[item.restaurant_id].push(item);
  }

  return map;
}

module.exports = {
  getSearchCandidates,
  getMenuItemsForRestaurants,
};
