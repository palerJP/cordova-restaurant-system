const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const userModel = require('../models/user.model');

/**
 * Requires a valid access token. Populates req.user with { id, role, email }.
 * Token is read from the Authorization header ("Bearer <token>") to keep
 * the API usable by non-browser clients, not only cookie-based ones.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await userModel.findById(payload.sub);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Account no longer active');
  }

  req.user = { id: user.id, role: user.role, email: user.email, fullName: user.full_name };
  next();
});

/**
 * Optional auth: attaches req.user if a valid token is present, but does
 * NOT reject the request otherwise. Used for guest-accessible endpoints
 * that personalize output when a user happens to be logged in
 * (e.g. recommendations, view logging).
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await userModel.findById(payload.sub);
    if (user && user.is_active) {
      req.user = { id: user.id, role: user.role, email: user.email, fullName: user.full_name };
    }
  } catch (err) {
    // silently ignore invalid tokens on optional-auth routes
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
