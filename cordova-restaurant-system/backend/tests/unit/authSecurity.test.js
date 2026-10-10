jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
    getTokenInfo: jest.fn(),
  })),
}));
jest.mock('../../src/models/user.model', () => ({
  findByGoogleId: jest.fn(),
  findByFacebookId: jest.fn(),
  findByEmail: jest.fn(),
  touchLastLogin: jest.fn(),
}));
jest.mock('../../src/models/refreshToken.model', () => ({ store: jest.fn() }));
jest.mock('../../src/utils/jwt', () => ({
  signAccessToken: jest.fn(() => 'access'),
  signRefreshToken: jest.fn(() => 'refresh'),
  verifyRefreshToken: jest.fn(),
  hashToken: jest.fn(() => 'hash'),
}));

const { OAuth2Client } = require('google-auth-library');
const env = require('../../src/config/env');
const userModel = require('../../src/models/user.model');
const auth = require('../../src/services/auth.service');
const emailService = require('../../src/services/email.service');
const logger = require('../../src/utils/logger');

const googleClient = OAuth2Client.mock.results[0].value;
const account = { id: 'user-1', email: 'diner@example.com', role: 'customer', is_active: true };
const originalGoogleClientId = env.google.clientId;
const originalFacebook = { ...env.facebook };
const originalIsProduction = env.isProduction;
const originalRequireEmailVerification = env.auth.requireEmailVerification;
const originalFetch = global.fetch;

afterAll(() => {
  env.google.clientId = originalGoogleClientId;
  Object.assign(env.facebook, originalFacebook);
  env.isProduction = originalIsProduction;
  env.auth.requireEmailVerification = originalRequireEmailVerification;
  global.fetch = originalFetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  env.google.clientId = 'our-google-client-id';
  env.facebook.appId = 'our-facebook-app-id';
  env.facebook.appSecret = 'app-secret';
  env.isProduction = false;
  global.fetch = jest.fn();
  userModel.findByGoogleId.mockResolvedValue(account);
  userModel.findByFacebookId.mockResolvedValue(account);
});

test('rejects a forged Google ID token without using decoded claims', async () => {
  const forged = ['eyJhbGciOiJub25lIn0', Buffer.from(JSON.stringify({
    sub: 'attacker', email: 'victim@example.com', email_verified: true,
  })).toString('base64url'), 'signature'].join('.');
  googleClient.verifyIdToken.mockRejectedValue(new Error('Invalid signature'));

  await expect(auth.googleOAuth({ idToken: forged })).rejects.toMatchObject({ statusCode: 401 });
  expect(userModel.findByGoogleId).not.toHaveBeenCalled();
  expect(userModel.findByEmail).not.toHaveBeenCalled();
});

test('rejects simulated Google token and an access token for another app', async () => {
  googleClient.getTokenInfo.mockRejectedValueOnce(new Error('Invalid token'));
  await expect(auth.googleOAuth({ credential: 'google_oauth_token_123' }))
    .rejects.toMatchObject({ statusCode: 401 });

  googleClient.getTokenInfo.mockResolvedValueOnce({ aud: 'different-google-client-id' });
  await expect(auth.googleOAuth({ credential: 'real-access-token' }))
    .rejects.toMatchObject({ statusCode: 401 });
  expect(global.fetch).not.toHaveBeenCalled();
  expect(userModel.findByGoogleId).not.toHaveBeenCalled();
});

test('accepts a Google access token only after audience and profile validation', async () => {
  googleClient.getTokenInfo.mockResolvedValue({ aud: env.google.clientId, user_id: 'google-1' });
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({
    sub: 'google-1', email: account.email, email_verified: true, name: 'Diner',
  }) });

  const result = await auth.googleOAuth({ credential: 'real-access-token' });
  expect(userModel.findByGoogleId).toHaveBeenCalledWith('google-1');
  expect(result.accessToken).toBe('access');
});

test('rejects Google ID tokens without a verified email', async () => {
  googleClient.verifyIdToken.mockResolvedValue({ getPayload: () => ({
    sub: 'google-1', email: account.email, email_verified: false,
  }) });
  await expect(auth.googleOAuth({ idToken: 'header.payload.signature' }))
    .rejects.toMatchObject({ statusCode: 401 });
  expect(userModel.findByGoogleId).not.toHaveBeenCalled();
});

test('rejects simulated and wrong-app Facebook tokens before account lookup', async () => {
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: {
    is_valid: true, app_id: 'different-app', user_id: 'facebook-1',
  } }) });
  await expect(auth.facebookOAuth({ accessToken: 'fb_oauth_token_123' }))
    .rejects.toMatchObject({ statusCode: 401 });
  expect(userModel.findByFacebookId).not.toHaveBeenCalled();
  expect(userModel.findByEmail).not.toHaveBeenCalled();
});

test('dev email verification is always disabled in production', async () => {
  env.isProduction = true;
  env.auth.requireEmailVerification = false;
  await expect(auth.devVerifyEmail({ email: account.email }))
    .rejects.toMatchObject({ statusCode: 403 });
  expect(userModel.findByEmail).not.toHaveBeenCalled();
});

test('production email delivery never logs a reset link when no provider sends it', async () => {
  const originalEmail = { ...env.email };
  const logSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
  env.isProduction = true;
  env.email.resendApiKey = null;
  env.email.smtpHost = null;
  env.email.smtpUser = null;
  env.email.smtpPass = null;
  try {
    await expect(emailService.sendPasswordResetEmail(account.email, 'Diner', 'private-reset-token'))
      .rejects.toThrow('Email delivery failed');
    expect(logSpy).not.toHaveBeenCalled();
  } finally {
    Object.assign(env.email, originalEmail);
    logSpy.mockRestore();
  }
});
