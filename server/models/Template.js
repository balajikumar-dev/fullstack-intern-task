const mongoose = require('mongoose');

function isHttpUrl(value) {
  if (/^\/previews\/[a-z0-9-]+\.svg$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    thumbnail_url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isHttpUrl,
        message: 'thumbnail_url must be an HTTP(S) URL or a local /previews/*.svg asset.',
      },
    },
    category: { type: String, required: true, trim: true, maxlength: 80 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, result) {
        delete result.__v;
        return result;
      },
    },
  },
);

module.exports = mongoose.model('Template', templateSchema);
