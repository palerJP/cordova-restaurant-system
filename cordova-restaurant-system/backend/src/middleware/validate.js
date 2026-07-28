const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Runs an array of express-validator chains, then rejects with a 400 and
 * a field-level details array if any failed. Usage:
 *   router.post('/x', validate([body('email').isEmail(), ...]), controller)
 */
function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
    next(ApiError.badRequest('Validation failed', details));
  };
}

module.exports = validate;
