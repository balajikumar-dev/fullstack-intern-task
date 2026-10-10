require('./config/env');

const mongoose = require('mongoose');
const { createApp } = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const Template = require('./models/Template');
const Favorite = require('./models/Favorite');

async function startServer() {
  const app = createApp();
  await connectDB();
  await Promise.all([User.init(), Template.init(), Favorite.init()]);
  const port = process.env.PORT || 5000;
  const server = await new Promise((resolve, reject) => {
    const listening = app.listen(port, () => resolve(listening));
    listening.once('error', reject);
  });
  console.log(`Mini SaaS Template Store API is running on port ${port}`);

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    server.close(async () => {
      await mongoose.disconnect();
      process.exitCode = 0;
    });
  };
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, shutdown);
  return server;
}

async function main() {
  return startServer().catch(async (error) => {
    const configurationError = /^(JWT_SECRET|CLIENT_ORIGIN|TRUST_PROXY|MONGO_URI)/.test(
      error.message,
    );
    console.error(
      configurationError
        ? error.message
        : 'Server startup failed. Check MongoDB, MONGO_URI, and that PORT is available.',
    );
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

if (require.main === module) main();

module.exports = { startServer, createApp, main };
