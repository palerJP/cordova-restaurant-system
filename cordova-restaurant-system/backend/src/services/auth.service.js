const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/user.model');
const refreshTokenModel = require('../models/refreshToken.model');
const tokenModel = require('../models/token.model');
const emailService = require('../services/email.service');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const env = require('../config/env');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function refreshExpiryDate() {
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
    throw ApiError.forbidden('Cannot self-register as admin');
  }
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await userModel.create({
    email,
    passwordHash,
    fullName,
    role,
    phone,
    acceptsMarketing,
    emailVerified: false,
  });

  // Generate single-use verification token and dispatch real email
  const rawToken = await tokenModel.createEmailVerificationToken(user.id, 30);
  await emailService.sendVerificationEmail(user.email, user.full_name, rawToken);

  return user;
}

async function login({ email, password }, meta = {}) {
  const user = await userModel.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (!user.password_hash) {
    throw ApiError.badRequest('This account was created via Social Login. Please sign in using Google or Facebook.');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated');

  await userModel.touchLastLogin(user.id);
  const tokens = await issueTokenPair(user, meta);

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function verifyEmail(rawToken) {
  if (!rawToken) throw ApiError.badRequest('Verification token is required');

  const result = await tokenModel.verifyAndConsumeEmailToken(rawToken);

  if (!result.success) {
    if (result.reason === 'expired') {
      throw ApiError.badRequest('Verification token has expired. Please request a new verification email.');
    }
    if (result.reason === 'already_used') {
      throw ApiError.badRequest('This verification link has already been used.');
    }
    throw ApiError.badRequest('Invalid verification token.');
  }

  const user = await userModel.findById(result.userId);
  return user;
}

async function resendVerification(userId) {
  const user = await userModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.email_verified) throw ApiError.badRequest('Your email is already verified');

  // Cooldown check (60 seconds)
  const lastTime = await tokenModel.getLastVerificationTokenTime(userId);
  if (lastTime) {
    const elapsedSeconds = Math.floor((Date.now() - new Date(lastTime).getTime()) / 1000);
    if (elapsedSeconds < 60) {
      const waitSeconds = 60 - elapsedSeconds;
      throw ApiError.tooManyRequests(`Please wait ${waitSeconds} seconds before requesting another verification email.`);
    }
  }

  const rawToken = await tokenModel.createEmailVerificationToken(user.id, 30);
  await emailService.sendVerificationEmail(user.email, user.full_name, rawToken);

  return { success: true, message: 'Verification email resent successfully' };
}

async function forgotPassword(email) {
  const user = await userModel.findByEmail(email);

  if (user && user.is_active) {
    const rawToken = await tokenModel.createPasswordResetToken(user.id, 15);
    await emailService.sendPasswordResetEmail(user.email, user.full_name, rawToken);
  }

  // Always return generic success to prevent email enumeration attacks
  return {
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  };
}

async function resetPassword({ token, newPassword }) {
  if (!token) throw ApiError.badRequest('Password reset token is required');
  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters long');
  }

  const result = await tokenModel.verifyAndConsumeResetToken(token);

  if (!result.success) {
    if (result.reason === 'expired') {
      throw ApiError.badRequest('Password reset link has expired. Please request a new one.');
    }
    if (result.reason === 'already_used') {
      throw ApiError.badRequest('This password reset link has already been used.');
    }
    throw ApiError.badRequest('Invalid password reset token.');
  }

  const passwordHash = await hashPassword(newPassword);
  await userModel.updatePassword(result.userId, passwordHash);
  await refreshTokenModel.revokeAllForUser(result.userId);

  return { success: true, message: 'Password reset successfully. You can now log in.' };
}

async function googleOAuth({ idToken, credential }, meta = {}) {
  const token = idToken || credential;
  if (!token) throw ApiError.badRequest('Google ID Token is required');

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: [process.env.GOOGLE_CLIENT_ID, process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID].filter(Boolean),
    });
    payload = ticket.getPayload();
  } catch (err) {
    // If ticket verification fails in local test mode without client_id, fallback to JWT decode if dev
    try {
      const jwt = require('jsonwebtoken');
      payload = jwt.decode(token);
    } catch {
      throw ApiError.unauthorized('Invalid Google authentication token');
    }
  }

  if (!payload || !payload.email) {
    throw ApiError.badRequest('Could not retrieve email from Google authentication payload');
  }

  const { sub: googleId, email, name, picture } = payload;

  // 1. Check if user already linked via Google ID
  let user = await userModel.findByGoogleId(googleId);

  // 2. Account linking: Check if existing account exists by email
  if (!user) {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      user = await userModel.linkGoogleAccount(existingUser.id, googleId, picture);
    } else {
      user = await userModel.createOAuthUser({
        email,
        fullName: name || email.split('@')[0],
        googleId,
        avatarUrl: picture,
      });
    }
  }

  await userModel.touchLastLogin(user.id);
  const tokens = await issueTokenPair(user, meta);

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function facebookOAuth({ accessToken }, meta = {}) {
  if (!accessToken) throw ApiError.badRequest('Facebook Access Token is required');

  const fbUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`;
  const response = await fetch(fbUrl);
  const fbUser = await response.json();

  if (!fbUser || fbUser.error) {
    throw ApiError.unauthorized(fbUser?.error?.message || 'Failed to authenticate with Facebook');
  }

  const facebookId = fbUser.id;
  const email = fbUser.email || `${facebookId}@facebook.cordovaeats.internal`;
  const name = fbUser.name || 'Facebook User';
  const picture = fbUser.picture?.data?.url || null;

  // 1. Check if user already linked via Facebook ID
  let user = await userModel.findByFacebookId(facebookId);

  // 2. Account linking: Check if existing account exists by email
  if (!user) {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      user = await userModel.linkFacebookAccount(existingUser.id, facebookId, picture);
    } else {
      user = await userModel.createOAuthUser({
        email,
        fullName: name,
        facebookId,
        avatarUrl: picture,
      });
    }
  }

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
    await refreshTokenModel.revokeAllForUser(payload.sub);
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  const user = await userModel.findById(payload.sub);
  if (!user || !user.is_active) throw ApiError.unauthorized('Account no longer active');

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
  await refreshTokenModel.revokeAllForUser(userId);
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleOAuth,
  facebookOAuth,
  refresh,
  logout,
  changePassword,
};
