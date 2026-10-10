jest.mock('../../src/config/env', () => ({ isProduction: true, google: { clientId: 'test-client' }, jwt: { refreshExpiresIn: '30d' } }));
jest.mock('google-auth-library', () => ({ OAuth2Client: jest.fn(() => ({ verifyIdToken: jest.fn(async () => { throw new Error('Invalid signature'); }) })) }));
jest.mock('../../src/models/user.model', () => ({ findByGoogleId: jest.fn() }));
jest.mock('../../src/models/refreshToken.model', () => ({}));
jest.mock('../../src/models/token.model', () => ({}));
jest.mock('../../src/services/email.service', () => ({}));
const auth = require('../../src/services/auth.service');
const users = require('../../src/models/user.model');

describe('production OAuth boundaries', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; jest.clearAllMocks(); });
  test('simulated Google sign-in is rejected', async () => {
    await expect(auth.googleOAuth({ credential: 'google_oauth_token_test' })).rejects.toThrow('Simulated sign-in is disabled');
    expect(users.findByGoogleId).not.toHaveBeenCalled();
  });
  test('unverified JWT data cannot authenticate', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));
    await expect(auth.googleOAuth({ credential: 'untrusted.jwt.payload' })).rejects.toThrow('Google authentication could not be verified');
    expect(users.findByGoogleId).not.toHaveBeenCalled();
  });
  test('unfinished Facebook integration cannot authenticate in production', async () => {
    await expect(auth.facebookOAuth({ accessToken: 'fb_oauth_token_test' })).rejects.toThrow('Facebook sign-in is not configured for production');
  });
  test('developer email verification is rejected', async () => {
    await expect(auth.devVerifyEmail({ email: 'test@example.com' })).rejects.toThrow('Dev-verify is disabled');
  });
});
