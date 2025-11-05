// server/utils/history.js
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');
const { applyExperience } = require('./leveling');
const { calculateGameExpFromBet } = require('../config/leveling');

/**
 * Record game history
 * @param {Object} data - Game data (userId, game, betAmount, outcome, payout)
 * @param {Object} session - Optional MongoDB session for transactions
 */
async function recordGameHistory({ userId, game, betAmount, outcome, payout }, session = null) {
  try {
    const historyDocs = session
      ? await GameHistory.create(
          [{ user: userId, game, betAmount, outcome, payout }],
          { session },
        )
      : await GameHistory.create({ user: userId, game, betAmount, outcome, payout });

    let experience = null;
    const expGain = calculateGameExpFromBet(betAmount);

    if (expGain > 0 && userId) {
      const query = User.findById(userId).select('level experience');
      if (session) {
        query.session(session);
      }

      const user = await query;
      if (user) {
        const progress = applyExperience(user, expGain);
        await user.save(session ? { session } : undefined);

        experience = {
          gain: expGain,
          level: progress.level,
          experience: progress.experience,
          nextLevelExp: progress.nextLevelExp,
          leveledUp: progress.leveledUp,
        };
      }
    }

    const historyId = Array.isArray(historyDocs)
      ? historyDocs[0]?._id || null
      : historyDocs?._id || null;

    return { historyId, experience };
  } catch (err) {
    console.error('Error recording game history:', err);
    throw err; // Re-throw to abort transaction if within one
  }
}

module.exports = { recordGameHistory };