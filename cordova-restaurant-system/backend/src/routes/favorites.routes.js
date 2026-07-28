const router = require('express').Router();
const favoriteController = require('../controllers/favorite.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', requireAuth, requireRole('customer'), favoriteController.list);

module.exports = router;
