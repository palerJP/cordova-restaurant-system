const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { pool } = require('./config/db');

const server = app.listen(env.port, () => {
  logger.info(`Cordova Restaurant API listening on port ${env.port} [${env.nodeEnv}]`);
  logger.info(`API docs available at http://localhost:${env.port}/api/docs`);
});

/** Graceful shutdown — finish in-flight requests, close the DB pool, then exit. */
function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    logger.info('Shutdown complete.');
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
