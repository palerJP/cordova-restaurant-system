const router = require('express').Router();
const controller = require('../controllers/recommendation.controller');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { recommendationValidator, updateWeightsValidator } = require('../validators/misc.validator');

// Guests AND logged-in users can request recommendations (guests must
// supply constraints in the body since they have no saved preferences).
router.post('/', optionalAuth, validate(recommendationValidator), controller.getRecommendations);

// Logged-in users: view their own past AI recommendation search history
router.get('/history', requireAuth, controller.getHistory);

// Admin: "Update AI Model" use case — view/tune the scoring weights
router.get('/weights', requireAuth, requireRole('admin'), controller.getWeights);
router.patch('/weights', requireAuth, requireRole('admin'), validate(updateWeightsValidator), controller.updateWeights);

module.exports = router;
