const { pool } = require('../config/db');
const { hashPassword } = require('../utils/password');

async function run() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set a valid ADMIN_EMAIL');
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters, uppercase, lowercase, and a number');
  }
  const hash = await hashPassword(password);
  const result = await pool.query(`INSERT INTO users (email, password_hash, full_name, role, email_verified, email_verified_at)
    VALUES ($1,$2,'System Administrator','admin',TRUE,NOW()) ON CONFLICT (email) DO NOTHING RETURNING id`, [email, hash]);
  if (!result.rows.length) throw new Error('An account already uses that email; no existing account was changed');
  console.log('Admin account created. Remove ADMIN_PASSWORD from the environment now.');
}
run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
