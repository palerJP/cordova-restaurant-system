const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  body('fullName').trim().isLength({ min: 2, max: 150 }).withMessage('Full name is required'),
  body('role').optional().isIn(['customer', 'owner']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain a number'),
];

module.exports = { registerValidator, loginValidator, changePasswordValidator };
