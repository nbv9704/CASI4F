// server/controllers/rewardController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const { pushNotification } = require('../utils/notify');
const { evaluateAchievements, sendAchievementNotifications, incrementAchievementCounter } = require('../utils/achievements');
const { DAILY_CHECKIN_EXP, getExpToNextLevel } = require('../config/leveling');
const { applyExperience } = require('../utils/leveling');
const levelRewardTable = require('../config/levelRewards');

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

const REWARD_COUNTER_KEYS = {
  hourly: 'rewards.hourly.claimed',
  daily: 'rewards.daily.claimed',
  weekly: 'rewards.weekly.claimed',
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
  incrementAchievementCounter(user, 'checkin.days', 1);
  const progress = applyExperience(user, DAILY_CHECKIN_EXP);
    const unlockedAchievements = evaluateAchievements(user, { level: progress.level });
    await user.save({ session });

    await session.commitTransaction();

    setImmediate(() => {
      if (progress.leveledUp) {
        pushNotification(
          req.app,
          user._id,
          'level_up',
          `Chúc mừng! Bạn đã đạt cấp ${progress.level}.`,
        ).catch((err) => console.error('Level-up notification error:', err));
      }

      sendAchievementNotifications(req.app, user._id, unlockedAchievements);
    });

    res.json({
      message: 'Daily check-in reward collected',
      level: progress.level,
      experience: progress.experience,
      nextLevelExp: progress.nextLevelExp,
      gained: DAILY_CHECKIN_EXP,
      leveledUp: progress.leveledUp,
      achievementsUnlocked: unlockedAchievements,
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
    let amount = 0;
    let unlockedAchievements = [];

    try {
      await session.startTransaction();

      // Lock user document in transaction to prevent race condition
      const user = await User.findById(req.user.id).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const last = user[`${type}CollectedAt`];
      const now = Date.now();

      // Check cooldown
      if (last && now - last.getTime() < COOLDOWNS_MS[type]) {
        const next = new Date(last.getTime() + COOLDOWNS_MS[type]);
        throw { status: 400, error: 'Cooldown active', nextAvailable: next };
      }

      // Grant reward atomically
      amount = REWARD_AMOUNTS[type];
      user.balance += amount;
      user[`${type}CollectedAt`] = new Date();

      const counterKey = REWARD_COUNTER_KEYS[type];
      if (counterKey) {
        incrementAchievementCounter(user, counterKey, 1);
      }
      incrementAchievementCounter(user, 'rewards.claimed.total', 1);

      unlockedAchievements = evaluateAchievements(user, { level: user.level });

      await user.save({ session });
      await session.commitTransaction();

      balance = user.balance;
    } catch (error) {
      await session.abortTransaction();

      // Re-throw validation errors
      if (error.status === 400) {
        return res.status(400).json({
          error: error.error,
          nextAvailable: error.nextAvailable,
        });
      }
      throw error;
    } finally {
      session.endSession();
    }

    if (unlockedAchievements.length) {
      setImmediate(() => {
        sendAchievementNotifications(req.app, req.user.id, unlockedAchievements);
      });
    }

    return res.json({
      message: `Collected ${type} reward`,
      amount,
      balance,
      achievementsUnlocked: unlockedAchievements,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getLevelRewardsCatalog = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('level experience levelRewardsClaimed')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const claimed = new Set(user.levelRewardsClaimed || []);
    const rewards = levelRewardTable.map((entry) => {
      let status = 'locked';
      if (user.level >= entry.level) {
        status = claimed.has(entry.level) ? 'claimed' : 'available';
      }

      return {
        level: entry.level,
        rewards: entry.rewards,
        status,
      };
    });

    res.json({
      level: user.level,
      experience: user.experience,
      nextLevelExp: getExpToNextLevel(user.level),
      claimed: Array.from(claimed.values()),
      rewards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.claimLevelReward = async (req, res) => {
  const targetLevel = parseInt(req.params.level, 10);
  if (!Number.isFinite(targetLevel)) {
    return res.status(400).json({ error: 'Invalid level parameter' });
  }

  const rewardConfig = levelRewardTable.find((entry) => entry.level === targetLevel);
  if (!rewardConfig) {
    return res.status(404).json({ error: 'Reward not found for this level' });
  }

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const claimed = new Set(user.levelRewardsClaimed || []);
    if (claimed.has(targetLevel)) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }

    if (user.level < targetLevel) {
      return res.status(400).json({ error: 'Level requirement not met' });
    }

    const rewards = rewardConfig.rewards || {};
    const coinReward = Number.isFinite(rewards.coins) ? rewards.coins : 0;
    const xpReward = Number.isFinite(rewards.xp) ? rewards.xp : 0;

    if (coinReward > 0) {
      user.balance += coinReward;
    }

    let xpProgress = null;
    let unlockedAchievements = [];
    if (xpReward > 0) {
      xpProgress = applyExperience(user, xpReward);
      unlockedAchievements = evaluateAchievements(user, { level: xpProgress.level });
    } else {
      unlockedAchievements = evaluateAchievements(user, { level: user.level });
    }

    claimed.add(targetLevel);
    user.levelRewardsClaimed = Array.from(claimed.values()).sort((a, b) => a - b);

    await user.save({ session });
    await session.commitTransaction();

    const payload = {
      message: `Claimed level ${targetLevel} reward`,
      level: user.level,
      experience: user.experience,
      nextLevelExp: getExpToNextLevel(user.level),
      balance: user.balance,
      rewards,
      xpAwarded: xpReward,
      leveledUp: xpProgress?.leveledUp || false,
      claimed: user.levelRewardsClaimed,
      achievementsUnlocked: unlockedAchievements,
    };

    setImmediate(() => {
      const parts = [];
      if (coinReward > 0) parts.push(`+${coinReward} coins`);
      if (xpReward > 0) parts.push(`+${xpReward} XP`);
      const message = parts.length
        ? `Bạn đã nhận thưởng cấp ${targetLevel}: ${parts.join(', ')}.`
        : `Bạn đã nhận thưởng cấp ${targetLevel}.`;

      pushNotification(req.app, user._id, 'level_reward', message).catch((error) =>
        console.error('Level reward notification error:', error)
      );

      if (xpProgress?.leveledUp) {
        pushNotification(
          req.app,
          user._id,
          'level_up',
          `Chúc mừng! Bạn đã đạt cấp ${xpProgress.level}.`,
        ).catch((error) => console.error('Level-up notification error:', error));
      }

      sendAchievementNotifications(req.app, user._id, unlockedAchievements);
    });

    return res.json(payload);
  } catch (err) {
    await session.abortTransaction();

    if (err?.status === 400) {
      return res.status(400).json({ error: err.error || err.message });
    }

    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    session.endSession();
  }
};
