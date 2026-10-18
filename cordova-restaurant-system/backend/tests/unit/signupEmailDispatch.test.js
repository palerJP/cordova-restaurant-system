jest.mock('google-auth-library', () => ({ OAuth2Client: jest.fn() }));
jest.mock('../../src/models/user.model', () => ({ findByEmail: jest.fn(), create: jest.fn() }));
jest.mock('../../src/models/token.model', () => ({ createEmailVerificationToken: jest.fn() }));
jest.mock('../../src/services/email.service', () => ({ sendVerificationEmail: jest.fn() }));
jest.mock('../../src/utils/password', () => ({ hashPassword: jest.fn().mockResolvedValue('password-hash') }));

const env = require('../../src/config/env');
const users = require('../../src/models/user.model');
const tokens = require('../../src/models/token.model');
const mail = require('../../src/services/email.service');
const auth = require('../../src/services/auth.service');
const originalProduction = env.isProduction;
const account = { id: 'test-user', email: 'diner@example.com', full_name: 'Diner' };

beforeEach(() => {
  jest.clearAllMocks();
  env.isProduction = true;
  users.findByEmail.mockResolvedValue(null);
  users.create.mockResolvedValue(account);
  tokens.createEmailVerificationToken.mockResolvedValue('verification-token');
  mail.sendVerificationEmail.mockResolvedValue(true);
});
afterAll(() => { env.isProduction = originalProduction; });

test('signup waits for the welcome email even when promotional marketing is declined', async () => {
  await auth.register({ email: account.email, password: 'Password123', fullName: 'Diner', acceptsMarketing: false });
  expect(tokens.createEmailVerificationToken).toHaveBeenCalledWith(account.id, 30);
  expect(mail.sendVerificationEmail).toHaveBeenCalledWith(account.email, 'Diner', 'verification-token', { welcome: true });
  expect(users.create).toHaveBeenCalledWith(expect.objectContaining({ acceptsMarketing: false }));
});

test('failed email delivery produces a recoverable account-created error', async () => {
  mail.sendVerificationEmail.mockRejectedValue(new Error('SMTP unavailable'));
  await expect(auth.register({ email: account.email, password: 'Password123', fullName: 'Diner' }))
    .rejects.toMatchObject({ statusCode: 503, message: expect.stringContaining('Account created') });
});
