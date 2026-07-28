const operatingHoursModel = require('../models/operatingHours.model');
const restaurantModel = require('../models/restaurant.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const list = asyncHandler(async (req, res) => {
  const hours = await operatingHoursModel.listForRestaurant(req.params.restaurantId);
  res.json({ success: true, data: hours });
});

/** PUT /api/restaurants/:restaurantId/hours — owner submits the full weekly schedule */
const replaceWeek = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.findById(req.params.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not manage this restaurant');
  }

  if (!Array.isArray(req.body.days) || req.body.days.length !== 7) {
    throw ApiError.badRequest('Must provide exactly 7 day entries (0=Sunday..6=Saturday)');
  }

  const hours = await operatingHoursModel.replaceWeek(req.params.restaurantId, req.body.days);
  res.json({ success: true, message: 'Operating hours updated', data: hours });
});

module.exports = { list, replaceWeek };
