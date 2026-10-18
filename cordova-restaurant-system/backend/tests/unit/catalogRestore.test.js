jest.mock('node:fs', () => ({ readFileSync: jest.fn() }));
jest.mock('../../src/config/db', () => ({ pool: { connect: jest.fn() } }));
const fs = require('node:fs');
const { pool } = require('../../src/config/db');
const { run } = require('../../src/scripts/restore_public_catalog');
const client = { query: jest.fn(), release: jest.fn() };
beforeEach(() => {
  jest.clearAllMocks();
  pool.connect.mockResolvedValue(client);
  fs.readFileSync.mockImplementation((path) => JSON.stringify(path === 'snapshot'
    ? { catalog: [{ slug: 'approved-place' }], menus: [] }
    : { restaurants: [{ slug: 'approved-place', status: 'verified' }] }));
});

test('restoration preview reads existing applications without changing them', async () => {
  client.query.mockResolvedValue({ rows: [{ id: 'existing', slug: 'pending-place', status: 'pending' }] });
  expect(await run('snapshot','backup')).toMatchObject({ missing: 1, existingPreserved: 1, restored: 0 });
  expect(client.query).toHaveBeenCalledTimes(1);
});

test('existing slugs are preserved even if the backup previously marked them verified', async () => {
  client.query.mockResolvedValue({ rows: [{ id: 'existing', slug: 'approved-place', status: 'rejected' }] });
  expect(await run('snapshot','backup',{ apply: true })).toMatchObject({ missing: 0, restored: 0 });
  expect(client.query).toHaveBeenCalledTimes(1);
});

test('a directory entry without a previously approved record cannot be restored', async () => {
  fs.readFileSync.mockImplementation((path) => JSON.stringify(path === 'snapshot'
    ? { catalog: [{ slug: 'unapproved-place' }] }
    : { restaurants: [{ slug: 'unapproved-place', status: 'pending' }] }));
  await expect(run('snapshot','backup',{ apply: true })).rejects.toThrow('No previously approved record');
  expect(pool.connect).not.toHaveBeenCalled();
});
