const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      maxlength: 240,
    },
    icon: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'general',
      lowercase: true,
      trim: true,
    },
    xpReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    badgeUnlock: {
      type: String,
      default: null,
    },
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
