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

module.exports = { apiLimiter, authLimiter };
