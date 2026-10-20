jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
const { query } = require('../../src/config/db');
const users = require('../../src/models/user.model');

beforeEach(() => query.mockReset());

test.each(['findById', 'findByEmail', 'findByGoogleId', 'findByFacebookId'])(
  '%s repairs stale onboarding for an account with saved preferences', async (lookup) => {
    query.mockResolvedValueOnce({ rows: [{ id: 'returning', onboarding_required: true }] });
    query.mockResolvedValueOnce({ rows: [{ id: 'returning' }] });
    expect((await users[lookup]('returning')).onboarding_required).toBe(false);
    expect(query.mock.calls[1][0]).toContain('EXISTS (SELECT 1 FROM user_preferences WHERE user_id = $1)');
    expect(query.mock.calls[1][1]).toEqual(['returning']);
  }
);

test('new account without saved preferences still requires onboarding', async () => {
  query.mockResolvedValueOnce({ rows: [{ id: 'new', onboarding_required: true }] });
  query.mockResolvedValueOnce({ rows: [] });
  expect((await users.findById('new')).onboarding_required).toBe(true);
});

test('completed and legacy accounts keep their normal login flow', async () => {
  query.mockResolvedValueOnce({ rows: [{ id: 'old', onboarding_required: false }] });
  expect((await users.findById('old')).onboarding_required).toBe(false);
  expect(query).toHaveBeenCalledTimes(1);
});

test('saving preferences clears onboarding in the same database statement', async () => {
  query.mockResolvedValueOnce({ rows: [{ user_id: 'new' }] });
  await users.upsertPreferences('new', { preferredCuisines: ['Filipino'] });
  expect(query.mock.calls[0][0]).toContain('UPDATE users SET onboarding_required = FALSE WHERE id = $1');
});
