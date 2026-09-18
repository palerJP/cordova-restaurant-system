/**
 * Centralized, validated environment configuration.
 * Every other module reads config from here instead of process.env directly,
 * so we fail fast at boot with a clear error instead of a cryptic runtime bug.
 */
require('dotenv').config();

const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
];

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    if (process.env.NODE_ENV === 'production' || REQUIRED_IN_PRODUCTION.includes(name)) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '4000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  db: {
    url: required('DATABASE_URL', 'postgres://postgres:postgres@localhost:5433/cordova_restaurants'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret_change_me_please_32chars'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me_please_32chars'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cookie: {
    secret: required('COOKIE_SECRET', 'dev_cookie_secret_change_me'),
    secure: process.env.COOKIE_SECURE === 'true',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxMb: parseInt(process.env.MAX_UPLOAD_MB || '5', 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY || null,
    smtpHost: process.env.SMTP_HOST || null,
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || null,
    smtpPass: process.env.SMTP_PASS || null,
    smtpSecure: process.env.SMTP_SECURE === 'true',
    from: process.env.EMAIL_FROM || 'CordovaEats <noreply@cordovaeats.com>',
  },

  auth: {
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== undefined
      ? process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
      : (process.env.NODE_ENV === 'production' && process.env.REQUIRE_EMAIL_VERIFICATION !== 'false'),
  },
};

module.exports = env;
