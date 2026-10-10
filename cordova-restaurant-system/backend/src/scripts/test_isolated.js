const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const env = require('../config/env');

async function run() {
  const source = new URL(env.db.url);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(source.hostname) || env.isProduction) {
    throw new Error('Isolated test runner only supports a local development database');
  }
  const name = `cordova_test_${crypto.randomBytes(8).toString('hex')}`;
  const admin = new Pool({ connectionString: source.toString() });
  let created = false;
  try {
    await admin.query(`CREATE DATABASE "${name}"`);
    created = true;
    source.pathname = `/${name}`;
    const childEnv = { ...process.env, NODE_ENV: 'test', DATABASE_URL: source.toString(), REQUIRE_EMAIL_VERIFICATION: 'false', AUTH_RATE_LIMIT_MAX: '1000', GROQ_API_KEY: '', RESEND_API_KEY: '', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' };
    for (const args of [['src/scripts/migrate.js'], ['node_modules/jest/bin/jest.js', '--runInBand', '--silent', '--forceExit']]) {
      const result = spawnSync(process.execPath, args, { cwd: require('node:path').resolve(__dirname, '../..'), env: childEnv, stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`Verification exited with status ${result.status}`);
    }
  } finally {
    if (created) {
      if (!/^cordova_test_[0-9a-f]{16}$/.test(name)) throw new Error('Unsafe test database name');
      await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    }
    await admin.end();
  }
}
run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
