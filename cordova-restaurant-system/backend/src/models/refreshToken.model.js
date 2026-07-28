const { query } = require('../config/db');

async function store({ userId, tokenHash, userAgent, ipAddress, expiresAt }) {
  const { rows } = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, tokenHash, userAgent, ipAddress, expiresAt]
  );
  return rows[0].id;
}

async function findValidByHash(tokenHash) {
  const { rows } = await query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function revokeByHash(tokenHash) {
  await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, [tokenHash]);
}

async function revokeAllForUser(userId) {
  await query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = { store, findValidByHash, revokeByHash, revokeAllForUser };
