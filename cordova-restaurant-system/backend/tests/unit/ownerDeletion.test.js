jest.mock('../../src/config/db', () => ({ withTransaction: jest.fn() }));
const { withTransaction } = require('../../src/config/db');
const { deleteOwnedRestaurant } = require('../../src/services/ownerDeletion.service');
let client;
beforeEach(() => {
  client = { query: jest.fn() };
  withTransaction.mockImplementation((callback) => callback(client));
});
afterEach(() => jest.clearAllMocks());
const restaurant = { id: 'business', owner_id: 'owner', name: 'My Grill' };
test('another account cannot delete an establishment', async () => {
  client.query.mockResolvedValueOnce({ rows: [restaurant] });
  await expect(deleteOwnedRestaurant('business', 'other', 'My Grill')).rejects.toThrow('You do not own');
  expect(client.query).toHaveBeenCalledTimes(1);
});
test('requires an exact confirmation name before checking bookings or deleting', async () => {
  client.query.mockResolvedValueOnce({ rows: [restaurant] });
  await expect(deleteOwnedRestaurant('business', 'owner', 'wrong')).rejects.toThrow('Type the establishment name exactly');
  expect(client.query).toHaveBeenCalledTimes(1);
});
test('upcoming requests or bookings block deletion', async () => {
  client.query.mockResolvedValueOnce({ rows: [restaurant] }).mockResolvedValueOnce({ rows: [{}] });
  await expect(deleteOwnedRestaurant('business', 'owner', 'My Grill')).rejects.toThrow('Resolve upcoming');
  expect(client.query).toHaveBeenCalledTimes(2);
  expect(client.query.mock.calls[1][0]).toContain("status IN ('pending','confirmed')");
});
test('owner deletion locks and deletes only the owned record', async () => {
  client.query.mockResolvedValueOnce({ rows: [restaurant] }).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
  await expect(deleteOwnedRestaurant('business', 'owner', 'My Grill')).resolves.toEqual(restaurant);
  expect(client.query.mock.calls[0][0]).toContain('FOR UPDATE');
  expect(client.query).toHaveBeenLastCalledWith('DELETE FROM restaurants WHERE id=$1 AND owner_id=$2', ['business', 'owner']);
});
test('protected records return an actionable error', async () => {
  client.query.mockResolvedValueOnce({ rows: [restaurant] }).mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce({ code: '23503' });
  await expect(deleteOwnedRestaurant('business', 'owner', 'My Grill')).rejects.toThrow('protected records');
});
test('missing establishments return not found', async () => {
  client.query.mockResolvedValueOnce({ rows: [] });
  await expect(deleteOwnedRestaurant('missing', 'owner', 'My Grill')).rejects.toThrow('not found');
});
