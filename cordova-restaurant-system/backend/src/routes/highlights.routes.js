const router = require('express').Router();
const controller = require('../controllers/highlight.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadHighlightImages } = require('../middleware/upload');

router.get('/mine', requireAuth, requireRole('customer'), controller.mine);
router.get('/images/:imageId', optionalAuth, controller.image);
router.patch('/:id', requireAuth, requireRole('customer'), uploadHighlightImages.array('photos', 5), controller.update);
router.delete('/:id', requireAuth, requireRole('customer'), controller.remove);

module.exports = router;
