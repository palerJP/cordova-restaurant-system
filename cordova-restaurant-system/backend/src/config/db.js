const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: env.db.url,
  max: env.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // Unexpected errors on idle clients (e.g. connection dropped by the DB) —
  // log and let the process supervisor decide whether to restart.
  logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

/**
 * Run a single query. Prefer this for simple reads/writes.
 * @param {string} text - parameterized SQL
 * @param {Array} params
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 200) {
    logger.warn('Slow query', { text, duration, rows: result.rowCount });
  }
  return result;
}

/**
 * Run a callback inside a database transaction. Automatically
 * commits on success and rolls back on any thrown error.
 * @param {(client: import('pg').PoolClient) => Promise<any>} callback
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
