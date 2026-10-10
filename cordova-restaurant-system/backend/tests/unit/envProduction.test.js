const { spawnSync } = require('node:child_process');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '../..');
const productionEnv = {
  ...process.env,
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://user:password@db.example.com:5432/cordovaeats',
  JWT_ACCESS_SECRET: 'a'.repeat(48),
  JWT_REFRESH_SECRET: 'b'.repeat(48),
  COOKIE_SECRET: 'c'.repeat(48),
  CLIENT_URL: 'https://cordovaeats.example.com',
  EMAIL_FROM: 'CordovaEats <help@cordovaeats.example.com>',
  RESEND_API_KEY: 're_test_config_only',
  BLOB_READ_WRITE_TOKEN: 'public-test-store-token',
  BLOB_PRIVATE_READ_WRITE_TOKEN: 'private-test-store-token',
  REQUIRE_EMAIL_VERIFICATION: 'true',
};

function bootEnv(overrides) {
  return spawnSync(process.execPath, ['-e', "const env = require('./src/config/env'); if (!env.cookie.secure) process.exit(2)"], {
    cwd: backendRoot,
    env: { ...productionEnv, ...overrides },
    encoding: 'utf8',
  });
}

test.each(['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET', 'CLIENT_URL', 'EMAIL_FROM', 'BLOB_READ_WRITE_TOKEN', 'BLOB_PRIVATE_READ_WRITE_TOKEN'])(
  'production boot rejects missing %s', (name) => {
    const result = bootEnv({ [name]: '' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Missing required production environment variable: ${name}`);
  }
);

test('production boot requires delivery, strong distinct secrets, and verified email', () => {
  expect(bootEnv({ RESEND_API_KEY: '', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' }).stderr)
    .toContain('Production email delivery requires');
  expect(bootEnv({ JWT_ACCESS_SECRET: 'short' }).stderr)
    .toContain('Production JWT and cookie secrets must be distinct');
  expect(bootEnv({ REQUIRE_EMAIL_VERIFICATION: 'false' }).stderr)
    .toContain('Email verification cannot be disabled');
  expect(bootEnv({ CLIENT_URL: 'http://cordovaeats.example.com' }).stderr)
    .toContain('Production CLIENT_URL must be an HTTPS origin');
  expect(bootEnv({ COOKIE_SECURE: 'false' }).status).toBe(0);
  expect(bootEnv({ BLOB_PRIVATE_READ_WRITE_TOKEN: productionEnv.BLOB_READ_WRITE_TOKEN }).stderr)
    .toContain('Public and private Blob stores must use different credentials');
});
