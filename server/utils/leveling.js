// server/utils/leveling.js
const { getExpToNextLevel, LEVEL_CAP } = require('../config/leveling');

/**
 * Apply experience gain to a user document.
 * Mutates the user instance but does not persist it.
 * @param {import('../models/User')} user
 * @param {number} amount
 * @returns {{ level: number, experience: number, nextLevelExp: number, leveledUp: boolean }}
 */
function applyExperience(user, amount = 0) {
  if (!user) throw new Error('User is required to apply experience');
  const gain = Number.isFinite(amount) ? amount : 0;

  const currentLevel = Number.isFinite(user.level) && user.level > 0 ? user.level : 1;
  const currentExp = Number.isFinite(user.experience) && user.experience >= 0 ? user.experience : 0;

  let level = currentLevel;
  let experience = currentExp + gain;
  let nextLevelExp = getExpToNextLevel(level);
  let leveledUp = false;

  while (nextLevelExp && experience >= nextLevelExp) {
    experience -= nextLevelExp;
    level += 1;
    leveledUp = true;

    if (level >= LEVEL_CAP) {
      nextLevelExp = null;
      experience = 0;
      break;
    }

    nextLevelExp = getExpToNextLevel(level);
  }

  if (!nextLevelExp) {
    // At level cap, keep experience at 0 to render a full bar client-side.
    experience = 0;
  }

  user.level = level;
  user.experience = experience;

  return { level, experience, nextLevelExp, leveledUp };
}

module.exports = { applyExperience };
