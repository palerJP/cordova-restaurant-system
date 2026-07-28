const router = require('express').Router();
const controller = require('../controllers/attraction.controller');

router.get('/nearby', controller.getNearby);
router.get('/', controller.listAll);

module.exports = router;
