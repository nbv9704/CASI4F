// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:              { type: String, required: true, unique: true },
  email:                 { type: String, required: true, unique: true },
  password:              { type: String, required: true },
  role:                  { type: String, enum: ['user', 'jadmin', 'admin'], default: 'user' },
  balance:               { type: Number, default: 1000 },
  higherLowerLastNumber: { type: Number, default: 10 },
  higherLowerStreak:     { type: Number, default: 0 },
  bank:                  { type: Number, default: 0 },
  avatar:                { type: String, default: '' }, // URL ảnh profile
  dateOfBirth:           { type: Date, default: null }, // Ngày sinh
  // Provably Fair seeds (per-user)
  serverSeed:            { type: String, default: null }, // Current active server seed
  serverSeedHash:        { type: String, default: null }, // SHA-256 of serverSeed (committed to user)
  clientSeed:            { type: String, default: null }, // User's client seed (can be customized)
  nonce:                 { type: Number, default: 0 },    // Incremented per game
  // Reward cooldowns
  hourlyCollectedAt:     { type: Date, default: null },
  dailyCollectedAt:      { type: Date, default: null },
  weeklyCollectedAt:     { type: Date, default: null },
  createdAt:             { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
