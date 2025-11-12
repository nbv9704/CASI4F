// server/middleware/ensureGameEnabled.js
const GameConfig = require('../models/GameConfig');
const PvpRoom = require('../models/PvpRoom');

const DEFAULT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Middleware to ensure a requested game is enabled via GameConfig.
 * Attempts to resolve the gameId from body, params or associated PvP room.
 * Returns 423 Locked if the game is disabled.
 */
module.exports = function ensureGameEnabled(options = {}) {
  const methods = Array.isArray(options.methods) && options.methods.length > 0
    ? options.methods.map((m) => m.toUpperCase())
    : DEFAULT_METHODS;

  return async function ensureGameEnabledMiddleware(req, res, next) {
    try {
      if (!methods.includes(req.method.toUpperCase())) {
        return next();
      }

      let gameId = options.gameId;

      if (!gameId) {
        const { body = {}, params = {}, query = {} } = req;
        gameId = body.game || body.gameId || params.game || params.gameId || query.game;
      }

      if (!gameId && req.params?.roomId) {
        // Fallback: resolve from PvP room (best-effort)
        const room = await PvpRoom.findOne({ roomId: req.params.roomId }).select('game');
        if (room) {
          req._ensureGameEnabledRoom = room;
          gameId = room.game;
        }
      }

      if (!gameId) {
        return next();
      }

      const config = await GameConfig.getGameConfig(String(gameId));
      if (!config?.enabled) {
        return res.status(423).json({
          ok: false,
          code: 'GAME_DISABLED',
          error: 'Game đang bị tạm khóa, vui lòng đợi...',
        });
      }

      req.gameConfig = config;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
