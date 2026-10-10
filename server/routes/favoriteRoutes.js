const router = require('express').Router();
const controller = require('../controllers/favoriteController');
const requireAuth = require('../middleware/authMiddleware');

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(requireAuth);
router.get('/', controller.list);
router.post('/:templateId', controller.add);
router.delete('/:templateId', controller.remove);

module.exports = router;
