const router = require('express').Router();
const controller = require('../controllers/templateController');

router.get('/', controller.list);
router.get('/:id', controller.detail);

module.exports = router;
