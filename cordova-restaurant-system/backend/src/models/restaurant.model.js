const { query, withTransaction } = require('../config/db');

/**
 * Shared SELECT fragment. Distance is computed with the Haversine formula
 * directly in SQL when lat/lng are supplied, so we can ORDER BY / filter on
 * it without pulling every row into Node first.
 */
function buildSelectBase({ userLat, userLng }) {
  const distanceExpr =
    userLat != null && userLng != null
      ? `(
          6371 * acos(
            LEAST(1, GREATEST(-1,
              cos(radians($DIST_LAT)) * cos(radians(r.latitude)) *
              cos(radians(r.longitude) - radians($DIST_LNG)) +
              sin(radians($DIST_LAT)) * sin(radians(r.latitude))
            ))
          )
        )`
      : 'NULL';

  return `
    SELECT
      r.*,
      ${distanceExpr} AS distance_km,
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
  `;
}

/**
 * Search/browse/filter restaurants with pagination, sorting, and optional
 * geo-distance. This backs both the plain "Browse Restaurant" use case and
 * (with different sort/scoring) feeds the AI recommendation service.
 */
async function search({
  searchTerm,
  cuisineSlugs = [],
  priceRange,
  dietaryOptions = [],
  services = [],
  status = 'verified',
  userLat,
  userLng,
  maxDistanceKm,
  sortBy = 'relevance', // relevance | rating | distance | newest | price_asc | price_desc
  limit = 12,
  offset = 0,
}) {
  const params = [];
  let idx = 1;
  const conditions = ['r.is_active = TRUE'];

  if (status) {
    conditions.push(`r.status = $${idx++}`);
    params.push(status);
  }
  if (searchTerm) {
    conditions.push(`(r.name ILIKE $${idx} OR r.description ILIKE $${idx})`);
    params.push(`%${searchTerm}%`);
    idx++;
  }
  if (priceRange) {
    conditions.push(`r.price_range = $${idx++}`);
    params.push(priceRange);
  }
  if (cuisineSlugs.length) {
    conditions.push(`EXISTS (
      SELECT 1 FROM restaurant_cuisines rc JOIN cuisines c ON c.id = rc.cuisine_id
      WHERE rc.restaurant_id = r.id AND c.slug = ANY($${idx++})
    )`);
    params.push(cuisineSlugs);
  }
  if (dietaryOptions.length) {
    conditions.push(`EXISTS (
      SELECT 1 FROM restaurant_dietary_options o
      WHERE o.restaurant_id = r.id AND o.option = ANY($${idx++})
    )`);
    params.push(dietaryOptions);
  }
  if (services.length) {
    conditions.push(`r.services_offered && $${idx++}::service_type[]`);
    params.push(services);
  }

  let select = buildSelectBase({ userLat, userLng });
  if (userLat != null && userLng != null) {
    select = select.replace(/\$DIST_LAT/g, `$${idx}`).replace(/\$DIST_LNG/g, `$${idx + 1}`);
    params.push(userLat, userLng);
    idx += 2;
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  let having = '';
  if (maxDistanceKm != null && userLat != null && userLng != null) {
    having = `HAVING distance_km <= $${idx++}`;
    params.push(maxDistanceKm);
  }

  const sortMap = {
    rating: 'r.avg_rating DESC, r.review_count DESC',
    distance: 'distance_km ASC NULLS LAST',
    newest: 'r.created_at DESC',
    price_asc: `array_position(ARRAY['budget','moderate','expensive','premium'], r.price_range::text) ASC`,
    price_desc: `array_position(ARRAY['budget','moderate','expensive','premium'], r.price_range::text) DESC`,
    relevance: 'r.avg_rating DESC, r.view_count DESC',
  };
  const orderBy = sortMap[sortBy] || sortMap.relevance;

  const wrappedQuery = `
    SELECT * FROM (${select} ${where}) AS r
    ${having}
    ORDER BY ${orderBy}
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  const countQuery = `SELECT COUNT(*) FROM (${select} ${where}) AS r ${having.replace('distance_km', 'r.distance_km')}`;

  const dataParams = [...params, limit, offset];
  const { rows } = await query(wrappedQuery, dataParams);
  const { rows: countRows } = await query(countQuery, params);

  return { rows, totalCount: parseInt(countRows[0].count, 10) };
}

async function findById(id, { userLat, userLng } = {}) {
  let select = buildSelectBase({ userLat, userLng });
  const params = [id];
  if (userLat != null && userLng != null) {
    select = select.replace(/\$DIST_LAT/g, '$2').replace(/\$DIST_LNG/g, '$3');
    params.push(userLat, userLng);
  }
  const { rows } = await query(`${select} WHERE r.id = $1`, params);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const { rows } = await query(`${buildSelectBase({})} WHERE r.slug = $1`, [slug]);
  return rows[0] || null;
}

async function findByOwner(ownerId) {
  const { rows } = await query(`${buildSelectBase({})} WHERE r.owner_id = $1 ORDER BY r.created_at DESC`, [ownerId]);
  return rows;
}

/**
 * Fetch ALL verified + active restaurants with their tags, for the
 * recommendation engine to score in-memory (dataset is small/local-scale,
 * so this is simpler and fast enough vs. a complex scoring SQL query).
 */
async function findAllForRecommendation({ userLat, userLng }) {
  let select = buildSelectBase({ userLat, userLng });
  const params = [];
  if (userLat != null && userLng != null) {
    select = select.replace(/\$DIST_LAT/g, '$1').replace(/\$DIST_LNG/g, '$2');
    params.push(userLat, userLng);
  }
  const { rows } = await query(
    `${select} WHERE r.status = 'verified' AND r.is_active = TRUE`,
    params
  );
  return rows;
}

async function create(data, cuisineIds = [], dietaryOptions = []) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO restaurants
        (owner_id, name, slug, description, address, barangay, latitude, longitude,
         phone, email, price_range, services_offered, business_permit_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [data.ownerId, data.name, data.slug, data.description, data.address, data.barangay,
        data.latitude, data.longitude, data.phone, data.email, data.priceRange,
        data.servicesOffered, data.businessPermitUrl]
    );
    const restaurant = rows[0];

    for (const cuisineId of cuisineIds) {
      await client.query(
        `INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id) VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [restaurant.id, cuisineId]
      );
    }
    for (const option of dietaryOptions) {
      await client.query(
        `INSERT INTO restaurant_dietary_options (restaurant_id, option) VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [restaurant.id, option]
      );
    }
    return restaurant;
  });
}

async function update(id, data) {
  const fields = [];
  const params = [id];
  let idx = 2;

  const fieldMap = {
    name: 'name', description: 'description', address: 'address', barangay: 'barangay',
    latitude: 'latitude', longitude: 'longitude', phone: 'phone', email: 'email',
    priceRange: 'price_range', servicesOffered: 'services_offered',
    coverImageUrl: 'cover_image_url', isActive: 'is_active', amenities: 'amenities',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);

  const { rows } = await query(
    `UPDATE restaurants SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function setVerificationStatus(id, { status, adminId, rejectionReason = null }) {
  const { rows } = await query(
    `UPDATE restaurants SET
       status = $2::business_status,
       verified_by = $3,
       verified_at = CASE WHEN $2::business_status = 'verified' THEN now() ELSE verified_at END,
       rejection_reason = $4
     WHERE id = $1 RETURNING *`,
    [id, status, adminId, rejectionReason]
  );
  return rows[0] || null;
}

async function incrementViewCount(id) {
  await query(`UPDATE restaurants SET view_count = view_count + 1 WHERE id = $1`, [id]);
}

async function replaceCuisines(id, cuisineIds) {
  return withTransaction(async (client) => {
    await client.query(`DELETE FROM restaurant_cuisines WHERE restaurant_id = $1`, [id]);
    for (const cuisineId of cuisineIds) {
      await client.query(
        `INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id) VALUES ($1,$2)`,
        [id, cuisineId]
      );
    }
  });
}

/**
 * "Similar restaurants" for the detail page: verified, active restaurants
 * that share at least one cuisine tag with the given restaurant, ranked by
 * how many cuisines they share, then rating. Falls back to same price range
 * if no cuisine overlap exists so the section is rarely empty.
 */
async function findSimilar(restaurantId, { limit = 4 } = {}) {
  const { rows } = await query(
    `${buildSelectBase({})}
     WHERE r.id != $1 AND r.status = 'verified' AND r.is_active = TRUE
       AND EXISTS (
         SELECT 1 FROM restaurant_cuisines rc1
         JOIN restaurant_cuisines rc2 ON rc1.cuisine_id = rc2.cuisine_id
         WHERE rc1.restaurant_id = $1 AND rc2.restaurant_id = r.id
       )
     ORDER BY r.avg_rating DESC
     LIMIT $2`,
    [restaurantId, limit]
  );
  if (rows.length > 0) return rows;

  // Fallback: same price range, still excluding self
  const { rows: fallback } = await query(
    `${buildSelectBase({})}
     WHERE r.id != $1 AND r.status = 'verified' AND r.is_active = TRUE
       AND r.price_range = (SELECT price_range FROM restaurants WHERE id = $1)
     ORDER BY r.avg_rating DESC
     LIMIT $2`,
    [restaurantId, limit]
  );
  return fallback;
}

module.exports = {
  search,
  findById,
  findBySlug,
  findByOwner,
  findAllForRecommendation,
  findSimilar,
  create,
  update,
  setVerificationStatus,
  incrementViewCount,
  replaceCuisines,
};
