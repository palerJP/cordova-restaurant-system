const router = require('express').Router();
const promotionController = require('../controllers/promotion.controller');

router.get('/', promotionController.listActive);

module.exports = router;
