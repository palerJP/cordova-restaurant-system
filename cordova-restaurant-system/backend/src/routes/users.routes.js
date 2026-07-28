const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadAvatar } = require('../middleware/upload');

router.get('/me', requireAuth, controller.getProfile);
router.patch('/me', requireAuth, uploadAvatar.single('avatar'), controller.updateProfile);
router.get('/me/preferences', requireAuth, controller.getPreferences);
router.put('/me/preferences', requireAuth, controller.updatePreferences);

// Admin: user account management
router.get('/', requireAuth, requireRole('admin'), controller.listUsers);
router.patch('/:id/active', requireAuth, requireRole('admin'), controller.setUserActive);

module.exports = router;
