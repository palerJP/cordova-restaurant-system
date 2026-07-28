const analyticsModel = require('../models/analytics.model');
const restaurantModel = require('../models/restaurant.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

/** GET /api/restaurants/:restaurantId/analytics — owner's own business analytics */
const ownerStats = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.findById(req.params.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not manage this restaurant');
  }

  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const stats = await analyticsModel.ownerRestaurantStats(req.params.restaurantId, { days });
  res.json({ success: true, data: stats });
});

/** GET /api/admin/analytics/overview — system-wide dashboard */
const adminOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsModel.adminOverview();
  res.json({ success: true, data: overview });
});

module.exports = { ownerStats, adminOverview };
