/**
 * Integration tests for /api/restaurants and /api/recommendations.
 * Requires a migrated + seeded test database (see backend/README.md).
 */
const request = require('supertest');

const hasDb = !!process.env.DATABASE_URL;
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('Restaurants & Recommendations API', () => {
  let app;

  beforeAll(() => {
    app = require('../../src/app');
  });

  it('lists verified restaurants with pagination metadata', async () => {
    const res = await request(app).get('/api/restaurants?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('totalCount');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('filters restaurants by price range', async () => {
    const res = await request(app).get('/api/restaurants?priceRange=budget');
    expect(res.status).toBe(200);
    res.body.data.forEach((r) => expect(r.price_range).toBe('budget'));
  });

  it('rejects an invalid sortBy value', async () => {
    const res = await request(app).get('/api/restaurants?sortBy=not_a_real_option');
    expect(res.status).toBe(400);
  });

  it('returns 404 for a restaurant that does not exist', async () => {
    const res = await request(app).get('/api/restaurants/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('returns ranked recommendations for a guest with constraints', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({
        preferredCuisines: ['Seafood'],
        budgetRange: 'moderate',
        lat: 10.253,
        lng: 123.949,
        maxDistanceKm: 10,
      });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 1) {
      // results should be sorted descending by score
      expect(res.body.data[0].score).toBeGreaterThanOrEqual(res.body.data[1].score);
    }
    expect(res.body.meta.weightsUsed).toBeDefined();
  });

  it('requires admin role to view admin restaurant queue', async () => {
    const res = await request(app).get('/api/admin/restaurants');
    expect(res.status).toBe(401);
  });
});
