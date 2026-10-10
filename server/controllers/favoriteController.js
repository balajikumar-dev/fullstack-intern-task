const Favorite = require('../models/Favorite');
const { findTemplate, serializeTemplate } = require('../services/templateService');

async function list(req, res) {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('template');
  res.json({
    templates: favorites
      .filter((favorite) => favorite.template)
      .map((favorite) => serializeTemplate(favorite.template)),
  });
}

async function add(req, res) {
  const template = await findTemplate(req.params.templateId);
  const filter = { user: req.user._id, template: template._id };
  let inserted = false;
  try {
    const result = await Favorite.updateOne(
      filter,
      { $setOnInsert: filter },
      { upsert: true, runValidators: true },
    );
    inserted = result.upsertedCount > 0;
  } catch (error) {
    // A simultaneous save by this user is already the desired final state.
    if (error.code !== 11000) throw error;
  }
  res
    .status(inserted ? 201 : 200)
    .json({
      templateId: template.id,
      message: inserted ? 'Template saved to favorites.' : 'Template is already in your favorites.',
    });
}

async function remove(req, res) {
  const template = await findTemplate(req.params.templateId);
  await Favorite.deleteOne({ user: req.user._id, template: template._id });
  res.json({ templateId: template.id, message: 'Template removed from favorites.' });
}

module.exports = { list, add, remove };
