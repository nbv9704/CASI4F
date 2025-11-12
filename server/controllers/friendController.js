const mongoose = require('mongoose')

const Friendship = require('../models/Friendship')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')
const validateRequest = require('../middleware/validateRequest')
const { AppError } = require('../utils/AppError')
const { ErrorCodes } = require('../utils/ErrorCodes')
const { emitToUser } = require('../utils/socketHelpers')
const { FRIENDS: FRIEND_EVENTS } = require('../constants/socketEvents')
const {
  sendFriendRequestSchema,
  respondFriendRequestSchema,
} = require('../validation/socialSchemas')
const { pushNotification } = require('../utils/notify')
const {
  evaluateAchievements,
  incrementAchievementCounter,
  sendAchievementNotifications,
} = require('../utils/achievements')

const STATUS_STATES = ['online', 'offline', 'busy', 'idle']

const normalizeStatusState = (value) =>
  STATUS_STATES.includes(value) ? value : 'online'

function resolveStatusSnapshot(user) {
  const state = normalizeStatusState(user?.statusState)
  const rawMessage = typeof user?.statusMessage === 'string' ? user.statusMessage : ''
  const expiresAt = user?.statusMessageExpiresAt ? new Date(user.statusMessageExpiresAt) : null
  const isExpired = rawMessage && expiresAt && expiresAt <= new Date()

  return {
    state,
    message: isExpired ? '' : rawMessage,
    messageExpiresAt: isExpired ? null : expiresAt,
  }
}

function safeId(value) {
  return value ? String(value) : ''
}

function mapUserInfo(user) {
  if (!user) return null
  const status = resolveStatusSnapshot(user)
  return {
    id: safeId(user._id),
    username: user.username,
    avatar: user.avatar || '',
    level: user.level || 1,
    statusMessage: status.message,
    status,
  }
}

function mapFriendship(doc, currentUserId, userMap, onlineUsers) {
  const docObj = doc.toObject ? doc.toObject() : doc
  const otherId = String(docObj.requester) === currentUserId
    ? safeId(docObj.recipient)
    : safeId(docObj.requester)
  const otherUser = mapUserInfo(userMap.get(otherId))
  if (!otherUser) return null
  return {
    friendshipId: safeId(docObj._id),
    status: docObj.status,
    requester: safeId(docObj.requester),
    recipient: safeId(docObj.recipient),
    acceptedAt: docObj.acceptedAt,
    createdAt: docObj.createdAt,
    updatedAt: docObj.updatedAt,
    online: Boolean(onlineUsers[otherId] && onlineUsers[otherId].length),
    user: otherUser,
  }
}

function scheduleFriendshipAchievementUpdate(app, ids) {
  if (!app || !Array.isArray(ids)) return
  const uniqueIds = Array.from(new Set(ids.map((id) => safeId(id)).filter(Boolean)))
  if (!uniqueIds.length) return

  setImmediate(async () => {
    try {
      const docs = await User.find({ _id: { $in: uniqueIds } })
        .select('achievements achievementStats level')
        .exec()

      await Promise.all(
        docs.map(async (doc) => {
          try {
            incrementAchievementCounter(doc, 'social.friends.accepted', 1)
            const unlocked = evaluateAchievements(doc, { level: doc.level })
            await doc.save()
            if (unlocked.length) {
              sendAchievementNotifications(app, doc._id, unlocked)
            }
          } catch (error) {
            console.error('Friendship achievement document update error:', error)
          }
        })
      )
    } catch (error) {
      console.error('Friendship achievement update error:', error)
    }
  })
}

const listFriends = asyncHandler(async (req, res) => {
  const userId = safeId(req.user.id)
  const onlineUsers = req.app.get('onlineUsers') || {}

  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: { $in: ['pending', 'accepted'] },
  })
    .sort({ updatedAt: -1 })
    .lean()

  const otherIds = new Set()
  friendships.forEach((doc) => {
    const otherId = String(doc.requester) === userId
      ? safeId(doc.recipient)
      : safeId(doc.requester)
    if (otherId) otherIds.add(otherId)
  })

  const users = await User.find({ _id: { $in: Array.from(otherIds) } })
    .select('username avatar level statusState statusMessage statusMessageExpiresAt')
    .lean()

  const userMap = new Map(users.map((u) => [safeId(u._id), u]))

  const friends = []
  const incoming = []
  const outgoing = []

  friendships.forEach((doc) => {
    const payload = mapFriendship(doc, userId, userMap, onlineUsers)
    if (!payload) return
    if (doc.status === 'accepted') {
      friends.push(payload)
    } else if (doc.status === 'pending') {
      if (safeId(doc.recipient) === userId) incoming.push(payload)
      else outgoing.push(payload)
    }
  })

  res.json({
    friends,
    requests: { incoming, outgoing },
  })
})

const sendFriendRequest = [
  validateRequest(sendFriendRequestSchema, 'body'),
  asyncHandler(async (req, res) => {
    const userId = safeId(req.user.id)
    const { userId: targetIdRaw, username } = req.body

    let target
    if (targetIdRaw) {
      if (!mongoose.isValidObjectId(targetIdRaw)) {
        throw new AppError(ErrorCodes.INVALID_OBJECT_ID, 400, 'Invalid user id')
      }
      target = await User.findById(targetIdRaw).select(
        'username avatar level statusState statusMessage statusMessageExpiresAt'
      )
    } else if (username) {
      target = await User.findOne({ username: new RegExp(`^${username}$`, 'i') })
        .select('username avatar level statusState statusMessage statusMessageExpiresAt')
    }

    if (!target) {
      throw new AppError(ErrorCodes.FRIEND_NOT_FOUND, 404, 'User not found')
    }

    const targetId = safeId(target._id)
    if (targetId === userId) {
      throw new AppError(ErrorCodes.FRIEND_SELF_REQUEST, 400, 'Cannot add yourself')
    }

    const currentUser = await User.findById(userId).select(
      'username avatar level statusState statusMessage statusMessageExpiresAt'
    )

    const pairKey = Friendship.buildPairKey(userId, targetId)
    let friendship = await Friendship.findOne({ pairKey })

    const io = req.app.get('io')
    const onlineUsers = req.app.get('onlineUsers') || {}
    const now = new Date()

    if (friendship) {
      if (friendship.status === 'accepted') {
        throw new AppError(ErrorCodes.FRIEND_ALREADY_EXISTS, 409, 'Already friends')
      }

      const requesterId = safeId(friendship.requester)
      const recipientId = safeId(friendship.recipient)

      if (requesterId === userId) {
        throw new AppError(ErrorCodes.FRIEND_ALREADY_REQUESTED, 409, 'Request already sent')
      }

      if (recipientId === userId && friendship.status === 'pending') {
        friendship.status = 'accepted'
        friendship.acceptedAt = now
        await friendship.save()

        emitToUser(io, onlineUsers, targetId, FRIEND_EVENTS.UPDATE, { type: 'accepted' })
        emitToUser(io, onlineUsers, userId, FRIEND_EVENTS.UPDATE, { type: 'accepted' })

        setImmediate(() => {
          const requesterMessage = `${currentUser?.username || 'Một người chơi'} đã chấp nhận lời mời kết bạn của bạn.`
          const recipientMessage = `Bạn và ${target.username || 'người chơi'} đã trở thành bạn bè.`
          const metadata = {
            friendshipId: safeId(friendship._id),
            friendUserId: userId,
            friendUsername: currentUser?.username,
          }

          pushNotification(req.app, targetId, 'friend_accept', requesterMessage, {
            metadata,
            link: '/friends',
          }).catch((err) => console.error('Friend accept notification error:', err))

          pushNotification(req.app, userId, 'friend_accept', recipientMessage, {
            metadata: {
              friendshipId: safeId(friendship._id),
              friendUserId: targetId,
              friendUsername: target.username,
            },
            link: '/friends',
          }).catch((err) => console.error('Friend accept notification error:', err))
        })

        scheduleFriendshipAchievementUpdate(req.app, [userId, targetId])

        return res.json({
          status: 'accepted',
          friendship: mapFriendship(friendship, userId, new Map([[targetId, target]]), onlineUsers),
          autoAccepted: true,
        })
      }
    }

    friendship = await Friendship.create({
      requester: userId,
      recipient: targetId,
      status: 'pending',
    })

    const payload = mapFriendship(friendship, userId, new Map([[targetId, target]]), onlineUsers)

    emitToUser(io, onlineUsers, targetId, FRIEND_EVENTS.REQUEST, { friendshipId: payload.friendshipId })

    setImmediate(() => {
      const message = `${currentUser?.username || 'Một người chơi'} đã gửi cho bạn lời mời kết bạn.`
      pushNotification(req.app, targetId, 'friend_request', message, {
        metadata: {
          friendshipId: payload.friendshipId,
          fromUserId: userId,
          fromUsername: currentUser?.username,
        },
        link: '/friends',
      }).catch((err) => console.error('Friend request notification error:', err))
    })

    res.status(201).json({ status: 'pending', friendship: payload })
  }),
]

const respondFriendRequest = [
  validateRequest(respondFriendRequestSchema, 'body'),
  asyncHandler(async (req, res) => {
    const userId = safeId(req.user.id)
    const { id } = req.params
    const { action } = req.body

    const friendship = await Friendship.findOne({ _id: id, recipient: userId, status: 'pending' })
    if (!friendship) {
      throw new AppError(ErrorCodes.FRIEND_REQUEST_NOT_FOUND, 404, 'Request not found')
    }

    const targetId = safeId(friendship.requester)
    const io = req.app.get('io')
    const onlineUsers = req.app.get('onlineUsers') || {}

    if (action === 'accept') {
      friendship.status = 'accepted'
      friendship.acceptedAt = new Date()
      await friendship.save()
      const users = await User.find({ _id: { $in: [targetId, userId] } })
        .select('username avatar level statusState statusMessage statusMessageExpiresAt')
        .lean()
      const userMap = new Map(users.map((u) => [safeId(u._id), u]))
      const payload = mapFriendship(friendship, userId, userMap, onlineUsers)
      const currentUser = userMap.get(userId)
      const targetUser = userMap.get(targetId)

      emitToUser(io, onlineUsers, targetId, FRIEND_EVENTS.UPDATE, { type: 'accepted' })
      emitToUser(io, onlineUsers, userId, FRIEND_EVENTS.UPDATE, { type: 'accepted' })

      setImmediate(() => {
        const acceptMessage = `${currentUser?.username || 'Người chơi'} đã chấp nhận lời mời kết bạn của bạn.`
        const notifyMetadata = {
          friendshipId: safeId(friendship._id),
          friendUserId: userId,
          friendUsername: currentUser?.username,
        }

        pushNotification(req.app, targetId, 'friend_accept', acceptMessage, {
          metadata: notifyMetadata,
          link: '/friends',
        }).catch((err) => console.error('Friend accept notification error:', err))

        const confirmMessage = `Bạn và ${targetUser?.username || 'người chơi'} đã trở thành bạn bè.`
        pushNotification(req.app, userId, 'friend_accept', confirmMessage, {
          metadata: {
            friendshipId: safeId(friendship._id),
            friendUserId: targetId,
            friendUsername: targetUser?.username,
          },
          link: '/friends',
        }).catch((err) => console.error('Friend accept notification error:', err))
      })

      scheduleFriendshipAchievementUpdate(req.app, [userId, targetId])

      return res.json({ status: 'accepted', friendship: payload })
    }

    await Friendship.deleteOne({ _id: id })

    emitToUser(io, onlineUsers, targetId, FRIEND_EVENTS.REMOVED, { type: 'rejected', friendshipId: id })

    setImmediate(async () => {
      try {
        const currentUser = await User.findById(userId).select('username').lean()
        pushNotification(req.app, targetId, 'friend_decline', `${currentUser?.username || 'Người chơi'} đã từ chối lời mời kết bạn của bạn.`, {
          metadata: {
            friendshipId: id,
            friendUserId: userId,
            friendUsername: currentUser?.username,
          },
          link: '/friends',
        }).catch((err) => console.error('Friend decline notification error:', err))
      } catch (err) {
        console.error('Friend decline notification lookup error:', err)
      }
    })

    res.json({ status: 'rejected' })
  }),
]

const removeFriend = asyncHandler(async (req, res) => {
  const userId = safeId(req.user.id)
  const { friendId } = req.params

  if (!mongoose.isValidObjectId(friendId)) {
    throw new AppError(ErrorCodes.INVALID_OBJECT_ID, 400, 'Invalid friend identifier')
  }

  const friendship = await Friendship.findOne({
    _id: friendId,
    $or: [{ requester: userId }, { recipient: userId }],
  })

  if (!friendship) {
    throw new AppError(ErrorCodes.FRIEND_REQUEST_NOT_FOUND, 404, 'Friendship not found')
  }

  const otherId = safeId(friendship.requester) === userId
    ? safeId(friendship.recipient)
    : safeId(friendship.requester)

  await Friendship.deleteOne({ _id: friendship._id })

  const io = req.app.get('io')
  const onlineUsers = req.app.get('onlineUsers') || {}

  emitToUser(io, onlineUsers, otherId, FRIEND_EVENTS.REMOVED, { friendshipId: safeId(friendship._id) })
  emitToUser(io, onlineUsers, userId, FRIEND_EVENTS.REMOVED, { friendshipId: safeId(friendship._id) })

  res.json({ success: true })
})

module.exports = {
  listFriends,
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
}
