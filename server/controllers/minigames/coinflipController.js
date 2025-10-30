// server/controllers/minigames/coinflipController.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const { recordGameHistory } = require('../../utils/history');
const fair = require('../../utils/fair');

/**
 * POST /api/game/coinflip
 * Body: { betAmount: number, side: 'heads' | 'tails', clientSeed?: string }
 * Solo dùng Provably Fair:
 *   - commit: seedHash = sha256(serverSeed hiện tại)
 *   - rng:    HMAC_SHA256(serverSeed, `${clientSeed}:${nonce}`)
 *   - reveal: trả serverSeed + clientSeed + nonce để user verify
 */
exports.coinflip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { betAmount, side, clientSeed: rawClientSeed } = req.body || {};

    // Validate inputs
    if (typeof betAmount !== 'number' || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }
    if (!['heads', 'tails'].includes(side)) {
      return res.status(400).json({ error: 'Side must be "heads" or "tails"' });
    }

    // Load user & balance check
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // ✅ Get or initialize user's provably fair seeds from DB
    const seeds = await fair.getUserSeeds(user);
    const { serverSeed, serverSeedHash, clientSeed, nonce } = seeds;

    // Allow user to override clientSeed for this game (if provided)
    const effectiveClientSeed = rawClientSeed || clientSeed;

    // RNG using provably fair
    const flip = fair.coinflip({ serverSeed, clientSeed: effectiveClientSeed, nonce });
    const win  = flip === side;

    // Calculate payout
    const payout = win ? betAmount : 0;
    const delta  = win ? betAmount : -betAmount;

    // ✅ Use MongoDB transaction for atomic balance update + nonce increment + history
    const session = await mongoose.startSession();
    let updatedBalance;
    
    try {
      await session.withTransaction(async () => {
        // Atomic balance update + nonce increment
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { 
            $inc: { 
              balance: delta,
              nonce: 1  // ✅ Increment nonce for next game
            } 
          },
          { new: true, session }
        ).select('balance nonce');

        if (!updatedUser) {
          throw new Error('User not found during transaction');
        }

        updatedBalance = updatedUser.balance;

        // Record history within transaction
        await recordGameHistory({
          userId,
          game: 'coinflip',
          betAmount,
          outcome: win ? 'win' : 'lose',
          payout,
        }, session);
      });
    } finally {
      await session.endSession();
    }

    // Response (amount = abs(delta) để withNotification wrapper dùng)
    return res.json({
      message: win
        ? `You won! The coin showed ${flip}.`
        : `You lost. The coin showed ${flip}.`,
      result: flip,
      win,
      payout,
      amount: Math.abs(delta),
      balance: updatedBalance,
      // ✅ Provably fair verification data
      fair: {
        serverSeedHash,           // Committed hash (proves server didn't change seed)
        serverSeed,               // Revealed seed (for verification)
        clientSeed: effectiveClientSeed,
        nonce,                    // Nonce used for this game
        result: flip              // Can verify: coinflip({serverSeed, clientSeed, nonce}) === flip
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
