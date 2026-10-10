const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const restaurantRoutes = require('./routes/restaurants.routes');
const reviewRoutes = require('./routes/reviews.routes');
const favoriteRoutes = require('./routes/favorites.routes');
const promotionRoutes = require('./routes/promotions.routes');
const cuisineRoutes = require('./routes/cuisines.routes');
const recommendationRoutes = require('./routes/recommendations.routes');
const aiProviderSettingsRoutes = require('./routes/aiProviderSettings.routes');
const adminRoutes = require('./routes/admin.routes');
const attractionRoutes = require('./routes/attractions.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// ---- Security & core middleware ----
app.set('trust proxy', 1); // needed for correct req.ip behind a reverse proxy (rate limiting, logs)
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true, // allow the refresh-token cookie to be sent
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.cookie.secret));
app.use(morgan(env.isProduction ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use('/api', apiLimiter);

// Static file serving for uploaded images/documents
const { requireAuth } = require('./middleware/auth');
const { requireRole } = require('./middleware/rbac');
app.use(['/uploads/business-permits', '/api/uploads/business-permits'], requireAuth, requireRole('admin'), (req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});
for (const directory of ['avatars', 'restaurant-images']) {
  app.use([`/uploads/${directory}`, `/api/uploads/${directory}`], express.static(path.resolve(env.upload.dir, directory)));
}
app.use(['/uploads/business-permits', '/api/uploads/business-permits'], express.static(path.resolve(env.upload.dir, 'business-permits')));

// ---- API docs ----
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- Health check ----
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/ready', async (req, res) => {
  try {
    const { query } = require('./config/db');
    const { rows } = await query('SELECT filename FROM _migrations WHERE filename = $1', ['013_disable_unclaimed_login.sql']);
    if (!rows.length) return res.status(503).json({ status: 'not_ready' });
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not_ready' });
  }
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/recommendations/provider', aiProviderSettingsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/search', searchRoutes);

// ---- 404 + centralized error handling (must be last) ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
