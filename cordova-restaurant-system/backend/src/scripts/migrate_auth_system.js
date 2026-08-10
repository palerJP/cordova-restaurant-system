const { pool } = require('../config/db');

async function migrateAuthSchema() {
  console.log('🚀 Starting Auth System Schema Migration...');

  try {
    // 1. Update users table with verification and OAuth columns
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log('✅ Updated users table columns (email_verified, google_id, facebook_id, avatar_url)');

    // 2. Create email_verification_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_email_verification_token_hash ON email_verification_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id);
    `);
    console.log('✅ Created email_verification_tokens table and indexes');

    // 3. Create password_reset_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id);
    `);
    console.log('✅ Created password_reset_tokens table and indexes');

    // 4. Create oauth_accounts table for safe account linking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
    `);
    console.log('✅ Created oauth_accounts table');

    console.log('🎉 Auth System Migration Complete Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateAuthSchema();
