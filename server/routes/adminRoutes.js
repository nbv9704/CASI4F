// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const GameHistory = require('../models/GameHistory');
const PvpRoom = require('../models/PvpRoom');
const GameConfig = require('../models/GameConfig');
const { getLastSweepAt } = require('../cron/cleanupRooms');

/**
 * GET /api/admin/dashboard
 * Get dashboard overview statistics
 */
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    const now = Date.now();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalUsers,
      newUsersToday,
      totalBalance,
      activeGames,
      transactions24h,
      recentUsers,
      topBalances,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: last24h } }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } }
      ]),
      PvpRoom.countDocuments({ status: 'active' }),
      Transaction.countDocuments({ createdAt: { $gte: last24h } }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email role createdAt balance')
        .lean(),
      User.find()
        .sort({ balance: -1 })
        .limit(5)
        .select('username balance level')
        .lean(),
    ]);

    res.json({
      ok: true,
      stats: {
        totalUsers,
        newUsersToday,
        totalBalance: totalBalance[0]?.total || 0,
        activeGames,
        transactions24h,
      },
      recentUsers,
      topBalances,
      serverNow: now,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/admin/metrics
 * Get detailed system metrics
 */
router.get('/metrics', auth, admin, async (req, res) => {
  try {
    const now = Date.now();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      userStats,
      gameStats,
      transactionStats,
      pvpStats,
    ] = await Promise.all([
      // User metrics
      Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: last24h } }),
        User.countDocuments({ createdAt: { $gte: last7d } }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
      ]),
      
      // Game metrics
      Promise.all([
        GameHistory.countDocuments(),
        GameHistory.countDocuments({ createdAt: { $gte: last24h } }),
        GameHistory.aggregate([
          { $match: { createdAt: { $gte: last24h } } },
          { $group: { _id: '$game', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]),

      // Transaction metrics
      Promise.all([
        Transaction.countDocuments(),
        Transaction.countDocuments({ createdAt: { $gte: last24h } }),
        Transaction.aggregate([
          { $match: { createdAt: { $gte: last24h } } },
          { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } },
        ]),
      ]),

      // PVP metrics
      Promise.all([
        PvpRoom.countDocuments(),
        PvpRoom.countDocuments({ status: 'active' }),
        PvpRoom.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]),
    ]);

    res.json({
      ok: true,
      users: {
        total: userStats[0],
        new24h: userStats[1],
        new7d: userStats[2],
        byRole: userStats[3].reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      },
      games: {
        total: gameStats[0],
        played24h: gameStats[1],
        byGame24h: gameStats[2],
      },
      transactions: {
        total: transactionStats[0],
        count24h: transactionStats[1],
        byType24h: transactionStats[2],
      },
      pvp: {
        total: pvpStats[0],
        active: pvpStats[1],
        byStatus: pvpStats[2].reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      },
      system: {
        uptimeSec: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
      serverNow: now,
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/admin/users
 * Get all users with filters
 */
router.get('/users', auth, admin, async (req, res) => {
  try {
    const { role, search, limit = 100 } = req.query;

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('username email role balance level xp createdAt')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      ok: true,
      users,
      count: users.length,
    });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:userId
 * Update user data
 */
router.patch('/users/:userId', auth, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance, level, role } = req.body;

    const updates = {};
    if (balance !== undefined) updates.balance = Number(balance);
    if (level !== undefined) updates.level = Number(level);
    if (role !== undefined) {
      if (!['user', 'jadmin', 'admin'].includes(role)) {
        return res.status(400).json({ ok: false, error: 'Invalid role' });
      }
      updates.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: 'username email role balance level' }
    );

    if (!updatedUser) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({
      ok: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete a user
 */
router.delete('/users/:userId', auth, admin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ ok: false, error: 'Cannot delete yourself' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({
      ok: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/admin/transactions
 * Get all transactions with stats
 */
router.get('/transactions', auth, admin, async (req, res) => {
  try {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    const [transactions, stats] = await Promise.all([
      Transaction.find()
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
      
      Promise.all([
        // Total volume (sum of all absolute amounts)
        Transaction.aggregate([
          { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
        ]),
        // Total credits (positive amounts)
        Transaction.aggregate([
          { $match: { amount: { $gt: 0 } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        // Total debits (negative amounts)
        Transaction.aggregate([
          { $match: { amount: { $lt: 0 } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        // Today's transaction count
        Transaction.countDocuments({ createdAt: { $gte: new Date(startOfDay) } }),
      ]),
    ]);

    res.json({
      ok: true,
      transactions,
      stats: {
        totalVolume: stats[0][0]?.total || 0,
        totalCredits: stats[1][0]?.total || 0,
        totalDebits: Math.abs(stats[2][0]?.total || 0),
        today: stats[3],
      },
    });
  } catch (err) {
    console.error('Admin get transactions error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/admin/games/config
 * Get game configurations
 */
router.get('/games/config', auth, admin, async (req, res) => {
  try {
    const gameIds = [
      'coinflip', 'dice', 'blackjackdice', 'dicepoker', 
      'higherlower', 'luckyfive', 'slots', 'mines', 'tower', 'roulette'
    ];

    // Get all configs or create defaults
    const configs = await Promise.all(
      gameIds.map(async (gameId) => {
        let config = await GameConfig.findOne({ gameId });
        
        if (!config) {
          // Return default but don't save yet
          const defaults = {
            coinflip: { name: 'Coinflip', multiplier: 2.0, minBet: 1, maxBet: 10000 },
            dice: { name: 'Dice', multiplier: 1.98, minBet: 1, maxBet: 10000 },
            blackjackdice: { name: 'Blackjack Dice', multiplier: 1.5, minBet: 1, maxBet: 5000 },
            dicepoker: { name: 'Dice Poker', multiplier: 2.0, minBet: 1, maxBet: 5000 },
            higherlower: { name: 'Higher/Lower', multiplier: 1.5, minBet: 1, maxBet: 10000 },
            luckyfive: { name: 'Lucky Five', multiplier: 5.0, minBet: 1, maxBet: 5000 },
            slots: { name: 'Slots', multiplier: 10.0, minBet: 1, maxBet: 1000 },
            mines: { name: 'Mines', multiplier: 24.0, minBet: 1, maxBet: 1000 },
            tower: { name: 'Tower', multiplier: 100.0, minBet: 1, maxBet: 1000 },
            roulette: { name: 'Roulette', multiplier: 36.0, minBet: 1, maxBet: 5000 },
          };
          
          return {
            id: gameId,
            ...defaults[gameId],
            enabled: true,
          };
        }
        
        return {
          id: config.gameId,
          name: config.name,
          multiplier: config.multiplier,
          minBet: config.minBet,
          maxBet: config.maxBet,
          enabled: config.enabled,
        };
      })
    );

    res.json({
      ok: true,
      configs,
    });
  } catch (err) {
    console.error('Admin get game config error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/admin/games/config
 * Save game configurations
 */
router.post('/games/config', auth, admin, async (req, res) => {
  try {
    const { configs } = req.body;

    if (!configs || !Array.isArray(configs)) {
      return res.status(400).json({ ok: false, error: 'Invalid configs format' });
    }

    // Validate and save each config
    const savedConfigs = [];
    for (const config of configs) {
      if (!config.id || !config.name) {
        return res.status(400).json({ ok: false, error: 'Invalid config data' });
      }
      if (config.multiplier < 1 || config.multiplier > 1000) {
        return res.status(400).json({ ok: false, error: 'Invalid multiplier value' });
      }
      if (config.minBet < 1 || config.maxBet < config.minBet) {
        return res.status(400).json({ ok: false, error: 'Invalid bet limits' });
      }

      // Upsert the config
      const savedConfig = await GameConfig.findOneAndUpdate(
        { gameId: config.id },
        {
          gameId: config.id,
          name: config.name,
          enabled: config.enabled !== undefined ? config.enabled : true,
          multiplier: config.multiplier,
          minBet: config.minBet,
          maxBet: config.maxBet,
          updatedBy: req.user.id,
        },
        { upsert: true, new: true }
      );

      savedConfigs.push(savedConfig);
    }

    const io = req.app.get('io');
    if (io) {
      const payload = savedConfigs.map((cfg) => ({
        gameId: cfg.gameId,
        enabled: cfg.enabled,
        minBet: cfg.minBet,
        maxBet: cfg.maxBet,
        multiplier: cfg.multiplier,
        updatedAt: cfg.updatedAt,
      }));
      io.emit('game:configUpdated', { configs: payload });
    }

    res.json({
      ok: true,
      message: 'Game configurations saved successfully',
      configs: savedConfigs,
    });
  } catch (err) {
    console.error('Admin save game config error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/admin/reports
 * Get system reports and analytics
 */
router.get('/reports', auth, admin, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const now = Date.now();
    
    let startDate;
    switch (range) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const [
      totalUsers,
      newUsers,
      gamesInRange,
      totalGames,
      transactions,
      topPlayers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      GameHistory.countDocuments({ createdAt: { $gte: startDate } }),
      GameHistory.countDocuments(),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: { $abs: '$amount' } },
            totalBets: { $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] } },
            totalWins: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
            count: { $sum: 1 },
          },
        },
      ]),
      GameHistory.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$userId',
            gamesPlayed: { $sum: 1 },
            totalWagered: { $sum: '$betAmount' },
            netProfit: { $sum: '$payout' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $sort: { totalWagered: -1 } },
        { $limit: 10 },
        {
          $project: {
            username: '$user.username',
            gamesPlayed: 1,
            totalWagered: 1,
            netProfit: 1,
          },
        },
      ]),
    ]);

    const txData = transactions[0] || { totalVolume: 0, totalBets: 0, totalWins: 0, count: 0 };
    const houseEdge = txData.totalBets > 0 
      ? ((txData.totalBets - txData.totalWins) / txData.totalBets * 100).toFixed(2)
      : 0;

    // Top games
    const topGames = await GameHistory.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$game', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', plays: 1, _id: 0 } },
    ]);

    res.json({
      ok: true,
      overview: {
        totalUsers,
        userGrowth: newUsers > 0 ? ((newUsers / Math.max(totalUsers - newUsers, 1)) * 100).toFixed(1) : 0,
        gamesPlayed: gamesInRange,
        gamesGrowth: totalGames > 0 ? ((gamesInRange / Math.max(totalGames - gamesInRange, 1)) * 100).toFixed(1) : 0,
        totalVolume: txData.totalVolume,
        volumeGrowth: 0, // Would need historical data
        activeRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0,
        activeRateChange: 0,
      },
      userActivity: {
        newUsers,
        dau: Math.ceil(newUsers / (range === '24h' ? 1 : range === '7d' ? 7 : 30)),
        mau: newUsers,
        avgSession: 45, // Mock data - would need session tracking
        retention: 75, // Mock data
      },
      gamePerformance: {
        topGames,
      },
      revenue: {
        totalBets: txData.totalBets,
        totalWins: txData.totalWins,
        houseEdge,
        txCount: txData.count,
        avgBet: gamesInRange > 0 ? Math.round(txData.totalBets / gamesInRange) : 0,
      },
      systemHealth: {
        uptime: 99.9,
        apiLatency: 85,
        errorRate: 0.1,
        activeConnections: 150,
        dbLatency: 12,
      },
      topPlayers,
      timeRange: range,
      generatedAt: now,
    });
  } catch (err) {
    console.error('Admin reports error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/admin/pvp/health
 * Get PVP health monitoring (merged from adminPvpRoutes)
 */
router.get('/pvp/health', auth, admin, async (req, res) => {
  try {
    const countsAgg = await PvpRoom.aggregate([
      { $group: { _id: '$status', n: { $sum: 1 } } },
    ]);
    const byStatus = {};
    countsAgg.forEach((c) => (byStatus[c._id] = c.n));

    const now = Date.now();
    const sweepIntervalMs = Number(process.env.PVP_SWEEP_INTERVAL_MS) || 60000;
    const lastSweepAt = getLastSweepAt();
    const nextSweepAt = lastSweepAt ? lastSweepAt + sweepIntervalMs : null;

    const staleCoinflips = await PvpRoom.countDocuments({
      status: 'active',
      game: 'coinflip',
      'metadata.pendingCoin.revealAt': { $lt: now },
    });
    const staleDice = await PvpRoom.countDocuments({
      status: 'active',
      game: 'dice',
      'metadata.pending.advanceAt': { $lt: now },
    });

    res.json({
      ok: true,
      serverNow: now,
      serverNowIso: new Date(now).toISOString(),
      counts: byStatus,
      stale: { coinflip: staleCoinflips, dice: staleDice },
      cron: {
        sweepIntervalMs,
        lastSweepAt,
        lastSweepIso: lastSweepAt ? new Date(lastSweepAt).toISOString() : null,
        nextSweepAt,
        nextSweepIso: nextSweepAt ? new Date(nextSweepAt).toISOString() : null,
      },
      uptimeSec: Math.floor(process.uptime()),
    });
  } catch (err) {
    console.error('Admin PVP health error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
