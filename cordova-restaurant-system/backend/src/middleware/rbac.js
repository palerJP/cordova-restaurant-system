const ApiError = require('../utils/apiError');

/**
 * Restricts a route to one or more roles. Must run AFTER requireAuth.
 * Usage: router.post('/restaurants', requireAuth, requireRole('owner', 'admin'), ...)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}

module.exports = { requireRole };
