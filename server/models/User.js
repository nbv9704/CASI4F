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
  higherLowerBaseBet:    { type: Number, default: 0 }, // Lock bet amount during streak
  bank:                  { type: Number, default: 0 },
  avatar:                { type: String, default: '' }, // URL ảnh profile
  bio:                   { type: String, default: '', maxlength: 300 },
  statusState:           { type: String, enum: ['online', 'offline', 'busy', 'idle'], default: 'online' },
  statusMessage:         { type: String, default: '', maxlength: 140 },
  statusMessageExpiresAt:{ type: Date, default: null },
  profileVisibility:     { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  profileBadges:         { type: [String], default: [] },
  timeZone:              { type: String, default: 'Asia/Ho_Chi_Minh' },
  activeBadge:           { type: String, default: null },
  achievementShowcase:   {
    type: [
      {
        code:     { type: String, required: true },
        pinnedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
    validate: [
      function showcaseLimit(val) {
        return !Array.isArray(val) || val.length <= 3;
      },
      'Achievement showcase cannot contain more than 3 items',
    ],
  },
  achievements:          {
    type: [
      {
        code:       { type: String, required: true },
        earnedAt:   { type: Date, default: Date.now },
        progress:   { type: Number, default: null },
        completed:  { type: Boolean, default: true },
      },
    ],
    default: [],
  },
  achievementStats:      {
    type: Map,
    of: Number,
    default: () => ({}),
  },
  socialLinks:           {
    type: new mongoose.Schema(
      {
        discord: { type: String, default: '' },
        twitter: { type: String, default: '' },
        twitch:  { type: String, default: '' },
        youtube: { type: String, default: '' },
      },
      { _id: false }
    ),
    default: () => ({ discord: '', twitter: '', twitch: '', youtube: '' }),
  },
  dateOfBirth:           { type: Date, default: null }, // Ngày sinh
  level:                 { type: Number, default: 1 },
  experience:            { type: Number, default: 0 },
  levelRewardsClaimed:   { type: [Number], default: [] },
  lastCheckInAt:         { type: Date, default: null },
  // Provably Fair seeds (per-user)
  serverSeed:            { type: String, default: null }, // Current active server seed
  serverSeedHash:        { type: String, default: null }, // SHA-256 of serverSeed (committed to user)
  clientSeed:            { type: String, default: null }, // User's client seed (can be customized)
  nonce:                 { type: Number, default: 0 },    // Incremented per game
  lastServerSeed:        { type: String, default: null }, // The most recently revealed server seed
  lastServerSeedHash:    { type: String, default: null }, // Hash associated with the revealed server seed
  lastServerSeedRevealAt:{ type: Date, default: null },   // When we revealed the previous server seed
  serverSeedRotatedAt:   { type: Date, default: null },   // When the current server seed was generated
  clientSeedUpdatedAt:   { type: Date, default: null },   // When the client seed was last changed
  // Reward cooldowns
  hourlyCollectedAt:     { type: Date, default: null },
  dailyCollectedAt:      { type: Date, default: null },
  weeklyCollectedAt:     { type: Date, default: null },
  notificationFlags:     {
    type: new mongoose.Schema(
      {
        lastDailyRewardReminderAt: { type: Date, default: null },
        dailyReminderNextAt:       { type: Date, default: null },
      },
      { _id: false }
    ),
    default: () => ({}),
  },
  createdAt:             { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
