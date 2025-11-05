// server/controllers/rewardController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const { pushNotification } = require('../utils/notify');
const { DAILY_CHECKIN_EXP, getExpToNextLevel } = require('../config/leveling');
const { applyExperience } = require('../utils/leveling');

const REWARD_AMOUNTS = {
  hourly: 10,
  daily:  100,
  weekly: 1000
};

const COOLDOWNS_MS = {
  hourly: 60 * 60 * 1000,
  daily:  24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  checkin: 24 * 60 * 60 * 1000
};

// GET /api/rewards
exports.getRewardsStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      hourly: user.hourlyCollectedAt,
      daily:  user.dailyCollectedAt,
      weekly: user.weeklyCollectedAt,
      checkIn: user.lastCheckInAt,
      level: Number.isFinite(user.level) ? user.level : 1,
      experience: Number.isFinite(user.experience) ? user.experience : 0,
      nextLevelExp: getExpToNextLevel(user.level)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/rewards/checkin
exports.collectCheckIn = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const last = user.lastCheckInAt;
    const now = Date.now();

    if (last && now - last.getTime() < COOLDOWNS_MS.checkin) {
      const next = new Date(last.getTime() + COOLDOWNS_MS.checkin);
      throw { status: 400, error: 'Cooldown active', nextAvailable: next };
    }

    user.lastCheckInAt = new Date(now);
    const progress = applyExperience(user, DAILY_CHECKIN_EXP);
    await user.save({ session });

    await session.commitTransaction();

    if (progress.leveledUp) {
      setImmediate(() => {
        pushNotification(req.app, user._id, 'level_up', `Chúc mừng! Bạn đã đạt cấp ${progress.level}.`)
          .catch((err) => console.error('Level-up notification error:', err));
      });
    }

    res.json({
      message: 'Daily check-in reward collected',
      level: progress.level,
      experience: progress.experience,
      nextLevelExp: progress.nextLevelExp,
      gained: DAILY_CHECKIN_EXP,
      leveledUp: progress.leveledUp
    });
  } catch (error) {
    await session.abortTransaction();

    if (error.status === 400) {
      return res.status(400).json({
        error: error.error,
        nextAvailable: error.nextAvailable
      });
    }

    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    session.endSession();
  }
};

// POST /api/rewards/:type
// 🔒 Uses MongoDB transaction to prevent double-claiming via race condition
exports.collectReward = async (req, res) => {
  try {
    const { type } = req.params; // 'hourly', 'daily', 'weekly'
    if (!['hourly', 'daily', 'weekly'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reward type' });
    }

    const session = await mongoose.startSession();
    let balance;

    try {
      await session.startTransaction();

      // Lock user document in transaction to prevent race condition
      const user = await User.findById(req.user.id).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const last = user[`${type}CollectedAt`];
      const now  = Date.now();
      
      // Check cooldown
      if (last && now - last.getTime() < COOLDOWNS_MS[type]) {
        const next = new Date(last.getTime() + COOLDOWNS_MS[type]);
        throw { status: 400, error: 'Cooldown active', nextAvailable: next };
      }

      // Grant reward atomically
      const amount = REWARD_AMOUNTS[type];
      user.balance += amount;
      user[`${type}CollectedAt`] = new Date();
      await user.save({ session });

      await session.commitTransaction();
      balance = user.balance;

      res.json({ 
        message: `Collected ${type} reward`, 
        amount, 
        balance 
      });
    } catch (error) {
      await session.abortTransaction();
      
      // Re-throw validation errors
      if (error.status === 400) {
        return res.status(400).json({ 
          error: error.error, 
          nextAvailable: error.nextAvailable 
        });
      }
      throw error;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
