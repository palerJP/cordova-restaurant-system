const { signRefreshToken, verifyRefreshToken, hashToken } = require('../../src/utils/jwt');

test('back-to-back refresh token issuance creates distinct valid tokens and hashes', () => {
  const user = { id: 'user-1' };
  const first = signRefreshToken(user);
  const second = signRefreshToken(user);

  expect(first).not.toBe(second);
  expect(hashToken(first)).not.toBe(hashToken(second));
  expect(verifyRefreshToken(first)).toMatchObject({ sub: user.id, jti: expect.any(String) });
  expect(verifyRefreshToken(second)).toMatchObject({ sub: user.id, jti: expect.any(String) });
  expect(verifyRefreshToken(first).jti).not.toBe(verifyRefreshToken(second).jti);
});
