// server/controllers/historyController.js
const GameHistory = require('../models/GameHistory');
const mongoose = require('mongoose');

const { Types } = mongoose;
const MAX_STREAK_SAMPLE = 5000;

const OUTCOME_WIN = 'win';
const OUTCOME_LOSE = 'lose';
const OUTCOME_TIE = 'tie';

function parseDate(value, { endOfDay = false } = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function buildFilters(query = {}) {
  const from = parseDate(query.from);
  const to = parseDate(query.to, { endOfDay: true });
  const game = typeof query.game === 'string' && query.game !== 'all' && query.game.trim() ? query.game.trim() : null;
  const outcome = typeof query.outcome === 'string' && query.outcome !== 'all' && query.outcome.trim()
    ? query.outcome.trim()
    : null;

  return { from, to, game, outcome };
}

function buildMatch(userId, filters) {
  const match = { user: new Types.ObjectId(userId) };

  if (filters.from || filters.to) {
    match.createdAt = {};
    if (filters.from) {
      match.createdAt.$gte = filters.from;
    }
    if (filters.to) {
      match.createdAt.$lte = filters.to;
    }
  }

  if (filters.game) {
    match.game = filters.game;
  }

  if (filters.outcome) {
    match.outcome = filters.outcome;
  }

  return match;
}

function computeStreaks(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      current: { type: null, length: 0 },
      bestWin: 0,
      bestLose: 0,
    };
  }

  let currentWin = 0;
  let currentLose = 0;
  let bestWin = 0;
  let bestLose = 0;

  records.forEach((record) => {
    switch (record.outcome) {
      case OUTCOME_WIN:
        currentWin += 1;
        currentLose = 0;
        if (currentWin > bestWin) {
          bestWin = currentWin;
        }
        break;
      case OUTCOME_LOSE:
        currentLose += 1;
        currentWin = 0;
        if (currentLose > bestLose) {
          bestLose = currentLose;
        }
        break;
      default:
        currentLose = 0;
        currentWin = 0;
        break;
    }
  });

  const last = records[records.length - 1];
  let currentType = null;
  let currentLength = 0;
  if (last) {
    if (last.outcome === OUTCOME_WIN) {
      currentType = OUTCOME_WIN;
      currentLength = currentWin;
    } else if (last.outcome === OUTCOME_LOSE) {
      currentType = OUTCOME_LOSE;
      currentLength = currentLose;
    } else {
      currentType = OUTCOME_TIE;
      currentLength = 0;
    }
  }

  return {
    current: { type: currentType, length: currentLength },
    bestWin,
    bestLose,
  };
}

exports.getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (safePage - 1) * safeLimit;

    const filters = buildFilters(req.query);
    const match = buildMatch(id, filters);

    const [history, total] = await Promise.all([
      GameHistory.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select('game betAmount outcome payout createdAt experienceGain')
        .lean(),
      GameHistory.countDocuments(match),
    ]);

    res.json({
      history,
      total,
      page: safePage,
      limit: safeLimit,
      filters: {
        from: filters.from ? filters.from.toISOString() : null,
        to: filters.to ? filters.to.toISOString() : null,
        game: filters.game,
        outcome: filters.outcome,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getHistoryAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filters = buildFilters(req.query);
    const match = buildMatch(id, filters);

    const pipeline = [
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRounds: { $sum: 1 },
                totalBet: { $sum: '$betAmount' },
                totalPayout: { $sum: '$payout' },
                totalXp: { $sum: '$experienceGain' },
              },
            },
          ],
          outcomes: [
            {
              $group: {
                _id: '$outcome',
                count: { $sum: 1 },
              },
            },
          ],
          games: [
            {
              $group: {
                _id: '$game',
                rounds: { $sum: 1 },
                totalBet: { $sum: '$betAmount' },
                totalPayout: { $sum: '$payout' },
                totalXp: { $sum: '$experienceGain' },
                wins: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', OUTCOME_WIN] }, 1, 0],
                  },
                },
                losses: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', OUTCOME_LOSE] }, 1, 0],
                  },
                },
              },
            },
            { $sort: { rounds: -1 } },
          ],
          timeline: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                totalBet: { $sum: '$betAmount' },
                totalPayout: { $sum: '$payout' },
                totalXp: { $sum: '$experienceGain' },
                wins: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', OUTCOME_WIN] }, 1, 0],
                  },
                },
                losses: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', OUTCOME_LOSE] }, 1, 0],
                  },
                },
                ties: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', OUTCOME_TIE] }, 1, 0],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ];

    const aggregate = await GameHistory.aggregate(pipeline);
    const facets = aggregate?.[0] || {};

    const totalsDoc = facets.totals?.[0] || {
      totalRounds: 0,
      totalBet: 0,
      totalPayout: 0,
      totalXp: 0,
    };

    const totals = {
      rounds: totalsDoc.totalRounds || 0,
      totalBet: totalsDoc.totalBet || 0,
      totalPayout: totalsDoc.totalPayout || 0,
      netProfit: (totalsDoc.totalPayout || 0) - (totalsDoc.totalBet || 0),
      totalXp: totalsDoc.totalXp || 0,
      avgBet:
        totalsDoc.totalRounds > 0
          ? (totalsDoc.totalBet || 0) / totalsDoc.totalRounds
          : 0,
    };

    const outcomeCounts = { win: 0, lose: 0, tie: 0 };
    (facets.outcomes || []).forEach((item) => {
      if (!item || !item._id) return;
      outcomeCounts[item._id] = item.count || 0;
    });

    const games = (facets.games || []).map((item) => {
      const rounds = item.rounds || 0;
      const wins = item.wins || 0;
      const losses = item.losses || 0;
      const profit = (item.totalPayout || 0) - (item.totalBet || 0);
      return {
        game: item._id,
        rounds,
        wins,
        losses,
        winRate: rounds > 0 ? wins / rounds : 0,
        totalBet: item.totalBet || 0,
        totalPayout: item.totalPayout || 0,
        netProfit: profit,
        totalXp: item.totalXp || 0,
      };
    });

    const timeline = (facets.timeline || []).map((item) => ({
      date: item._id,
      totalBet: item.totalBet || 0,
      totalPayout: item.totalPayout || 0,
      netProfit: (item.totalPayout || 0) - (item.totalBet || 0),
      totalXp: item.totalXp || 0,
      wins: item.wins || 0,
      losses: item.losses || 0,
      ties: item.ties || 0,
    }));

    const streakSampleLimit = Math.min(
      MAX_STREAK_SAMPLE,
      Math.max(100, parseInt(req.query.streakSample || MAX_STREAK_SAMPLE, 10) || MAX_STREAK_SAMPLE)
    );

    const streakEvents = await GameHistory.find(match)
      .sort({ createdAt: 1 })
      .select('outcome')
      .limit(streakSampleLimit)
      .lean();

    const streaks = computeStreaks(streakEvents);

    res.json({
      totals,
      outcomes: outcomeCounts,
      games,
      timeline,
      streaks: {
        ...streaks,
        sampleSize: streakEvents.length,
        sampleLimit: streakSampleLimit,
      },
      filters: {
        from: filters.from ? filters.from.toISOString() : null,
        to: filters.to ? filters.to.toISOString() : null,
        game: filters.game,
        outcome: filters.outcome,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
