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
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

function requestMeta(req) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, requestMeta(req));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ success: true, message: 'Logged in successfully', data: { user, accessToken } });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body.token;
  const user = await authService.verifyEmail(token);
  res.json({
    success: true,
    message: 'Your email has been verified successfully! You now have full access.',
    data: { user },
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.user.id);
  res.json({ success: true, message: result.message });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json({ success: true, message: result.message });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({
    token: req.body.token,
    newPassword: req.body.newPassword,
  });
  res.json({ success: true, message: result.message });
});

const googleOAuth = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.googleOAuth(req.body, requestMeta(req));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ success: true, message: 'Google sign in successful', data: { user, accessToken } });
});

const facebookOAuth = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.facebookOAuth(req.body, requestMeta(req));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ success: true, message: 'Facebook sign in successful', data: { user, accessToken } });
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
  me,
};
