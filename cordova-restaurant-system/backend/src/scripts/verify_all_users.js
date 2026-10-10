const { pool } = require('../config/db');

async function verifyAllUsers() {
  if (require('../config/env').isProduction) throw new Error('Bulk verification is disabled in production');
  console.log('🔧 Updating all users to email_verified = true in database...');
  try {
    const result = await pool.query(`
      UPDATE users 
      SET email_verified = TRUE, 
          email_verified_at = COALESCE(email_verified_at, NOW())
      WHERE email_verified = FALSE OR email_verified IS NULL
      RETURNING id, email, full_name, role;
    `);

    console.log(`✅ Successfully verified ${result.rowCount} user(s):`);
    result.rows.forEach((user) => {
      console.log(`   - [${user.role}] ${user.email} (${user.full_name})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update users:', err);
    process.exit(1);
  }
}

verifyAllUsers();
