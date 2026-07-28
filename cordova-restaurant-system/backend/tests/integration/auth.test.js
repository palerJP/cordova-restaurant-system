/**
 * Integration tests for /api/auth/*.
 *
 * Requires a real PostgreSQL test database migrated with
 * database/migrations/*.sql. Set DATABASE_URL to point at a disposable
 * test DB before running (see backend/README.md "Running tests").
 * These are skipped automatically if DATABASE_URL is not set, so
 * `npm test` doesn't fail in environments with no DB configured.
 */
const request = require('supertest');

const hasDb = !!process.env.DATABASE_URL;
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('Auth API', () => {
  let app;
  const testUser = {
    email: `test.${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Test User',
    role: 'customer',
  };

  beforeAll(() => {
    app = require('../../src/app');
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('registers a new customer account', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('logs in successfully and returns an access token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects self-registration as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: `admin.${Date.now()}@example.com`, role: 'admin' });
    expect(res.status).toBe(400); // fails validator (role must be customer|owner)
  });

  it('returns the current user on GET /me with a valid token', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    const token = login.body.data.accessToken;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('rejects GET /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
