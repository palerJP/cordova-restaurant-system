const { query } = require('../config/db');

const PUBLIC_FIELDS = `id, email, full_name, phone, role, avatar_url, is_active, accepts_marketing,
  email_verified_at, last_login_at, created_at`;

async function findById(id) {
  const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
  return rows[0] || null;
}

async function create({ email, passwordHash, fullName, role = 'customer', phone = null, acceptsMarketing = true }) {
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, full_name, role, phone, accepts_marketing)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PUBLIC_FIELDS}`,
    [email.toLowerCase(), passwordHash, fullName, role, phone, acceptsMarketing]
  );
  return rows[0];
}

async function updateProfile(id, { fullName, phone, avatarUrl }) {
  const { rows } = await query(
    `UPDATE users SET
       full_name = COALESCE($2, full_name),
       phone = COALESCE($3, phone),
       avatar_url = COALESCE($4, avatar_url)
     WHERE id = $1
     RETURNING ${PUBLIC_FIELDS}`,
    [id, fullName, phone, avatarUrl]
  );
  return rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [id, passwordHash]);
}

async function touchLastLogin(id) {
  await query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [id]);
}

async function setActive(id, isActive) {
  const { rows } = await query(
    `UPDATE users SET is_active = $2 WHERE id = $1 RETURNING ${PUBLIC_FIELDS}`,
    [id, isActive]
  );
  return rows[0] || null;
}

async function list({ role, search, limit, offset }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (role) {
    conditions.push(`role = $${idx++}`);
    params.push(role);
  }
  if (search) {
    conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await query(`SELECT COUNT(*) FROM users ${where}`, params);
  const { rows } = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );
  return { rows, totalCount: parseInt(countRows[0].count, 10) };
}

async function getPreferences(userId) {
  const { rows } = await query(`SELECT * FROM user_preferences WHERE user_id = $1`, [userId]);
  return rows[0] || null;
}

async function upsertPreferences(userId, prefs) {
  const {
    preferredCuisines = [],
    dietaryRestrictions = [],
    budgetRange = null,
    preferredServices = [],
    homeLatitude = null,
    homeLongitude = null,
    maxDistanceKm = 5.0,
  } = prefs;

  const { rows } = await query(
    `INSERT INTO user_preferences
       (user_id, preferred_cuisines, dietary_restrictions, budget_range, preferred_services,
        home_latitude, home_longitude, max_distance_km, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
     ON CONFLICT (user_id) DO UPDATE SET
       preferred_cuisines = EXCLUDED.preferred_cuisines,
       dietary_restrictions = EXCLUDED.dietary_restrictions,
       budget_range = EXCLUDED.budget_range,
       preferred_services = EXCLUDED.preferred_services,
       home_latitude = EXCLUDED.home_latitude,
       home_longitude = EXCLUDED.home_longitude,
       max_distance_km = EXCLUDED.max_distance_km,
       updated_at = now()
     RETURNING *`,
    [userId, preferredCuisines, dietaryRestrictions, budgetRange, preferredServices,
      homeLatitude, homeLongitude, maxDistanceKm]
  );
  return rows[0];
}

module.exports = {
  PUBLIC_FIELDS,
  findById,
  findByEmail,
  create,
  updateProfile,
  updatePassword,
  touchLastLogin,
  setActive,
  list,
  getPreferences,
  upsertPreferences,
};
