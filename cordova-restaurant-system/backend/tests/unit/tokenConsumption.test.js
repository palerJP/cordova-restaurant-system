jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
const { query } = require('../../src/config/db');
const tokens = require('../../src/models/token.model');

describe('single-use account tokens', () => {
  beforeEach(() => query.mockReset());
  test.each(['verifyAndConsumeEmailToken', 'verifyAndConsumeResetToken'])('%s rejects a concurrent consume', async (method) => {
    query.mockResolvedValueOnce({ rows: [{ id: 'token', user_id: 'user', expires_at: new Date(Date.now() + 60000), used_at: null }] });
    query.mockResolvedValueOnce({ rows: [] });
    await expect(tokens[method]('raw')).resolves.toEqual({ success: false, reason: 'already_used' });
    expect(query.mock.calls[1][0]).toContain('used_at IS NULL AND expires_at > NOW()');
    expect(query).toHaveBeenCalledTimes(2);
  });
});
