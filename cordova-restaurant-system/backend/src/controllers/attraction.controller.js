const attractionModel = require('../models/attraction.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const cache = require('../utils/cache');

/** GET /api/attractions/nearby?lat=&lng=&radiusKm= */
const getNearby = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw ApiError.badRequest('lat and lng query parameters are required');
  }
  const radiusKm = req.query.radiusKm ? parseFloat(req.query.radiusKm) : 10;
  const attractions = await attractionModel.findNearby({ lat, lng, radiusKm, limit: 5 });
  res.json({ success: true, data: attractions });
});

/** GET /api/attractions — full list */
const listAll = asyncHandler(async (req, res) => {
  const attractions = await cache.cached('attractions:all', 5 * 60 * 1000, () => attractionModel.listAll());
  res.json({ success: true, data: attractions });
});

module.exports = { getNearby, listAll };
