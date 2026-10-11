jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  withTransaction: jest.fn(),
}));

const { query } = require('../../src/config/db');
const restaurantModel = require('../../src/models/restaurant.model');
const searchModel = require('../../src/models/search.model');

describe('public restaurant search queries', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('searches available menu names and descriptions with the restaurant name', async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ count: '0' }] });

    await restaurantModel.search({ searchTerm: 'bakasi' });

    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('FROM menu_items mi');
    expect(sql).toContain('mi.is_available = TRUE');
    expect(sql).toContain('mi.name');
    expect(sql).toContain('mi.description');
    expect(sql).toContain("r.status = $1");
    expect(params).toEqual(['verified', 'bakasi', 12, 0]);
    expect(query.mock.calls[1][1]).toEqual(['verified', 'bakasi']);
  });

  it('excludes unverified establishments from the ranked search candidates', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await searchModel.getSearchCandidates();

    expect(query.mock.calls[0][0]).toContain("r.status = 'verified'");
  });
});
