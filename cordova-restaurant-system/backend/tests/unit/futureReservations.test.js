jest.mock('../../src/config/db', () => ({ query: jest.fn(), withTransaction: jest.fn() }));
const { query, withTransaction } = require('../../src/config/db');
const reservations = require('../../src/models/reservation.model');
let policy;
beforeEach(() => {
  policy = { enabled: true, restaurant_status: 'verified', restaurant_active: true, owner_active: true,
    max_party_size: 1, capacity: 5, duration_minutes: 60, min_notice_minutes: 60, advance_days: 90,
    server_time: '2026-10-23T08:00:00+08:00' };
  withTransaction.mockImplementation((callback) => callback({ query: jest.fn().mockResolvedValue({ rows: [] }) }));
  query.mockImplementation(async (sql) => {
    if (sql.includes('SELECT id FROM restaurants')) return { rows: [{ id: 'business' }] };
    if (sql.includes('SELECT s.*')) return { rows: [policy] };
    if (sql.includes('FROM operating_hours')) return { rows: Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, open_time: '10:00', close_time: '18:00', is_closed: false })) };
    return { rows: [] };
  });
});
test('customers can select later booking hours before the restaurant opens', async () => {
  const result = await reservations.options('business', '2026-10-23', 1);
  expect(result.settings.enabled).toBe(true);
  expect(result.slots[0].startsAt).toBe('2026-10-23T02:00:00.000Z');
  expect(result.slots.every((slot) => Date.parse(slot.endsAt) <= Date.parse('2026-10-23T18:00:00+08:00'))).toBe(true);
});
test('after closing, tomorrow remains bookable even when today has no slots', async () => {
  policy.server_time = '2026-10-23T23:30:00+08:00';
  expect((await reservations.options('business', '2026-10-23', 1)).slots).toEqual([]);
  expect((await reservations.options('business', '2026-10-24', 1)).slots[0].startsAt).toBe('2026-10-24T02:00:00.000Z');
});
test('owner-disabled reservations remain unavailable for future dates', async () => {
  policy.enabled = false;
  const result = await reservations.options('business', '2026-10-24', 1);
  expect(result.settings.enabled).toBe(false);
  expect(result.slots).toEqual([]);
});
