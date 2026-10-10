/**
 * Loads database/seed.sql and the supplied Entoy menu for local demo data.
 * Safe to re-run: seed.sql uses ON CONFLICT DO NOTHING throughout.
 * Intended for local development / demo environments only.
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { seedEntoysMenu } = require('./seed_entoys_menu');
const logger = require('../utils/logger');

const SEED_FILE = path.join(__dirname, '../../../database/seed.sql');

async function run() {
  if (require('../config/env').isProduction) throw new Error('Demo seeding is disabled in production');
  const sql = fs.readFileSync(SEED_FILE, 'utf8');
  logger.info('Applying seed data...');
  await pool.query(sql);
  await seedEntoysMenu();
  logger.info('Seed data applied successfully.');
  logger.info('Demo login: admin@cordova-restaurants.gov.ph / Password123!');
  await pool.end();
}

run().catch((err) => {
  logger.error('Seeding failed', { error: err.message });
  process.exit(1);
});
