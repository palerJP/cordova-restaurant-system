const slugify = require('../utils/slugify');
const restaurantModel = require('../models/restaurant.model');
const userModel = require('../models/user.model');
const cuisineModel = require('../models/cuisine.model');
const analyticsModel = require('../models/analytics.model');
const imageModel = require('../models/restaurantImage.model');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { query } = require('../config/db');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const { syncToRestaurantTs, removeFromRestaurantTs, getDefaultCoverImage, inferCategory } = require('../services/restaurantSync.service');

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
  let coverImageUrl = body.coverImageUrl || body.logoUrl || body.imageUrl || null;

  if (req.files) {
    if (req.files.businessPermit && req.files.businessPermit[0]) {
      businessPermitUrl = uploadService.publicUrlFor(req.files.businessPermit[0]);
    }
    const imgFile =
      (req.files.image && req.files.image[0]) ||
      (req.files.logo && req.files.logo[0]) ||
      (req.files.coverImage && req.files.coverImage[0]);
    if (imgFile) {
      coverImageUrl = uploadService.publicUrlFor(imgFile);
    }
  } else if (req.file) {
    if (req.file.fieldname === 'businessPermit') {
      businessPermitUrl = uploadService.publicUrlFor(req.file);
    } else {
      coverImageUrl = uploadService.publicUrlFor(req.file);
    }
  }

  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val ? [val] : [];
      }
    }
    return [];
  };

  const cuisineSlugs = toArray(body.cuisineSlugs);
  const dietaryOptions = toArray(body.dietaryOptions);
  const servicesOffered = toArray(body.servicesOffered);

  let cuisineIds = [];
  if (cuisineSlugs.length) {
    const cuisines = await cuisineModel.findBySlugs(cuisineSlugs);
    cuisineIds = cuisines.map((c) => c.id);
  }

  if (!coverImageUrl || coverImageUrl.trim() === '') {
    const cat = inferCategory(body.name, body.description, cuisineSlugs);
    coverImageUrl = getDefaultCoverImage(body.name, body.description, cat);
  }

  const restaurant = await restaurantModel.create(
    {
      ownerId: req.user.id,
      name: body.name,
      slug,
      description: body.description || null,
      address: body.address,
      barangay: body.barangay || null,
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      phone: body.phone || null,
      email: body.email || null,
      priceRange: body.priceRange || 'moderate',
      servicesOffered: servicesOffered.length ? servicesOffered : ['dine_in'],
      businessPermitUrl,
      coverImageUrl,
      status: 'pending',
    },
    cuisineIds,
    dietaryOptions
  );

  // If a customer registers a business, promote them to 'owner' role
  if (req.user.role === 'customer') {
    await userModel.updateRole(req.user.id, 'owner');
  }

  res.status(201).json({
    success: true,
    message: 'Business registered successfully! Submitted for municipal admin verification.',
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

  if (restaurant.status === 'verified') {
    syncToRestaurantTs(restaurant);
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

  if (restaurant.status === 'verified') {
    syncToRestaurantTs(restaurant);
  }

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
  let restaurant = await restaurantModel.setVerificationStatus(req.params.id, {
    status,
    adminId: req.user.id,
    rejectionReason: status === 'rejected' ? rejectionReason : null,
  });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  if (status === 'verified') {
    if (!restaurant.cover_image_url || restaurant.cover_image_url.trim() === '') {
      const cat = inferCategory(restaurant.name, restaurant.description);
      const defaultCover = getDefaultCoverImage(restaurant.name, restaurant.description, cat);
      await restaurantModel.update(restaurant.id, { coverImageUrl: defaultCover });
      restaurant.cover_image_url = defaultCover;
    }
    syncToRestaurantTs(restaurant);
  } else if (status === 'rejected' || status === 'suspended') {
    removeFromRestaurantTs(restaurant);
  }

  res.json({ success: true, message: `Business ${status}`, data: { restaurant } });
});

/** PATCH /api/admin/restaurants/:id/suspend */
const suspend = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.setVerificationStatus(req.params.id, {
    status: 'suspended',
    adminId: req.user.id,
  });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  removeFromRestaurantTs(restaurant);
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

/** GET /api/restaurants/:id/subscription — owner or admin gets subscription & payment history */
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const existing = await restaurantModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Restaurant not found');
  if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not own this restaurant');
  }

  const { rows: txRows } = await query(
    `SELECT * FROM subscription_transactions 
     WHERE restaurant_id = $1 
     ORDER BY created_at DESC 
     LIMIT 5`,
    [req.params.id]
  );

  res.json({
    success: true,
    data: {
      current_tier: existing.subscription_tier || 'none',
      subscription_expires_at: existing.subscription_expires_at,
      transactions: txRows,
      pending_transaction: txRows.find((t) => t.status === 'pending_verification') || null,
    },
  });
});

/** PATCH /api/restaurants/:id/subscription — owner or admin updates subscription tier */
const updateSubscription = asyncHandler(async (req, res) => {
  const existing = await restaurantModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Restaurant not found');
  if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not own this restaurant');
  }

  const { subscription_tier, subscription_expires_at, durationDays = 30, payment_method = 'gcash', payment_reference, referenceNo } = req.body;
  const validTiers = ['none', 'basic', 'premium', 'featured'];
  const tier = (subscription_tier || 'none').toLowerCase();

  if (!validTiers.includes(tier)) {
    throw ApiError.badRequest(`Invalid subscription tier. Must be one of: ${validTiers.join(', ')}`);
  }

  const isAdmin = req.user.role === 'admin';
  const ref = (payment_reference || referenceNo || '').trim();

  // If downgrading to free tier
  if (tier === 'none') {
    const updated = await restaurantModel.updateSubscription(req.params.id, {
      tier: 'none',
      expiresAt: null,
    });
    return res.json({
      success: true,
      data: updated,
      message: 'Downgraded to free plan successfully',
    });
  }

  // If Admin is making the change, immediately activate
  if (isAdmin) {
    let expiresAt = null;
    if (subscription_expires_at) {
      expiresAt = new Date(subscription_expires_at).toISOString();
    } else {
      const d = new Date();
      d.setDate(d.getDate() + Number(durationDays || 30));
      expiresAt = d.toISOString();
    }

    const updated = await restaurantModel.updateSubscription(req.params.id, {
      tier,
      expiresAt,
    });

    if (ref) {
      const tierPrices = {
        basic: '₱499 / month',
        premium: '₱999 / month',
        featured: '₱1,999 / month',
      };
      await query(
        `INSERT INTO subscription_transactions (restaurant_id, tier, price, payment_method, payment_reference, status, verified_at, verified_by, expires_at, duration_days)
         VALUES ($1, $2, $3, $4, $5, 'verified', NOW(), $6, $7, $8)`,
        [req.params.id, tier, tierPrices[tier] || '₱0', payment_method, ref, req.user.id, expiresAt, durationDays]
      );
    }

    return res.json({
      success: true,
      data: updated,
      message: 'Subscription updated and activated successfully',
    });
  }

  // If Owner is requesting a paid tier, require transaction reference and create pending transaction
  if (!ref) {
    throw ApiError.badRequest('Please enter your GCash / Maya transaction or reference number');
  }

  const tierPrices = {
    basic: '₱499 / month',
    premium: '₱999 / month',
    featured: '₱1,999 / month',
  };

  const { rows: txRows } = await query(
    `INSERT INTO subscription_transactions (restaurant_id, tier, price, payment_method, payment_reference, status, duration_days)
     VALUES ($1, $2, $3, $4, $5, 'pending_verification', $6)
     RETURNING *`,
    [req.params.id, tier, tierPrices[tier] || '₱0', payment_method, ref, durationDays]
  );

  res.json({
    success: true,
    data: {
      pending: true,
      transaction: txRows[0],
      current_tier: existing.subscription_tier || 'none',
      requested_tier: tier,
    },
    message: 'Subscription payment submitted! Awaiting administrator verification.',
  });
});

/** DELETE /api/admin/restaurants/:id — admin permanently removes an establishment */
const adminDelete = asyncHandler(async (req, res) => {
  const existing = await restaurantModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Restaurant not found');

  await restaurantModel.remove(req.params.id);
  removeFromRestaurantTs(existing);
  res.json({
    success: true,
    message: 'Establishment has been permanently removed from the system',
  });
});

module.exports = {
  search, getById, getBySlug, listMine, create, update, uploadCoverImage,
  listCuisines, adminList, verify, suspend, adminDelete, getSimilar, listImages, uploadImage, deleteImage,
  updateSubscription, getSubscriptionStatus,
};

