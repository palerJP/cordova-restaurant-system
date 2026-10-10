const express = require('express');
const request = require('supertest');
const validate = require('../../src/middleware/validate');
const { registerValidator, loginValidator } = require('../../src/validators/auth.validator');

function validationApp() {
  const app = express();
  app.use(express.json());
  app.post('/register', validate(registerValidator), (req, res) => res.json(req.body));
  app.post('/login', validate(loginValidator), (req, res) => res.json(req.body));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({
    message: err.message,
    details: err.details,
  }));
  return app;
}

describe('auth request validation', () => {
  const app = validationApp();

  it.each(['/register', '/login'])('trims surrounding email whitespace on %s', async (path) => {
    const body = path === '/register'
      ? { email: '  USER@EXAMPLE.COM  ', password: 'Password123', fullName: 'Test User' }
      : { email: '  USER@EXAMPLE.COM  ', password: 'Password123' };

    const res = await request(app).post(path).send(body);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('user@example.com');
  });

  it('continues to reject invalid email addresses', async () => {
    const res = await request(app).post('/login').send({ email: 'not an email', password: 'Password123' });
    expect(res.status).toBe(400);
    expect(res.body.details).toContainEqual({ field: 'email', message: 'Valid email is required' });
  });

  it('keeps the registration password requirements', async () => {
    const res = await request(app).post('/register').send({
      email: 'user@example.com', password: 'lowercaseonly', fullName: 'Test User',
    });
    expect(res.status).toBe(400);
    expect(res.body.details).toContainEqual({ field: 'password', message: 'Password must contain an uppercase letter' });
    expect(res.body.details).toContainEqual({ field: 'password', message: 'Password must contain a number' });
  });
});
