const { query } = require('../config/db');

/**
 * Finds attractions within a radius of a given point, using the same
 * Haversine approach as restaurant proximity search, ordered nearest-first.
 */
async function findNearby({ lat, lng, radiusKm = 10, limit = 5 }) {
  const { rows } = await query(
    `SELECT *,
       6371 * acos(
         LEAST(1, GREATEST(-1,
           cos(radians($1)) * cos(radians(latitude)) *
           cos(radians(longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(latitude))
         ))
       ) AS distance_km
     FROM attractions
     WHERE 6371 * acos(
         LEAST(1, GREATEST(-1,
           cos(radians($1)) * cos(radians(latitude)) *
           cos(radians(longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(latitude))
         ))
       ) <= $3
     ORDER BY distance_km ASC
     LIMIT $4`,
    [lat, lng, radiusKm, limit]
  );
  return rows;
}

async function listAll() {
  const { rows } = await query(`SELECT * FROM attractions ORDER BY name`);
  return rows;
}

module.exports = { findNearby, listAll };
