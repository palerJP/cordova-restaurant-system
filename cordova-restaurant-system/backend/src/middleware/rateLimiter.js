const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** General API rate limit — generous, protects against abuse/DoS. */
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

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
module.exports = { apiLimiter, authLimiter, claimLimiter };
