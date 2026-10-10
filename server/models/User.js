const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
      match: /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, result) {
        delete result.passwordHash;
        delete result.__v;
        return result;
      },
    },
  },
);

module.exports = mongoose.model('User', userSchema);
