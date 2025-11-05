// server/controllers/minigames/higherLowerController.js
const mongoose              = require('mongoose')
const User                  = require('../../models/User')
const { randomInt }         = require('../../utils/random')
const { recordGameHistory } = require('../../utils/history')

const MIN_NUMBER      = 1
const MAX_NUMBER      = 20
const MULTIPLIER_STEP = 0.5
const DEFAULT_INITIAL = 10

/**
 * POST /api/game/higherlower/state
 * Get current game state (last number and streak)
 */
exports.getState = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select('higherLowerLastNumber higherLowerStreak')
    
    if (!user) return res.status(404).json({ error: 'User not found' })

    return res.json({
      lastNumber: user.higherLowerLastNumber ?? DEFAULT_INITIAL,
      streak: user.higherLowerStreak || 0
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * POST /api/game/higherlower
 * Body: { betAmount: number, guess: 'higher'|'lower' }
 */
exports.higherLower = async (req, res) => {
  try {
    const userId = req.user.id
    const { betAmount, guess } = req.body

    // Validate inputs
    if (typeof betAmount !== 'number' || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid betAmount' })
    }
    if (!['higher','lower'].includes(guess)) {
      return res.status(400).json({ error: 'guess must be "higher" or "lower"' })
    }

    // Load user and check balance
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // Determine initial number
    const initial = typeof user.higherLowerLastNumber === 'number'
      ? user.higherLowerLastNumber
      : DEFAULT_INITIAL

    // Roll next number
    const next = randomInt(MIN_NUMBER, MAX_NUMBER)

    // Check outcome
    let win = false, tie = false
    if (next === initial) {
      tie = true
    } else if ((guess === 'higher' && next > initial) || (guess === 'lower' && next < initial)) {
      win = true
    }

    // Compute payout and streak
    let payout = 0
    let newStreak = user.higherLowerStreak || 0
    
    if (tie) {
      newStreak = 0
    } else if (win) {
      newStreak += 1
      const multiplier = newStreak * MULTIPLIER_STEP
      payout = betAmount * multiplier
    } else {
      // lose
      newStreak = 0
    }

    // Calculate balance change
    const delta = tie ? 0 : win ? payout : -betAmount

    // ✅ Use MongoDB transaction for atomic balance + state update + history
    const session = await mongoose.startSession()
    let updatedBalance, updatedStreak
    let experienceMeta = null
    
    try {
      await session.withTransaction(async () => {
        // Atomic update: balance, streak, and last number
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { 
            $inc: { balance: delta },
            $set: { 
              higherLowerStreak: newStreak,
              higherLowerLastNumber: next
            }
          },
          { new: true, session }
        ).select('balance higherLowerStreak')

        if (!updatedUser) {
          throw new Error('User not found during transaction')
        }

        updatedBalance = updatedUser.balance
        updatedStreak = updatedUser.higherLowerStreak

        // Determine outcome label
        const outcome = tie ? 'tie' : win ? 'win' : 'lose'

        // Record history within transaction
        const historyResult = await recordGameHistory({ 
          userId, game: 'higherlower', betAmount, outcome, payout 
        }, session)

        if (historyResult?.experience) {
          experienceMeta = historyResult.experience
        }
      })
    } finally {
      await session.endSession()
    }

    // Tính amount cho notification: nếu thắng lấy payout, không thắng lấy betAmount
    const amount = win ? payout : betAmount

    // Send response
    return res.json({
      message: tie
        ? `Tie! Both were ${initial}.`
        : win
          ? `You won! ${initial} → ${next}, streak ${updatedStreak}, payout ${payout}.`
          : `You lost. ${initial} → ${next}.`,
      initial,
      result: next,
      guess,
      tie,
      win,
      streak: updatedStreak,
      payout,
      amount,              // ← thêm trường amount
      balance: updatedBalance,
      experience: experienceMeta
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
