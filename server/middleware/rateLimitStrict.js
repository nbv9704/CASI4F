// server/middleware/rateLimitStrict.js
const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiters for sensitive endpoints
 *
 * In development we often need to bypass these limits to unblock testing.
 * The limiter stays enabled automatically in production or whenever the
 * environment variable ENABLE_STRICT_RATE_LIMIT is explicitly set to "true".
 */

const noop = (req, res, next) => next();
const isProd = process.env.NODE_ENV === 'production';
const shouldEnable = isProd || process.env.ENABLE_STRICT_RATE_LIMIT === 'true';

const maybeLimit = (config) => (shouldEnable ? rateLimit(config) : noop);

// Auth endpoints: Login/Register
// 5 attempts per 15 minutes per IP
const authLimiter = maybeLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_AUTH',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Wallet transfer endpoint
// 10 transfers per 5 minutes per user
const transferLimiter = maybeLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    error: 'Too many transfer attempts, please slow down',
    code: 'RATE_LIMIT_TRANSFER',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Game action endpoints (all solo games + PvP)
// 60 actions per 1 minute per user (allows for fast gameplay like Tower with 15+ ascends)
const pvpActionLimiter = maybeLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    error: 'Too many game actions, please slow down',
    code: 'RATE_LIMIT_GAME',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Room creation: 5 rooms per 10 minutes per user
const createRoomLimiter = maybeLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    error: 'Too many rooms created, please wait before creating more',
    code: 'RATE_LIMIT_CREATE_ROOM',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  transferLimiter,
  pvpActionLimiter,
  createRoomLimiter
};