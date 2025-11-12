const mongoose = require('mongoose')

const Friendship = require('../models/Friendship')
const DirectMessage = require('../models/DirectMessage')
const asyncHandler = require('../middleware/asyncHandler')
const validateRequest = require('../middleware/validateRequest')
const { AppError } = require('../utils/AppError')
const { ErrorCodes } = require('../utils/ErrorCodes')
const { emitToUser } = require('../utils/socketHelpers')
const { CHAT: CHAT_EVENTS } = require('../constants/socketEvents')
const { messageHistorySchema, sendMessageSchema } = require('../validation/socialSchemas')

function safeId(value) {
  return value ? String(value) : ''
}

async function ensureFriendship(userId, targetId) {
  const pairKey = Friendship.buildPairKey(userId, targetId)
  const friendship = await Friendship.findOne({ pairKey, status: 'accepted' })
  if (!friendship) {
    throw new AppError(ErrorCodes.CHAT_NOT_ALLOWED, 403, 'Friendship not found')
  }
  return friendship
}

function mapMessage(doc) {
  const obj = doc.toObject ? doc.toObject() : doc
  return {
    id: safeId(obj._id),
    sender: safeId(obj.sender),
    recipient: safeId(obj.recipient),
    body: obj.body,
    createdAt: obj.createdAt,
    readAt: obj.readAt,
  }
}

const listMessages = [
  validateRequest(messageHistorySchema, 'query'),
  asyncHandler(async (req, res) => {
    const userId = safeId(req.user.id)
    const { friendId } = req.params
    const { cursor, limit } = req.query

    if (!mongoose.isValidObjectId(friendId)) {
      throw new AppError(ErrorCodes.INVALID_OBJECT_ID, 400, 'Invalid friend identifier')
    }

    await ensureFriendship(userId, friendId)

    const conversationKey = DirectMessage.buildConversationKey(userId, friendId)
    const query = { conversationKey }
    if (cursor) {
      query._id = { $lt: cursor }
    }

    const messages = await DirectMessage.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean()

    res.json({
      messages: messages.reverse().map(mapMessage),
      hasMore: messages.length === Number(limit),
    })
  }),
]

const sendMessage = [
  validateRequest(sendMessageSchema, 'body'),
  asyncHandler(async (req, res) => {
    const userId = safeId(req.user.id)
    const { friendId } = req.params
    const { body } = req.body

    if (!mongoose.isValidObjectId(friendId)) {
      throw new AppError(ErrorCodes.INVALID_OBJECT_ID, 400, 'Invalid friend identifier')
    }

    await ensureFriendship(userId, friendId)

    const trimmed = body.trim()
    if (!trimmed) {
      throw new AppError(ErrorCodes.CHAT_MESSAGE_EMPTY, 400, 'Message is empty')
    }

    const conversationKey = DirectMessage.buildConversationKey(userId, friendId)
    const message = await DirectMessage.create({
      conversationKey,
      sender: userId,
      recipient: friendId,
      body: trimmed,
    })

    const formatted = mapMessage(message)

    const io = req.app.get('io')
    const onlineUsers = req.app.get('onlineUsers') || {}

    emitToUser(io, onlineUsers, friendId, CHAT_EVENTS.MESSAGE, formatted)
    emitToUser(io, onlineUsers, userId, CHAT_EVENTS.MESSAGE, formatted)

    res.status(201).json({ message: formatted })
  }),
]

module.exports = {
  listMessages,
  sendMessage,
}
