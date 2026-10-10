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
  if (!user.is_active) throw ApiError.unauthorized('Account no longer active');
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
  const requireVerification = env.auth.requireEmailVerification;
  const user = await userModel.create({
    email,
    passwordHash,
    fullName,
    role,
    phone,
    acceptsMarketing,
    emailVerified: !requireVerification,
  });

  // Generate a single-use verification token and dispatch the email.
  try {
    const rawToken = await tokenModel.createEmailVerificationToken(user.id, 30);
    await emailService.sendVerificationEmail(user.email, user.full_name, rawToken);
  } catch (emailErr) {
    if (env.isProduction) {
      throw new ApiError(503, 'Account created, but verification email could not be sent. Sign in and request a new verification email.');
    }
  }

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

  // Auto-verify on login when email verification is disabled in dev/localhost
  if (!env.auth.requireEmailVerification && !user.email_verified) {
    await userModel.updateEmailVerified(user.id, true);
    user.email_verified = true;
  }

  await userModel.touchLastLogin(user.id);
  const tokens = await issueTokenPair(user, meta);

  const { password_hash, ...safeUser } = user;
  return { user: { ...safeUser, has_password: !!password_hash }, ...tokens };
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
    try {
      await emailService.sendPasswordResetEmail(user.email, user.full_name, rawToken);
    } catch (_err) {
      // Keep the response identical for known and unknown emails.
    }
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

async function googleOAuth({ idToken, credential, accessToken, token: clientToken }, meta = {}) {
  const token = idToken || credential || accessToken || clientToken;
  if (!token) throw ApiError.badRequest('Google authentication token is required');
  if (env.isProduction && typeof token === 'string' && token.startsWith('google_oauth_token_')) {
    throw ApiError.unauthorized('Simulated sign-in is disabled');
  }
  if (!env.google.clientId) throw ApiError.forbidden('Google sign-in is not configured');

  let email, googleId, name, picture;
  try {
    if (typeof token === 'string' && token.split('.').length === 3) {
      // Credential mode: verify signature, issuer, expiry, and our client audience.
      const ticket = await googleClient.verifyIdToken({ idToken: token, audience: env.google.clientId });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        throw new Error('Unverified Google account');
      }
      ({ email, name, picture } = payload);
      googleId = payload.sub;
    } else {
      // The frontend uses Google's OAuth access-token popup. TokenInfo proves
      // that the token was issued for our app before we trust UserInfo.
      const info = await googleClient.getTokenInfo(token);
      if (info.aud !== env.google.clientId || (info.expiry_date && info.expiry_date <= Date.now())) {
        throw new Error('Google token audience or expiry mismatch');
      }
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Google UserInfo request failed');
      const profile = await response.json();
      if (!profile.sub || !profile.email || profile.email_verified !== true
        || (info.user_id && info.user_id !== profile.sub)) {
        throw new Error('Unverified Google account');
      }
      email = profile.email;
      googleId = profile.sub;
      name = profile.name || profile.given_name;
      picture = profile.picture;
    }
  } catch (_err) {
    throw ApiError.unauthorized('Google authentication could not be verified');
  }

  // 4. Check if user already linked via Google ID
  let user = await userModel.findByGoogleId(googleId);

  // 5. Account linking: Check if existing account exists by email
  if (!user) {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      if (!existingUser.is_active) throw ApiError.unauthorized('Account no longer active');
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
  return { user: { ...safeUser, has_password: !!password_hash }, ...tokens };
}

async function facebookOAuth({ accessToken, token: clientToken }, meta = {}) {
  if (env.isProduction) throw ApiError.unauthorized('Facebook sign-in is not configured for production');
  const token = accessToken || clientToken;
  if (!token) throw ApiError.badRequest('Facebook Access Token is required');
  if (!env.facebook.appId || !env.facebook.appSecret) {
    throw ApiError.forbidden('Facebook sign-in is not configured');
  }

  let facebookId, email, name, picture;
  try {
    const debugUrl = new URL('https://graph.facebook.com/debug_token');
    debugUrl.searchParams.set('input_token', token);
    debugUrl.searchParams.set('access_token', `${env.facebook.appId}|${env.facebook.appSecret}`);
    const debugResponse = await fetch(debugUrl);
    if (!debugResponse.ok) throw new Error('Facebook token verification failed');
    const verified = (await debugResponse.json()).data;
    if (!verified?.is_valid || verified.app_id !== env.facebook.appId
      || !verified.user_id || (verified.expires_at && verified.expires_at * 1000 <= Date.now())) {
      throw new Error('Invalid Facebook app token');
    }

    const profileUrl = new URL('https://graph.facebook.com/me');
    profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
    profileUrl.searchParams.set('access_token', token);
    const profileResponse = await fetch(profileUrl);
    if (!profileResponse.ok) throw new Error('Facebook profile request failed');
    const profile = await profileResponse.json();
    if (profile.error || profile.id !== verified.user_id || !profile.email) {
      throw new Error('Unverified Facebook profile');
    }
    facebookId = profile.id;
    email = profile.email;
    name = profile.name || 'Facebook User';
    picture = profile.picture?.data?.url || null;
  } catch (_err) {
    throw ApiError.unauthorized('Invalid or unverified Facebook token');
  }

  // 1. Check if user already linked via Facebook ID
  let user = await userModel.findByFacebookId(facebookId);

  // 2. Account linking: Check if existing account exists by email
  if (!user) {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      // Facebook does not provide a reliable verified-email claim. Linking by
      // email alone could give access to an unrelated existing account.
      throw ApiError.conflict('An account with this email already exists. Sign in with its original method.');
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
  return { user: { ...safeUser, has_password: !!password_hash }, ...tokens };
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
  return { user: { ...safeUser, has_password: !!password_hash }, ...tokens };
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

async function devVerifyEmail({ email, userId }) {
  if (env.isProduction) {
    throw ApiError.forbidden('Dev-verify is disabled in production environments');
  }
  let user;
  if (userId) {
    user = await userModel.findById(userId);
  } else if (email) {
    user = await userModel.findByEmail(email);
  }
  if (!user) throw ApiError.notFound('User not found');
  const updated = await userModel.updateEmailVerified(user.id, true);
  const safeUser = { ...updated };
  delete safeUser.password_hash;
  return safeUser;
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  devVerifyEmail,
  forgotPassword,
  resetPassword,
  googleOAuth,
  facebookOAuth,
  refresh,
  logout,
  changePassword,
};
