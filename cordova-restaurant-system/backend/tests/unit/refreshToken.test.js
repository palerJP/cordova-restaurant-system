const { signRefreshToken, verifyRefreshToken } = require('../../src/utils/jwt');

test('refresh tokens are unique even for simultaneous sign-ins', () => {
  const user = { id: 'test-user' };
  const first = signRefreshToken(user);
  const second = signRefreshToken(user);
  expect(first).not.toBe(second);
  expect(verifyRefreshToken(first).sub).toBe(user.id);
  expect(verifyRefreshToken(first).jti).not.toBe(verifyRefreshToken(second).jti);
});
