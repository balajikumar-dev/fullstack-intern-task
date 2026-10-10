const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

async function requireAuth(req, _res, next) {
  const header = req.get('authorization');
  if (typeof header !== 'string' || !/^Bearer \S+$/.test(header)) {
    throw new HttpError(401, 'Please sign in to continue.');
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), req.app.locals.config.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'forma-api',
      audience: 'forma-client',
    });
    if (typeof payload !== 'object' || !mongoose.isObjectIdOrHexString(payload.sub)) {
      throw new Error('Invalid token subject');
    }
  } catch {
    throw new HttpError(401, 'Your session is invalid or expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Please sign in again.');
  req.user = user;
  next();
}

module.exports = requireAuth;
