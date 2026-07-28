/**
 * Loads database/seed.sql — demo users, restaurants, menus, reviews.
 * Safe to re-run: seed.sql uses ON CONFLICT DO NOTHING throughout.
 * Intended for local development / demo environments only.
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');

const SEED_FILE = path.join(__dirname, '../../../database/seed.sql');

async function run() {
  const sql = fs.readFileSync(SEED_FILE, 'utf8');
  logger.info('Applying seed data...');
  await pool.query(sql);
  logger.info('Seed data applied successfully.');
  logger.info('Demo login: admin@cordova-restaurants.gov.ph / Password123!');
  await pool.end();
}

run().catch((err) => {
  logger.error('Seeding failed', { error: err.message });
  process.exit(1);
});
