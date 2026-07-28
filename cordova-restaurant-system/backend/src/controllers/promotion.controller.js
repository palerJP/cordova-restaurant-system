const promotionModel = require('../models/promotion.model');
const restaurantModel = require('../models/restaurant.model');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

async function assertOwnership(restaurantId, userId, userRole) {
  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You do not manage this restaurant');
  }
}

/** GET /api/promotions — public feed of currently active promos */
const listActive = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await promotionModel.listActive({ limit, offset });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

const listForRestaurant = asyncHandler(async (req, res) => {
  const promotions = await promotionModel.listForRestaurant(req.params.restaurantId);
  res.json({ success: true, data: promotions });
});

const create = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);

  let imageUrl;
  if (req.file) {
    const processed = await uploadService.processImage(req.file, { maxWidth: 1000 });
    imageUrl = uploadService.publicUrlFor(processed);
  }

  const promotion = await promotionModel.create(req.params.restaurantId, {
    ...req.body,
    imageUrl,
    status: req.body.publish ? 'active' : 'draft',
  });
  res.status(201).json({ success: true, message: 'Promotion created', data: { promotion } });
});

const update = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);
  const promotion = await promotionModel.update(req.params.id, req.params.restaurantId, req.body);
  if (!promotion) throw ApiError.notFound('Promotion not found');
  res.json({ success: true, message: 'Promotion updated', data: { promotion } });
});

const remove = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);
  await promotionModel.remove(req.params.id, req.params.restaurantId);
  res.json({ success: true, message: 'Promotion deleted' });
});

module.exports = { listActive, listForRestaurant, create, update, remove };
