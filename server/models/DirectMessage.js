const mongoose = require('mongoose')

const { Schema } = mongoose

function buildConversationKey(a, b) {
  const ids = [String(a), String(b)].sort()
  return ids.join(':')
}

const directMessageSchema = new Schema(
  {
    conversationKey: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 1000 },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

directMessageSchema.statics.buildConversationKey = buildConversationKey

directMessageSchema.index({ conversationKey: 1, createdAt: -1 })
directMessageSchema.index({ recipient: 1, readAt: 1 })

module.exports = mongoose.model('DirectMessage', directMessageSchema)
