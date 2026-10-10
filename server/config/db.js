const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is required. Create server/.env from server/.env.example.');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log('MongoDB connected');
  } catch (error) {
    throw new Error(
      'MongoDB connection failed. Check that MongoDB is running and MONGO_URI is correct.',
      {
        cause: error,
      },
    );
  }

  return mongoose.connection;
}

module.exports = connectDB;
