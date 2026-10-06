const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const controller = require('../controllers/aiProviderSettings.controller');

router.use(requireAuth, requireRole('admin'));
router.get('/', controller.getStatus);
router.patch('/', controller.saveSettings);
router.post('/test', controller.testConnection);

module.exports = router;
