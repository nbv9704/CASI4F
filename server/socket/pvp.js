// server/socket/pvp.js
const logger = require('../utils/logger');

/**
 * 🔐 Secure PvP Socket Handler
 * All sockets are authenticated via socketAuthMiddleware
 * socket.userId and socket.user are guaranteed to be set
 */
module.exports = function registerPvpSocket(io) {
  io.on('connection', (socket) => {
    // ✅ Socket is already authenticated
    const userId = socket.userId;
    logger.debug('PvP socket connected', { socketId: socket.id, userId });

    // 🔐 Subscribe to a room channel to receive detailed updates
    socket.on('pvp:joinRoomChannel', (roomId) => {
      if (typeof roomId !== 'string' || !roomId.length) {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }

      socket.join(`pvp:${roomId}`);
      logger.debug('User joined PvP room channel', { 
        userId, 
        socketId: socket.id, 
        roomId 
      });
    });

    // 🔐 Leave room channel
    socket.on('pvp:leaveRoomChannel', (roomId) => {
      if (typeof roomId !== 'string' || !roomId.length) {
        return;
      }

      socket.leave(`pvp:${roomId}`);
      logger.debug('User left PvP room channel', { 
        userId, 
        socketId: socket.id, 
        roomId 
      });
    });

    // 🔐 Optional list refresh trigger (authenticated users only)
    socket.on('pvp:list', () => {
      logger.debug('PvP list refresh requested', { userId, socketId: socket.id });
      io.emit('pvp:rooms:refresh');
    });

    socket.on('disconnect', () => {
      logger.debug('PvP socket disconnected', { socketId: socket.id, userId });
    });
  });
};
