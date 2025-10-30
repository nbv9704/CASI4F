// server/utils/history.js
const GameHistory = require('../models/GameHistory');

/**
 * Record game history
 * @param {Object} data - Game data (userId, game, betAmount, outcome, payout)
 * @param {Object} session - Optional MongoDB session for transactions
 */
async function recordGameHistory({ userId, game, betAmount, outcome, payout }, session = null) {
  try {
    if (session) {
      // Within transaction
      await GameHistory.create(
        [{ user: userId, game, betAmount, outcome, payout }],
        { session }
      );
    } else {
      // Standalone
      await GameHistory.create({ user: userId, game, betAmount, outcome, payout });
    }
  } catch (err) {
    console.error('Error recording game history:', err);
    throw err; // Re-throw to abort transaction if within one
  }
}

module.exports = { recordGameHistory };