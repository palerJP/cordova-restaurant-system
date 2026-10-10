jest.mock('../../src/models/user.model', () => ({ findById: jest.fn() }));
jest.mock('../../src/utils/jwt', () => ({ verifyAccessToken: jest.fn(() => ({ sub: 'user-1' })) }));

const express = require('express');
const request = require('supertest');
const env = require('../../src/config/env');
const userModel = require('../../src/models/user.model');
const { requireAuth, optionalAuth } = require('../../src/middleware/auth');

const originalRequireVerification = env.auth.requireEmailVerification;

afterAll(() => { env.auth.requireEmailVerification = originalRequireVerification; });

beforeEach(() => {
  env.auth.requireEmailVerification = true;
  userModel.findById.mockResolvedValue({
    id: 'user-1', email: 'diner@example.com', role: 'customer', is_active: true,
    email_verified: false,
  });
});

function makeApp() {
  const app = express();
  const authRouter = express.Router();
  authRouter.get('/me', requireAuth, (_req, res) => res.sendStatus(200));
  authRouter.post('/resend-verification', requireAuth, (_req, res) => res.sendStatus(200));
  app.use('/api/auth', authRouter);
  app.get('/api/private', requireAuth, (_req, res) => res.sendStatus(200));
  app.get('/api/public', optionalAuth, (req, res) => res.json({ signedIn: !!req.user }));
  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }));
  return app;
}

test('unverified users may inspect account and request email but cannot access protected actions', async () => {
  const app = makeApp();
  const authHeader = { Authorization: 'Bearer test-token' };
  expect((await request(app).get('/api/auth/me').set(authHeader)).status).toBe(200);
  expect((await request(app).post('/api/auth/resend-verification').set(authHeader)).status).toBe(200);
  const protectedResponse = await request(app).get('/api/private').set(authHeader);
  expect(protectedResponse.status).toBe(403);
  expect(protectedResponse.body.message).toMatch(/Verify your email/);
  expect((await request(app).get('/api/public').set(authHeader)).body.signedIn).toBe(false);
});

test('verified users may access protected actions', async () => {
  userModel.findById.mockResolvedValueOnce({
    id: 'user-1', email: 'diner@example.com', role: 'customer', is_active: true,
    email_verified: true,
  });
  expect((await request(makeApp()).get('/api/private').set('Authorization', 'Bearer test-token')).status).toBe(200);
});
