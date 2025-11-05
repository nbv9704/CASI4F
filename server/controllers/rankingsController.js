// server/controllers/rankingsController.js
const mongoose = require('mongoose');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

const { Types } = mongoose;

const PERIOD_RESOLVERS = {
  daily: () => {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    return start;
  },
  weekly: () => {
    const now = new Date();
    const start = new Date(now);
    const currentDay = start.getUTCDay();
    const diff = (currentDay + 6) % 7; // Convert Sunday (0) to 6, Monday (1) -> 0
    start.setUTCDate(start.getUTCDate() - diff);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  },
  monthly: () => {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  },
};

function resolvePeriod(periodKey) {
  const normalized = (periodKey || '').toLowerCase();
  if (PERIOD_RESOLVERS[normalized]) {
    return { key: normalized, start: PERIOD_RESOLVERS[normalized]() };
  }
  return { key: 'daily', start: PERIOD_RESOLVERS.daily() };
}

function clampLimit(value, fallback = 15) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 100);
}

function toNumber(value) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

exports.getRankings = async (req, res) => {
  const { key: period, start } = resolvePeriod(req.query.period);
  const limit = clampLimit(req.query.limit);

  const rangeMatch = start ? { createdAt: { $gte: start } } : {};

  const baseResponse = {
    period,
    range: {
      from: start,
      to: new Date(),
    },
    summary: {
      playersTracked: 0,
      totalProfit: 0,
      bestWinStreak: 0,
    },
    rankings: [],
  };

  try {
    const history = await GameHistory.find(rangeMatch)
      .sort({ createdAt: 1 })
      .select('user betAmount payout outcome createdAt')
      .lean();

    if (!history.length) {
      return res.json(baseResponse);
    }

    const stats = new Map();
    let aggregatedProfit = 0;
    let bestWinStreak = 0;

    for (const entry of history) {
      const userId = entry.user?.toString();
      if (!userId) continue;

      const net = toNumber(entry.payout) - toNumber(entry.betAmount);
      const createdAt = entry.createdAt instanceof Date
        ? entry.createdAt
        : new Date(entry.createdAt);

      const record = stats.get(userId) || {
        games: 0,
        profit: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastOutcome: null,
        lastGameAt: null,
      };

      record.games += 1;
      record.profit += net;
      if (entry.outcome === 'win') {
        record.wins += 1;
        record.currentStreak = record.lastOutcome === 'win' ? record.currentStreak + 1 : 1;
      } else {
        record.currentStreak = 0;
      }
      record.bestStreak = Math.max(record.bestStreak, record.currentStreak);
      record.lastOutcome = entry.outcome;
      record.lastGameAt = createdAt;

      stats.set(userId, record);

      if (record.bestStreak > bestWinStreak) {
        bestWinStreak = record.bestStreak;
      }
      aggregatedProfit += net;
    }

    const userIds = Array.from(stats.keys()).map((id) => new Types.ObjectId(id));

    const users = await User.find({ _id: { $in: userIds } })
      .select('username')
      .lean();

    const userMap = new Map(users.map((user) => [user._id.toString(), user.username]));

    const rankings = Array.from(stats.entries())
      .map(([userId, record]) => ({
        userId,
        name: userMap.get(userId) || null,
        games: record.games,
        wins: record.wins,
        profit: Number(record.profit.toFixed(2)),
        streak: record.bestStreak,
        lastGameAt: record.lastGameAt,
      }))
      .sort((a, b) => {
        if (b.profit !== a.profit) return b.profit - a.profit;
        if (b.streak !== a.streak) return b.streak - a.streak;
        if (b.games !== a.games) return b.games - a.games;
        const timeA = a.lastGameAt ? a.lastGameAt.getTime() : 0;
        const timeB = b.lastGameAt ? b.lastGameAt.getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, limit)
      .map(({ lastGameAt, ...rest }) => rest);

    return res.json({
      ...baseResponse,
      summary: {
        playersTracked: stats.size,
        totalProfit: Number(aggregatedProfit.toFixed(2)),
        bestWinStreak: bestWinStreak,
      },
      rankings,
    });
  } catch (error) {
    console.error('Failed to load rankings:', error);
    return res.status(500).json({
      code: 'RANKINGS_FETCH_FAILED',
      message: 'Failed to load rankings',
    });
  }
};
