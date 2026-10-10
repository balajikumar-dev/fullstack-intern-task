const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const getRuntimeConfig = require('./config/runtime');
const HttpError = require('./utils/HttpError');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

function createApp() {
  const app = express();
  const config = getRuntimeConfig();
  app.locals.config = config;
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.origins.includes(origin)) return callback(null, true);
        return callback(new HttpError(403, 'This origin is not allowed.'));
      },
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '16kb' }));
  app.use(
    '/previews',
    express.static(path.join(__dirname, 'public', 'previews'), { maxAge: '1d', dotfiles: 'deny' }),
  );
  app.get('/', (_req, res) => {
    res.json({ status: 'running', message: 'Mini SaaS Template Store API is running' });
  });
  app.get('/health', (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res
      .status(connected ? 200 : 503)
      .json({
        status: connected ? 'ok' : 'unavailable',
        database: connected ? 'connected' : 'disconnected',
      });
  });
  app.use('/api/auth', require('./routes/authRoutes')());
  app.use('/api/templates', require('./routes/templateRoutes'));
  app.use('/api/favorites', require('./routes/favoriteRoutes'));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
