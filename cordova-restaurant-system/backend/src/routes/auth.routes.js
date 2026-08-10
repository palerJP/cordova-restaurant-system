const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/auth.validator');

router.post('/register', authLimiter, validate(registerValidator), controller.register);
router.post('/login', authLimiter, validate(loginValidator), controller.login);
router.get('/verify-email', controller.verifyEmail);
router.post('/verify-email', controller.verifyEmail);
router.post('/resend-verification', requireAuth, authLimiter, controller.resendVerification);

router.post('/forgot-password', authLimiter, controller.forgotPassword);
router.post('/reset-password', authLimiter, controller.resetPassword);

router.post('/google', authLimiter, controller.googleOAuth);
router.post('/facebook', authLimiter, controller.facebookOAuth);

router.post('/refresh', authLimiter, controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);
router.post('/change-password', requireAuth, validate(changePasswordValidator), controller.changePassword);

module.exports = router;
