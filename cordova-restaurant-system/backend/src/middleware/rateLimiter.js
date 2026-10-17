const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** General API rate limit — generous, protects against abuse/DoS. */
const standardApiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  // Public statistics polling has its own budget so it cannot exhaust normal API requests.
  skip: req => req.method === 'GET' && req.originalUrl.split('?')[0] === '/api/restaurants/review-stats',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Visible analytics dashboards refresh every five seconds using a separate IP budget.
const analyticsReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'test' ? 10000 : 400,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Analytics refresh is temporarily rate limited. Please retry shortly.' },
});
const apiLimiter = (req, res, next) => {
  const path = req.originalUrl.split('?')[0];
  const analyticsRead = req.method === 'GET' && (path === '/api/admin/analytics/overview'
    || /^\/api\/restaurants\/[0-9a-f-]+\/analytics$/i.test(path));
  return (analyticsRead ? analyticsReadLimiter : standardApiLimiter)(req, res, next);
};

/** Stricter limit on auth endpoints to blunt credential-stuffing / brute force. */
const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

const claimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many ownership submissions. Please try again in an hour.' },
});
const reviewReportLimiter = rateLimit({
 windowMs: 60 * 60 * 1000,
 max: process.env.NODE_ENV === 'test' ? 1000 : 20,
 keyGenerator: req => req.user.id,
 standardHeaders: true, legacyHeaders: false,
 message: {success:false,message:'Too many review reports. Please try again in an hour.'},
});
const reviewStatsLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'test' ? 10000 : 1200,
 standardHeaders:true, legacyHeaders:false,
 message:{success:false,message:'Review updates are temporarily rate limited. Please retry shortly.'},
});
module.exports = { apiLimiter, authLimiter, claimLimiter, reviewReportLimiter, reviewStatsLimiter };
