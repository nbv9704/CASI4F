// server/middleware/gameConfig.js
const GameConfig = require('../models/GameConfig');

/**
 * Middleware to validate game is enabled and bet is within limits
 * Usage: router.post('/play', auth, gameConfig('coinflip'), async (req, res) => {...})
 */
const gameConfig = (gameId) => {
  return async (req, res, next) => {
    try {
      const { betAmount } = req.body;
      
      if (!betAmount || betAmount <= 0) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Invalid bet amount' 
        });
      }

      // Get and validate config
      await GameConfig.validateBet(gameId, betAmount);
      
      // Store config in request for use in controller
      req.gameConfig = await GameConfig.getGameConfig(gameId);
      
      next();
    } catch (err) {
      return res.status(400).json({ 
        ok: false, 
        error: err.message 
      });
    }
  };
};

module.exports = gameConfig;
