// server/utils/history.js
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');
const { applyExperience } = require('./leveling');
const { evaluateAchievements, incrementAchievementCounter } = require('./achievements');
const { calculateGameExpFromBet } = require('../config/leveling');

function applyAchievementCountersForGame(user, game, outcome) {
  if (!user) return false;
  let modified = false;

  switch (game) {
    case 'coinflip':
    case 'coinflip_battle':
      incrementAchievementCounter(user, 'coinflip.played', 1);
      if (outcome === 'win') {
        incrementAchievementCounter(user, 'coinflip.wins', 1);
      }
      modified = true;
      break;
    default:
      break;
  }

  return modified;
}

/**
 * Record game history
 * @param {Object} data - Game data (userId, game, betAmount, outcome, payout)
 * @param {Object} session - Optional MongoDB session for transactions
 */
async function recordGameHistory({ userId, game, betAmount, outcome, payout }, session = null) {
  try {
    let experience = null;
    const expGain = calculateGameExpFromBet(betAmount);

    const payload = {
      user: userId,
      game,
      betAmount,
      outcome,
      payout,
      experienceGain: expGain,
    };

    const historyDocs = session
      ? await GameHistory.create([payload], { session })
      : await GameHistory.create(payload);

    let achievementsUnlocked = [];
    if (userId) {
      const query = User.findById(userId).select('level experience achievements achievementStats');
      if (session) {
        query.session(session);
      }

      const user = await query;
      if (user) {
        const countersUpdated = applyAchievementCountersForGame(user, game, outcome);

        let progress = null;
        if (expGain > 0) {
          progress = applyExperience(user, expGain);
        }

        const evaluationLevel = progress?.level ?? user.level;
        achievementsUnlocked = evaluateAchievements(user, { level: evaluationLevel });

        if (progress || countersUpdated || achievementsUnlocked.length) {
          await user.save(session ? { session } : undefined);
        }

        if (progress) {
          experience = {
            gain: expGain,
            level: progress.level,
            experience: progress.experience,
            nextLevelExp: progress.nextLevelExp,
            leveledUp: progress.leveledUp,
            achievementsUnlocked,
          };
        }
      }
    }

    const historyId = Array.isArray(historyDocs)
      ? historyDocs[0]?._id || null
      : historyDocs?._id || null;

  return { historyId, experience, achievementsUnlocked };
  } catch (err) {
    console.error('Error recording game history:', err);
    throw err; // Re-throw to abort transaction if within one
  }
}

module.exports = { recordGameHistory };