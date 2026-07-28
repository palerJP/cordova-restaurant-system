const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches JWT_REFRESH_EXPIRES_IN default
  };
}

function requestMeta(req) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully', data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, requestMeta(req));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ success: true, message: 'Logged in successfully', data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(token, requestMeta(req));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ success: true, data: { user, accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out successfully' });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, message: 'Password changed. Please log in again.' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, refresh, logout, changePassword, me };
