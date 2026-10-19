jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
const { query } = require('../../src/config/db');
const users = require('../../src/models/user.model');
const { parsePagination, buildPageMeta } = require('../../src/utils/pagination');
beforeEach(() => { jest.clearAllMocks(); });

test('admin user pages use bounded results and a stable tie-breaker', async () => {
  query.mockResolvedValueOnce({ rows: [{ count: '12' }] }).mockResolvedValueOnce({ rows: [{ id: 'page-2-user' }] });
  const paging = parsePagination({ page: '2', limit: '5' });
  const result = await users.list(paging);
  expect(query.mock.calls[1][0]).toContain('ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2');
  expect(query.mock.calls[1][1]).toEqual([5,5]);
  expect(buildPageMeta({ ...paging, totalCount: result.totalCount })).toMatchObject({ page:2,totalPages:3,hasNextPage:true,hasPrevPage:true });
});

test('role and search apply equally to page totals and paged users', async () => {
  query.mockResolvedValueOnce({ rows: [{ count: '2' }] }).mockResolvedValueOnce({ rows: [] });
  const result = await users.list({ role:'customer',search:'Diner',limit:5,offset:0 });
  expect(result.totalCount).toBe(2);
  expect(query.mock.calls[0][1]).toEqual(['customer','%Diner%']);
  expect(query.mock.calls[1][1]).toEqual(['customer','%Diner%',5,0]);
});

test('removing the only user on a last page identifies the preceding page', () => {
  const meta = buildPageMeta({ page:3,limit:5,totalCount:10 });
  expect(meta.totalPages).toBe(2);
  expect(meta.hasNextPage).toBe(false);
});
