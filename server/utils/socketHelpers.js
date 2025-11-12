function emitToUser(io, onlineUsers, userId, event, payload) {
  if (!io || !onlineUsers || !userId || !event) return
  const sockets = onlineUsers[String(userId)]
  if (!Array.isArray(sockets) || sockets.length === 0) return
  sockets.forEach((socketId) => {
    io.to(socketId).emit(event, payload)
  })
}

module.exports = {
  emitToUser,
}
