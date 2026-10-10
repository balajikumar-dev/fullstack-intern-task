require('../config/env');

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Template = require('../models/Template');
const samples = require('../data/sampleTemplates');

async function seedTemplates() {
  await Template.init();
  let inserted = 0;
  let updatedPreviews = 0;

  for (const sample of samples) {
    const document = new Template(sample);
    await document.validate();
    const now = new Date();
    const result = await Template.updateOne(
      { _id: document._id },
      { $setOnInsert: { ...document.toObject(), createdAt: now, updatedAt: now } },
      { upsert: true, runValidators: true, timestamps: false },
    );
    inserted += result.upsertedCount;
    // Migrate only our original placeholders; keep all other existing edits.
    const previewResult = await Template.updateOne(
      { _id: document._id, thumbnail_url: /^https:\/\/placehold\.co\// },
      { $set: { thumbnail_url: document.thumbnail_url } },
      { runValidators: true },
    );
    updatedPreviews += previewResult.modifiedCount;
  }

  const count = await Template.countDocuments({
    _id: { $in: samples.map((sample) => sample._id) },
  });
  if (count !== samples.length) {
    throw new Error('Some sample templates were not saved.');
  }

  console.log(
    `Templates seeded: ${inserted} inserted; ${updatedPreviews} previews upgraded; ${count} sample templates available.`,
  );
  return { inserted, count, updatedPreviews };
}

async function main() {
  try {
    await connectDB();
    await seedTemplates();
  } catch {
    console.error('Template seeding failed. Check MongoDB and MONGO_URI in server/.env.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = seedTemplates;
module.exports.main = main;
