// server/middleware/socketAuth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * 🔐 Socket.IO Authentication Middleware
 * Validates JWT token from handshake query or auth
 * Attaches decoded user info to socket for authorization
 */
function socketAuthMiddleware(socket, next) {
  try {
    // Extract token from handshake (query or auth)
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      logger.warn('Socket connection attempt without token', {
        socketId: socket.id,
        remoteAddress: socket.handshake.address
      });
      return next(new Error('AUTH_TOKEN_MISSING'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate user ID format
    if (!decoded.id || !mongoose.isValidObjectId(decoded.id)) {
      logger.warn('Socket connection with invalid user ID', {
        socketId: socket.id,
        userId: decoded.id
      });
      return next(new Error('AUTH_TOKEN_INVALID_USER_ID'));
    }

    // Attach user info to socket
    socket.userId = decoded.id;
    socket.userRole = decoded.role || 'user';
    socket.user = decoded;

    logger.debug('Socket authenticated successfully', {
      socketId: socket.id,
      userId: decoded.id,
      role: decoded.role
    });

    next();
  } catch (err) {
    logger.warn('Socket authentication failed', {
      socketId: socket.id,
      error: err.message,
      name: err.name
    });

    if (err.name === 'TokenExpiredError') {
      return next(new Error('AUTH_TOKEN_EXPIRED'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new Error('AUTH_TOKEN_INVALID'));
    }
    return next(new Error('AUTH_FAILED'));
  }
}

module.exports = socketAuthMiddleware;
