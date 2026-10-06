const router = require('express').Router();
const controller = require('../controllers/recommendation.controller');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  recommendationValidator,
  recommendationFeedbackValidator,
  updateWeightsValidator,
} = require('../validators/misc.validator');

// Admin preview does not create customer history or training feedback.
router.post('/preview', requireAuth, requireRole('admin'), validate(recommendationValidator), controller.previewRecommendations);

// Guests AND logged-in users can request recommendations (guests must
// supply constraints in the body since they have no saved preferences).
router.post('/', optionalAuth, validate(recommendationValidator), controller.getRecommendations);

// Customers can rate recommendations; these labels train their personal ranker.
router.post(
  '/feedback',
  requireAuth,
  requireRole('customer'),
  validate(recommendationFeedbackValidator),
  controller.saveFeedback
);

// Logged-in users: view their own past AI recommendation search history
router.get('/history', requireAuth, controller.getHistory);
router.delete('/history', requireAuth, controller.clearHistory);
router.delete('/history/:id', requireAuth, controller.deleteHistoryItem);

// Admin: "Update AI Model" use case — view/tune the scoring weights
router.get('/weights', requireAuth, requireRole('admin'), controller.getWeights);
router.patch('/weights', requireAuth, requireRole('admin'), validate(updateWeightsValidator), controller.updateWeights);

// Admin: inspect global ML training data and manually train a new version.
router.get('/training', requireAuth, requireRole('admin'), controller.getTrainingStatus);
router.post('/training', requireAuth, requireRole('admin'), controller.trainModel);

module.exports = router;
