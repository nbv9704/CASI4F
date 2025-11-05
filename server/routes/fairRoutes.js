// server/routes/fairRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const fair = require('../utils/fair');
const { AppError } = require('../utils/AppError');

// GET current provably fair state for the authenticated user
router.get(
  '/current',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User not found');

    const seeds = await fair.getUserSeeds(user);

    res.json({
      clientSeed: seeds.clientSeed,
      clientSeedUpdatedAt: user.clientSeedUpdatedAt,
      serverSeedHash: seeds.serverSeedHash,
      serverSeedRotatedAt: user.serverSeedRotatedAt,
      nonce: seeds.nonce,
      lastServerSeed: user.lastServerSeed,
      lastServerSeedHash: user.lastServerSeedHash,
      lastServerSeedRevealAt: user.lastServerSeedRevealAt,
    });
  }),
);

// POST rotate server seed (reveals previous seed, commits new one)
router.post(
  '/rotate',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User not found');

    if (!user.serverSeed || !user.serverSeedHash) {
      await fair.initializeUserSeeds(user);
    }

    const result = await fair.rotateServerSeed(user);

    res.json({
      revealedServerSeed: result.revealedServerSeed,
      revealedServerSeedHash: result.revealedServerSeedHash,
      newServerSeedHash: result.newServerSeedHash,
      nonce: user.nonce,
    });
  }),
);

// POST update client seed
router.post(
  '/client-seed',
  auth,
  asyncHandler(async (req, res) => {
    const { clientSeed } = req.body || {};
    if (typeof clientSeed !== 'string' || clientSeed.trim().length < 3 || clientSeed.trim().length > 128) {
      throw new AppError('INVALID_CLIENT_SEED', 400, 'Client seed must be between 3 and 128 characters.');
    }

    const sanitized = clientSeed.trim();

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User not found');

    const updated = await fair.updateClientSeed(user, sanitized);

    res.json({
      clientSeed: updated,
      nonce: user.nonce,
    });
  }),
);

module.exports = router;
