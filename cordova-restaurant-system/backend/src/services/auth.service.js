const userModel = require('../models/user.model');
const refreshTokenModel = require('../models/refreshToken.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const env = require('../config/env');

function refreshExpiryDate() {
  // JWT_REFRESH_EXPIRES_IN is like "30d" — parse days for the DB expiry column.
  const match = /^(\d+)d$/.exec(env.jwt.refreshExpiresIn);
  const days = match ? parseInt(match[1], 10) : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function issueTokenPair(user, meta = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await refreshTokenModel.store({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
    expiresAt: refreshExpiryDate(),
  });
  return { accessToken, refreshToken };
}

async function register({ email, password, fullName, role = 'customer', phone, acceptsMarketing = true }) {
  if (role === 'admin') {
    // Admin accounts must never be self-service registered.
    throw ApiError.forbidden('Cannot self-register as admin');
  }
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }
  const passwordHash = await hashPassword(password);
  const user = await userModel.create({ email, passwordHash, fullName, role, phone, acceptsMarketing });
  return user;
}

async function login({ email, password }, meta = {}) {
  const user = await userModel.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated');

  await userModel.touchLastLogin(user.id);
  const tokens = await issueTokenPair(user, meta);

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function refresh(rawRefreshToken, meta = {}) {
  if (!rawRefreshToken) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await refreshTokenModel.findValidByHash(tokenHash);
  if (!stored) {
    // Token reuse or already-revoked token presented — treat as compromise
    // and revoke all sessions for this user as a precaution.
    await refreshTokenModel.revokeAllForUser(payload.sub);
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  const user = await userModel.findById(payload.sub);
  if (!user || !user.is_active) throw ApiError.unauthorized('Account no longer active');

  // Rotate: revoke the used token, issue a brand new pair.
  await refreshTokenModel.revokeByHash(tokenHash);
  const tokens = await issueTokenPair(user, meta);

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  await refreshTokenModel.revokeByHash(hashToken(rawRefreshToken));
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  const newHash = await hashPassword(newPassword);
  await userModel.updatePassword(userId, newHash);
  await refreshTokenModel.revokeAllForUser(userId); // force re-login everywhere
}

module.exports = { register, login, refresh, logout, changePassword };
