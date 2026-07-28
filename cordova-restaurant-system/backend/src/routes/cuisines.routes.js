const router = require('express').Router();
const restaurantController = require('../controllers/restaurant.controller');

router.get('/', restaurantController.listCuisines);

module.exports = router;
