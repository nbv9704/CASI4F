// server/utils/notify.js
const Notification = require('../models/Notification')

/**
 * Persist a notification and emit it to all active sockets for the user.
 * @param {import('express').Express} app - Express application instance (for socket registry)
 * @param {string|import('mongoose').Types.ObjectId} userId - Target user id
 * @param {string} type - Notification type identifier
 * @param {string} message - Human readable message
 * @param {{ metadata?: object, link?: string }} [options] - Optional payload extensions
 * @returns {Promise<object>} The serialized notification payload that was emitted
 */
async function pushNotification(app, userId, type, message, options = {}) {
  if (!app) return null

  const payload = {
    userId,
    type,
    message,
    read: false,
  }

  if (options.link) payload.link = options.link
  if (options.metadata) payload.metadata = options.metadata

  const notif = await Notification.create(payload)

  const io = app.get('io')
  if (!io) return notif

  const onlineUsers = app.get('onlineUsers') || {}
  const sockets = onlineUsers[String(userId)] || []
  const serialized = {
    _id: String(notif._id),
    userId: String(notif.userId),
    type: notif.type,
    message: notif.message,
    read: notif.read,
    createdAt: notif.createdAt,
    link: notif.link,
    metadata: notif.metadata,
    serverNow: Date.now(),
  }

  sockets.forEach((socketId) => {
    io.to(socketId).emit('notification', serialized)
  })

  return serialized
}

module.exports = { pushNotification }
