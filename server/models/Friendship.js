const mongoose = require('mongoose')

const { Schema } = mongoose

function buildPairKey(a, b) {
  const ids = [String(a), String(b)].sort()
  return ids.join(':')
}

const friendshipSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
    },
    pairKey: { type: String, required: true, unique: true },
    acceptedAt: { type: Date, default: null },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
  },
)

friendshipSchema.pre('validate', function setPairKey(next) {
  if (this.requester && this.recipient) {
    this.pairKey = buildPairKey(this.requester, this.recipient)
  }
  next()
})

friendshipSchema.methods.isParticipant = function isParticipant(userId) {
  if (!userId) return false
  const id = String(userId)
  return String(this.requester) === id || String(this.recipient) === id
}

friendshipSchema.statics.buildPairKey = buildPairKey

friendshipSchema.index({ requester: 1, status: 1 })
friendshipSchema.index({ recipient: 1, status: 1 })
friendshipSchema.index({ updatedAt: -1 })

module.exports = mongoose.model('Friendship', friendshipSchema)
