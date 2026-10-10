const express = require('express');
const { rateLimit } = require('express-rate-limit');
const controller = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');

function authRoutes() {
  const router = express.Router();
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { message: 'Too many sign-in attempts. Please try again in 15 minutes.' },
  });
  router.post('/register', authLimiter, controller.register);
  router.post('/login', authLimiter, controller.login);
  router.get('/me', requireAuth, controller.me);
  return router;
}

module.exports = authRoutes;
