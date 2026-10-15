jest.mock('../../src/config/db', () => ({ query: jest.fn(), withTransaction: jest.fn() }));
jest.mock('../../src/services/highlightImage.service', () => ({ save: jest.fn(), remove: jest.fn() }));

const express = require('express');
const request = require('supertest');
const db = require('../../src/config/db');
const images = require('../../src/services/highlightImage.service');
const controller = require('../../src/controllers/highlight.controller');

const restaurantId = '11111111-1111-4111-8111-111111111111';
const customerId = '22222222-2222-4222-8222-222222222222';
const highlightId = '33333333-3333-4333-8333-333333333333';

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  req.user = { id: customerId };
  req.files = req.method === 'POST' ? [{ buffer: Buffer.from('photo') }] : [];
  next();
});
app.post('/restaurants/:restaurantId/highlights', controller.create);
app.patch('/highlights/:id', controller.update);
app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }));

beforeEach(() => {
  jest.clearAllMocks();
  images.save.mockResolvedValue('local-highlight:test.webp');
  db.query.mockResolvedValue({ rows: [{ id: restaurantId }] });
});

test('new gallery photos publish immediately', async () => {
  const statements = [];
  db.withTransaction.mockImplementation(async (callback) => callback({
    query: async (sql) => {
      statements.push(sql);
      return { rows: [{ id: highlightId }] };
    },
  }));

  const response = await request(app).post(`/restaurants/${restaurantId}/highlights`)
    .send({ caption: 'A visit', category: 'Overall Experience' }).expect(201);

  expect(response.body.data).toEqual({ id: highlightId, status: 'approved' });
  expect(statements[0]).toContain("'approved'");
  expect(statements[1]).toContain('visit_highlight_images');
});

test('editing a gallery photo keeps it public', async () => {
  const statements = [];
  db.withTransaction.mockImplementation(async (callback) => callback({
    query: async (sql) => {
      statements.push(sql);
      return { rows: [{ id: highlightId, status: 'approved' }] };
    },
  }));

  const response = await request(app).patch(`/highlights/${highlightId}`)
    .send({ caption: 'Updated visit', category: 'Overall Experience' }).expect(200);

  expect(response.body.data.status).toBe('approved');
  expect(statements.some((sql) => sql.includes("status='approved'"))).toBe(true);
});
