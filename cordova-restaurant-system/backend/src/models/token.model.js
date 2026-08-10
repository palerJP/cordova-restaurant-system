const crypto = require('crypto');
const { query } = require('../config/db');

function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a single-use secure email verification token for a user.
 * Invalidates previous active verification tokens for the user.
 */
async function createEmailVerificationToken(userId, minutesValid = 30) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + minutesValid * 60 * 1000);

  // Invalidate previous unused tokens for this user
  await query(
    `UPDATE email_verification_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );

  await query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return rawToken;
}

/**
 * Validates and consumes an email verification token.
 * Returns the user_id if valid, or null if invalid/expired/already used.
 */
async function verifyAndConsumeEmailToken(rawToken) {
  const tokenHash = hashToken(rawToken);

  const res = await query(
    `SELECT id, user_id, expires_at, used_at FROM email_verification_tokens WHERE token_hash = $1`,
    [tokenHash]
  );

  if (res.rows.length === 0) {
    return { success: false, reason: 'invalid' };
  }

  const tokenRecord = res.rows[0];

  if (tokenRecord.used_at) {
    return { success: false, reason: 'already_used' };
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { success: false, reason: 'expired' };
  }

  // Mark token used and update user's email_verified status
  await query(`UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`, [tokenRecord.id]);
  await query(`UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1`, [tokenRecord.user_id]);

  return { success: true, userId: tokenRecord.user_id };
}

/**
 * Creates a single-use secure password reset token for a user.
 * Invalidates previous unused reset tokens for the user.
 */
async function createPasswordResetToken(userId, minutesValid = 15) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + minutesValid * 60 * 1000);

  await query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );

  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return rawToken;
}

/**
 * Validates and consumes a password reset token.
 */
async function verifyAndConsumeResetToken(rawToken) {
  const tokenHash = hashToken(rawToken);

  const res = await query(
    `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1`,
    [tokenHash]
  );

  if (res.rows.length === 0) {
    return { success: false, reason: 'invalid' };
  }

  const tokenRecord = res.rows[0];

  if (tokenRecord.used_at) {
    return { success: false, reason: 'already_used' };
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { success: false, reason: 'expired' };
  }

  // Mark token used
  await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [tokenRecord.id]);

  return { success: true, userId: tokenRecord.user_id };
}

/**
 * Gets the most recent email verification token timestamp for cooldown checks.
 */
async function getLastVerificationTokenTime(userId) {
  const res = await query(
    `SELECT created_at FROM email_verification_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return res.rows[0]?.created_at || null;
}

module.exports = {
  generateRawToken,
  hashToken,
  createEmailVerificationToken,
  verifyAndConsumeEmailToken,
  createPasswordResetToken,
  verifyAndConsumeResetToken,
  getLastVerificationTokenTime,
};
