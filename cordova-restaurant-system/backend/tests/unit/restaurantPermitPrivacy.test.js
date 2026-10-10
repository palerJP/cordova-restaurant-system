jest.mock('../../src/config/db', () => ({ query: jest.fn(), withTransaction: jest.fn() }));

const { query } = require('../../src/config/db');
const restaurants = require('../../src/models/restaurant.model');

afterEach(() => jest.clearAllMocks());

test('public restaurant lookup omits the stored business permit reference', async () => {
  query.mockResolvedValue({ rows: [{ id: 'restaurant-1', name: 'Test', business_permit_url: 'private-reference' }] });
  const result = await restaurants.findBySlug('test');
  expect(result).toEqual({ id: 'restaurant-1', name: 'Test' });
});

test('admin lookup can indicate a permit while the download reads it separately', async () => {
  query.mockResolvedValueOnce({ rows: [{ id: 'restaurant-1', business_permit_url: 'private-reference' }] })
    .mockResolvedValueOnce({ rows: [{ count: '1' }] })
    .mockResolvedValueOnce({ rows: [{ business_permit_url: 'private-reference' }] });
  const result = await restaurants.search({ includePermit: true });
  expect(result.rows[0].business_permit_url).toBe('private-reference');
  expect(await restaurants.findPermitReference('restaurant-1')).toBe('private-reference');
});
