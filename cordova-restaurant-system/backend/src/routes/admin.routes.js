const router = require('express').Router();
const restaurantController = require('../controllers/restaurant.controller');
const reviewController = require('../controllers/review.controller');
const analyticsController = require('../controllers/analytics.controller');
const userController = require('../controllers/user.controller');
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

// User account management
router.get('/users', userController.listUsers);
router.patch('/users/:id/active', userController.setUserActive);

// Content & review moderation
router.get('/reviews/flagged', reviewController.listFlagged);
router.patch('/reviews/:id/moderate', validate(moderateReviewValidator), reviewController.moderate);

// System-wide analytics reports, cuisine demand & peak search trends
router.get('/analytics/overview', analyticsController.adminOverview);

module.exports = router;
