require('../config/env');

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Template = require('../models/Template');
const Favorite = require('../models/Favorite');
const samples = require('../data/sampleTemplates');

async function checkDB() {
  try {
    const connection = await connectDB();
    await connection.db.command({ ping: 1 });
    await Promise.all([User.init(), Template.init(), Favorite.init()]);

    const documents = await Template.find({
      _id: { $in: samples.map((sample) => sample._id) },
    }).sort({ _id: 1 });

    if (documents.length !== samples.length) {
      throw new Error('Sample templates are missing. Run npm.cmd run db:seed first.');
    }

    for (const document of documents) {
      await document.validate();
      if (!document.toJSON().id) {
        throw new Error('Template ID is missing.');
      }
    }

    console.log(
      `Database check passed: ping, model indexes, and ${samples.length} saved sample templates.`,
    );
    documents.forEach((document) => console.log(`- ${document.name} (${document.category})`));
  } catch {
    console.error('Database check failed. Check MongoDB, MONGO_URI, and run npm.cmd run db:seed.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

checkDB();
