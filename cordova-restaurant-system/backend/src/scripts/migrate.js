/**
 * Simple, dependency-free migration runner: applies every .sql file in
 * database/migrations/ in filename order, tracked in a `_migrations` table
 * so re-running the script only applies new files.
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');

const MIGRATIONS_DIR = path.join(__dirname, '../../../database/migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function getAppliedMigrations() {
  const { rows } = await pool.query(`SELECT filename FROM _migrations`);
  return new Set(rows.map((r) => r.filename));
}

async function run() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      logger.info(`Skipping already-applied migration: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    logger.info(`Applying migration: ${file}`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file]);
      await client.query('COMMIT');
      logger.info(`Applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`Migration failed: ${file}`, { error: err.message });
      throw err;
    } finally {
      client.release();
    }
  }

  logger.info('All migrations applied.');
  await pool.end();
}

run().catch((err) => {
  logger.error('Migration run failed', { error: err.message });
  process.exit(1);
});
