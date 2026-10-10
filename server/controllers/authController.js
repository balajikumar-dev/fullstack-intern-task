const authService = require('../services/authService');

async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json(authService.sessionFor(user, req.app.locals.config.jwtSecret));
}

async function login(req, res) {
  const user = await authService.login(req.body);
  res.json(authService.sessionFor(user, req.app.locals.config.jwtSecret));
}

function me(req, res) {
  res.json({ user: authService.publicUser(req.user) });
}

module.exports = { register, login, me };
