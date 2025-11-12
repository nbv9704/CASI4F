const Joi = require('joi')

const sendFriendRequestSchema = Joi.object({
  userId: Joi.string().trim().hex().length(24),
  username: Joi.string().trim().min(3).max(32),
}).xor('userId', 'username')

const respondFriendRequestSchema = Joi.object({
  action: Joi.string().valid('accept', 'reject').required(),
})

const sendMessageSchema = Joi.object({
  body: Joi.string().trim().min(1).max(1000).required(),
})

const messageHistorySchema = Joi.object({
  cursor: Joi.string().trim().hex().length(24).optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
})

module.exports = {
  sendFriendRequestSchema,
  respondFriendRequestSchema,
  sendMessageSchema,
  messageHistorySchema,
}
