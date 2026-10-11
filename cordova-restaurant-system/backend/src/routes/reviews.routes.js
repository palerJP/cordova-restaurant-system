const router = require('express').Router();
const reviewController = require('../controllers/review.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const { reviewReportLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { reportReviewValidator } = require('../validators/misc.validator');
router.post('/:id/report', requireAuth, reviewReportLimiter, validate(reportReviewValidator), reviewController.report);

// Top-level by review id (edit/delete your own review, owner reply, admin moderation)
router.patch('/:id', requireAuth, requireRole('customer'), reviewController.update);
router.delete('/:id', requireAuth, requireRole('customer'), reviewController.remove);
router.post('/:id/reply', requireAuth, requireRole('owner'), reviewController.reply);
router.post('/:id/like', requireAuth, reviewController.toggleLike);
router.post('/:id/react', requireAuth, reviewController.react);

module.exports = router;
