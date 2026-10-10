const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  },
  { timestamps: true },
);

favoriteSchema.index({ user: 1, template: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
