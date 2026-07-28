const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration, login, token refresh
 */

router.post('/register', authLimiter, validate(registerValidator), controller.register);
router.post('/login', authLimiter, validate(loginValidator), controller.login);
router.post('/refresh', authLimiter, controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);
router.post('/change-password', requireAuth, validate(changePasswordValidator), controller.changePassword);

module.exports = router;
