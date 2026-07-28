const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const env = require('../config/env');

/** 404 handler — placed after all routes. */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Every thrown/forwarded error lands here.
 * Operational (expected) errors return their own status + message.
 * Unexpected errors are logged with full detail but never leak internals
 * to the client in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  if (!(err instanceof ApiError)) {
    // Known third-party error shapes we want to translate cleanly
    if (err.code === '23505') {
      statusCode = 409;
      message = 'A record with these details already exists';
    } else if (err.code === '23503') {
      statusCode = 400;
      message = 'Referenced record does not exist';
    } else if (err.type === 'entity.too.large') {
      statusCode = 413;
      message = 'Payload too large';
    } else {
      statusCode = 500;
      message = env.isProduction ? 'Internal server error' : err.message;
    }
  }

  if (!statusCode) statusCode = 500;

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });
  } else {
    logger.warn(err.message, { path: req.originalUrl, statusCode });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && details.length ? { details } : {}),
    ...(!env.isProduction && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
