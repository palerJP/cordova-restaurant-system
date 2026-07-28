const { body, param } = require('express-validator');

const createReviewValidator = [
  param('restaurantId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
];

const moderateReviewValidator = [
  param('id').isUUID(),
  body('status').isIn(['visible', 'flagged', 'removed']),
  body('flaggedReason').if(body('status').equals('flagged')).notEmpty(),
];

const createMenuItemValidator = [
  param('restaurantId').isUUID(),
  body('name').trim().isLength({ min: 1, max: 150 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isUUID(),
  body('dietaryTags').optional().isArray(),
];

const createPromotionValidator = [
  param('restaurantId').isUUID(),
  body('title').trim().isLength({ min: 2, max: 150 }),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
    .custom((end, { req }) => new Date(end) >= new Date(req.body.startDate))
    .withMessage('End date must be on or after start date'),
];

const recommendationValidator = [
  body('preferredCuisines').optional().isArray(),
  body('budgetRange').optional().isIn(['budget', 'moderate', 'expensive', 'premium']),
  body('dietaryRestrictions').optional().isArray(),
  body('requiredServices').optional().isArray(),
  body('lat').optional().isFloat({ min: -90, max: 90 }),
  body('lng').optional().isFloat({ min: -180, max: 180 }),
  body('maxDistanceKm').optional().isFloat({ min: 0.1, max: 50 }),
  body('onlyOpenNow').optional().isBoolean(),
];

const updateWeightsValidator = [
  body('cuisineWeight').isFloat({ min: 0, max: 1 }),
  body('budgetWeight').isFloat({ min: 0, max: 1 }),
  body('proximityWeight').isFloat({ min: 0, max: 1 }),
  body('dietaryWeight').isFloat({ min: 0, max: 1 }),
  body('ratingWeight').isFloat({ min: 0, max: 1 }),
];

module.exports = {
  createReviewValidator,
  moderateReviewValidator,
  createMenuItemValidator,
  createPromotionValidator,
  recommendationValidator,
  updateWeightsValidator,
};
