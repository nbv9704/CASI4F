// server/config/leveling.js
const DAILY_CHECKIN_EXP = 50;
const GAME_EXP_RATE = 1; // 1 exp per coin wagered
const MIN_GAME_EXP = 1;
const MAX_GAME_EXP = 10_000; // allow full credit for high-stake rounds

const LEVEL_CAP = 50;
const LEVEL_TIERS = [
  { from: 1,  to: 10, exp: 1_000 },
  { from: 11, to: 20, exp: 2_000 },
  { from: 21, to: 30, exp: 5_000 },
  { from: 31, to: 40, exp: 10_000 },
  { from: 41, to: 50, exp: 20_000 }
];

function getTierForLevel(level = 1) {
  return LEVEL_TIERS.find(tier => level >= tier.from && level <= tier.to) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
}

function getExpToNextLevel(level = 1) {
  const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
  if (safeLevel >= LEVEL_CAP) return null;
  const tier = getTierForLevel(safeLevel);
  return tier ? tier.exp : null;
}

function calculateGameExpFromBet(amount = 0) {
  const wager = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  if (wager <= 0) return 0;

  const rawGain = Math.floor(wager * GAME_EXP_RATE);
  const bounded = Math.min(MAX_GAME_EXP, Math.max(MIN_GAME_EXP, rawGain));
  return bounded;
}

module.exports = {
  DAILY_CHECKIN_EXP,
  GAME_EXP_RATE,
  MIN_GAME_EXP,
  MAX_GAME_EXP,
  LEVEL_CAP,
  LEVEL_TIERS,
  getExpToNextLevel,
  getTierForLevel,
  calculateGameExpFromBet,
};
