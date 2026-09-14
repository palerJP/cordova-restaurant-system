const router = require('express').Router();
const restaurantController = require('../controllers/restaurant.controller');
const reviewController = require('../controllers/review.controller');
const analyticsController = require('../controllers/analytics.controller');
const userController = require('../controllers/user.controller');
const promotionController = require('../controllers/promotion.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { verifyBusinessValidator } = require('../validators/restaurant.validator');
const { moderateReviewValidator } = require('../validators/misc.validator');

router.use(requireAuth, requireRole('admin'));

// Business permit & registration verification
router.get('/restaurants', restaurantController.adminList);
router.patch('/restaurants/:id/verify', validate(verifyBusinessValidator), restaurantController.verify);
router.patch('/restaurants/:id/suspend', restaurantController.suspend);
router.delete('/restaurants/:id', restaurantController.adminDelete);

// User account management
router.get('/users', userController.listUsers);
router.patch('/users/:id/active', userController.setUserActive);
router.delete('/users/:id', userController.deleteUser);

// Content & review moderation
router.get('/reviews', reviewController.listAdminReviews);
router.get('/reviews/flagged', reviewController.listFlagged);
router.patch('/reviews/:id/moderate', validate(moderateReviewValidator), reviewController.moderate);

// Promotions moderation & management
router.get('/promotions', promotionController.adminList);
router.patch('/promotions/:id/status', promotionController.adminUpdateStatus);
router.delete('/promotions/:id', promotionController.adminDelete);

// Subscription & ranking boost transactions
router.get('/subscription-transactions', promotionController.adminListSubscriptionTransactions);
router.patch('/subscription-transactions/:id/status', promotionController.adminUpdateSubscriptionTransactionStatus);
router.delete('/subscription-transactions/:id', promotionController.adminDeleteSubscriptionTransaction);

// System-wide analytics reports, cuisine demand & peak search trends
router.get('/analytics/overview', analyticsController.adminOverview);

module.exports = router;
