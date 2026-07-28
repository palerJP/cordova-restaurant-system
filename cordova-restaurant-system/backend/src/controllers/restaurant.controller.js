const slugify = require('../utils/slugify');
const restaurantModel = require('../models/restaurant.model');
const cuisineModel = require('../models/cuisine.model');
const analyticsModel = require('../models/analytics.model');
const imageModel = require('../models/restaurantImage.model');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const cache = require('../utils/cache');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

/** GET /api/restaurants — public browse/search/filter/sort/paginate */
const search = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await restaurantModel.search({
    searchTerm: req.query.q,
    cuisineSlugs: req.query.cuisines ? req.query.cuisines.split(',') : [],
    priceRange: req.query.priceRange,
    dietaryOptions: req.query.dietary ? req.query.dietary.split(',') : [],
    services: req.query.services ? req.query.services.split(',') : [],
    userLat: req.query.lat ? parseFloat(req.query.lat) : undefined,
    userLng: req.query.lng ? parseFloat(req.query.lng) : undefined,
    maxDistanceKm: req.query.maxDistanceKm ? parseFloat(req.query.maxDistanceKm) : undefined,
    sortBy: req.query.sortBy,
    limit,
    offset,
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

/** GET /api/restaurants/by-slug/:slug — public detail view resolved directly by slug */
const getBySlug = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.findBySlug(req.params.slug);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  restaurantModel.incrementViewCount(restaurant.id).catch(() => {});
  analyticsModel
    .logRestaurantView({ restaurantId: restaurant.id, userId: req.user?.id, source: req.query.source || 'browse' })
    .catch(() => {});

  res.json({ success: true, data: { restaurant } });
});

/** GET /api/restaurants/:id — public detail view (logs a view for analytics) */
const getById = asyncHandler(async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng) : undefined;
  const restaurant = await restaurantModel.findById(req.params.id, { userLat: lat, userLng: lng });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  // fire-and-forget view logging; don't block the response on it
  restaurantModel.incrementViewCount(restaurant.id).catch(() => {});
  analyticsModel
    .logRestaurantView({ restaurantId: restaurant.id, userId: req.user?.id, source: req.query.source || 'browse' })
    .catch(() => {});

  res.json({ success: true, data: { restaurant } });
});

/** GET /api/restaurants/mine — owner's own listings */
const listMine = asyncHandler(async (req, res) => {
  const restaurants = await restaurantModel.findByOwner(req.user.id);
  res.json({ success: true, data: restaurants });
});

/** POST /api/restaurants — owner creates a business (starts as 'pending') */
const create = asyncHandler(async (req, res) => {
  const body = req.body;
  const slugBase = slugify(body.name);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  let businessPermitUrl = null;
  if (req.file) {
    businessPermitUrl = uploadService.publicUrlFor(req.file);
  }

  let cuisineIds = [];
  if (body.cuisineSlugs?.length) {
    const cuisines = await cuisineModel.findBySlugs(body.cuisineSlugs);
    cuisineIds = cuisines.map((c) => c.id);
  }

  const restaurant = await restaurantModel.create(
    {
      ownerId: req.user.id,
      name: body.name,
      slug,
      description: body.description,
      address: body.address,
      barangay: body.barangay,
      latitude: body.latitude,
      longitude: body.longitude,
      phone: body.phone,
      email: body.email,
      priceRange: body.priceRange,
      servicesOffered: body.servicesOffered,
      businessPermitUrl,
    },
    cuisineIds,
    body.dietaryOptions || []
  );

  res.status(201).json({
    success: true,
    message: 'Business submitted for admin verification',
    data: { restaurant },
  });
});

/** PATCH /api/restaurants/:id — owner updates their own listing */
const update = asyncHandler(async (req, res) => {
  const existing = await restaurantModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Restaurant not found');
  if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not own this restaurant');
  }

  const restaurant = await restaurantModel.update(req.params.id, req.body);

  if (req.body.cuisineSlugs) {
    const cuisines = await cuisineModel.findBySlugs(req.body.cuisineSlugs);
    await restaurantModel.replaceCuisines(req.params.id, cuisines.map((c) => c.id));
  }

  res.json({ success: true, message: 'Restaurant updated', data: { restaurant } });
});

/** POST /api/restaurants/:id/cover-image — owner uploads/replaces cover photo */
const uploadCoverImage = asyncHandler(async (req, res) => {
  const existing = await restaurantModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Restaurant not found');
  if (existing.owner_id !== req.user.id) throw ApiError.forbidden('You do not own this restaurant');
  if (!req.file) throw ApiError.badRequest('No image file provided');

  const processed = await uploadService.processImage(req.file);
  const coverImageUrl = uploadService.publicUrlFor(processed);
  const restaurant = await restaurantModel.update(req.params.id, { coverImageUrl });

  res.json({ success: true, message: 'Cover image updated', data: { restaurant } });
});

/** GET /api/cuisines — lookup list for filter UIs and forms */
const listCuisines = asyncHandler(async (req, res) => {
  const cuisines = await cache.cached('cuisines:all', 5 * 60 * 1000, () => cuisineModel.listAll());
  res.json({ success: true, data: cuisines });
});

/** ---- Admin moderation ---- */

/** GET /api/admin/restaurants?status=pending */
const adminList = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await restaurantModel.search({
    status: req.query.status || 'pending',
    limit,
    offset,
    sortBy: 'newest',
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

/** PATCH /api/admin/restaurants/:id/verify */
const verify = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const restaurant = await restaurantModel.setVerificationStatus(req.params.id, {
    status,
    adminId: req.user.id,
    rejectionReason: status === 'rejected' ? rejectionReason : null,
  });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  res.json({ success: true, message: `Business ${status}`, data: { restaurant } });
});

/** PATCH /api/admin/restaurants/:id/suspend */
const suspend = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.setVerificationStatus(req.params.id, {
    status: 'suspended',
    adminId: req.user.id,
  });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  res.json({ success: true, message: 'Business suspended', data: { restaurant } });
});

/** GET /api/restaurants/:id/similar — "you might also like" section */
const getSimilar = asyncHandler(async (req, res) => {
  const similar = await restaurantModel.findSimilar(req.params.id, { limit: 4 });
  res.json({ success: true, data: similar });
});

/** GET /api/restaurants/:restaurantId/images — public gallery list */
const listImages = asyncHandler(async (req, res) => {
  const images = await imageModel.listForRestaurant(req.params.restaurantId);
  res.json({ success: true, data: images });
});

/** POST /api/restaurants/:restaurantId/images — owner adds a gallery photo */
const uploadImage = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.findById(req.params.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not own this restaurant');
  }
  if (!req.file) throw ApiError.badRequest('No image file provided');

  const processed = await uploadService.processImage(req.file, { maxWidth: 1400 });
  const imageUrl = uploadService.publicUrlFor(processed);
  const image = await imageModel.add(req.params.restaurantId, imageUrl);

  res.status(201).json({ success: true, message: 'Photo added', data: { image } });
});

/** DELETE /api/restaurants/:restaurantId/images/:imageId — owner removes a photo */
const deleteImage = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.findById(req.params.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not own this restaurant');
  }
  await imageModel.remove(req.params.imageId, req.params.restaurantId);
  res.json({ success: true, message: 'Photo removed' });
});

module.exports = {
  search, getById, getBySlug, listMine, create, update, uploadCoverImage,
  listCuisines, adminList, verify, suspend, getSimilar, listImages, uploadImage, deleteImage,
};
