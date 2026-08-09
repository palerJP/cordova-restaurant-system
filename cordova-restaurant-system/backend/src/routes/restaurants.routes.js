const router = require('express').Router();
const restaurantController = require('../controllers/restaurant.controller');
const menuController = require('../controllers/menu.controller');
const reviewController = require('../controllers/review.controller');
const promotionController = require('../controllers/promotion.controller');
const hoursController = require('../controllers/operatingHours.controller');
const analyticsController = require('../controllers/analytics.controller');
const favoriteController = require('../controllers/favorite.controller');

const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { uploadRestaurantImage, uploadBusinessPermit } = require('../middleware/upload');

const {
  createRestaurantValidator, updateRestaurantValidator, searchValidator,
} = require('../validators/restaurant.validator');
const {
  createReviewValidator, createMenuItemValidator, createPromotionValidator,
} = require('../validators/misc.validator');

// ---- Public browse/search ----
router.get('/', validate(searchValidator), restaurantController.search);
router.get('/mine', requireAuth, requireRole('owner', 'admin'), restaurantController.listMine);
router.get('/by-slug/:slug', optionalAuth, restaurantController.getBySlug);
router.get('/:id/similar', restaurantController.getSimilar);
router.get('/:id', optionalAuth, restaurantController.getById);

// ---- Owner: create/update business ----
router.post(
  '/',
  requireAuth,
  requireRole('owner'),
  uploadBusinessPermit.single('businessPermit'),
  validate(createRestaurantValidator),
  restaurantController.create
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('owner', 'admin'),
  validate(updateRestaurantValidator),
  restaurantController.update
);
router.post(
  '/:id/cover-image',
  requireAuth,
  requireRole('owner', 'admin'),
  uploadRestaurantImage.single('image'),
  restaurantController.uploadCoverImage
);

// ---- Menu (nested) ----
router.get('/:restaurantId/menu', menuController.listMenu);
router.post('/:restaurantId/menu/categories', requireAuth, requireRole('owner', 'admin'), menuController.createCategory);
router.delete('/:restaurantId/menu/categories/:categoryId', requireAuth, requireRole('owner', 'admin'), menuController.deleteCategory);
router.post(
  '/:restaurantId/menu/items',
  requireAuth,
  requireRole('owner', 'admin'),
  uploadRestaurantImage.single('image'),
  validate(createMenuItemValidator),
  menuController.createItem
);
router.patch(
  '/:restaurantId/menu/items/:itemId',
  requireAuth,
  requireRole('owner', 'admin'),
  uploadRestaurantImage.single('image'),
  menuController.updateItem
);
router.delete('/:restaurantId/menu/items/:itemId', requireAuth, requireRole('owner', 'admin'), menuController.deleteItem);

// ---- Reviews (nested) ----
router.get('/:restaurantId/reviews', optionalAuth, reviewController.listForRestaurant);
router.post(
  '/:restaurantId/reviews',
  requireAuth,
  requireRole('customer'),
  validate(createReviewValidator),
  reviewController.create
);

// ---- Promotions (nested) ----
router.get('/:restaurantId/promotions', promotionController.listForRestaurant);
router.post(
  '/:restaurantId/promotions',
  requireAuth,
  requireRole('owner', 'admin'),
  uploadRestaurantImage.single('image'),
  validate(createPromotionValidator),
  promotionController.create
);
router.patch(
  '/:restaurantId/promotions/:id',
  requireAuth,
  requireRole('owner', 'admin'),
  uploadRestaurantImage.single('image'),
  promotionController.update
);
router.delete('/:restaurantId/promotions/:id', requireAuth, requireRole('owner', 'admin'), promotionController.remove);

// ---- Operating hours (nested) ----
router.get('/:restaurantId/hours', hoursController.list);
router.put('/:restaurantId/hours', requireAuth, requireRole('owner', 'admin'), hoursController.replaceWeek);

// ---- Owner analytics (nested) ----
router.get('/:restaurantId/analytics', requireAuth, requireRole('owner', 'admin'), analyticsController.ownerStats);

// ---- Favorites (nested action on a restaurant) ----
router.post('/:restaurantId/favorite', requireAuth, requireRole('customer'), favoriteController.add);
router.delete('/:restaurantId/favorite', requireAuth, requireRole('customer'), favoriteController.remove);

// ---- Photo gallery (nested) ----
router.get('/:restaurantId/images', restaurantController.listImages);
router.post(
  '/:restaurantId/images',
  requireAuth,
  requireRole('owner', 'admin'),
  uploadRestaurantImage.single('image'),
  restaurantController.uploadImage
);
router.delete('/:restaurantId/images/:imageId', requireAuth, requireRole('owner', 'admin'), restaurantController.deleteImage);

module.exports = router;
