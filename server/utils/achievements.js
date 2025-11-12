// server/utils/achievements.js
const definitions = require('../config/achievementMilestones');
const { pushNotification } = require('./notify');

const STAT_KEY_TOKEN = '__DOT__';
const STAT_KEY_REGEX = /\./g;

function encodeStatKey(key) {
  if (typeof key !== 'string' || key.length === 0) return '';
  return key.replace(STAT_KEY_REGEX, STAT_KEY_TOKEN);
}

function normalizeCode(code) {
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
}

function ensureAchievementArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((entry) => entry && typeof entry.code === 'string');
}

function ensureStatsMap(user) {
  if (!user) return new Map();

  const stats = user.achievementStats;

  if (stats && typeof stats.get === 'function') {
    if (typeof stats.forEach === 'function') {
      const updates = [];
      stats.forEach((value, key) => {
        const safeKey = encodeStatKey(key);
        if (safeKey !== key) {
          updates.push([key, safeKey, Number(value) || 0]);
        }
      });
      if (updates.length) {
        updates.forEach(([originalKey, safeKey, value]) => {
          stats.delete(originalKey);
          stats.set(safeKey, value);
        });
        user.markModified?.('achievementStats');
      }
    }
    return stats;
  }

  const map = new Map();
  if (stats && typeof stats === 'object') {
    for (const [key, value] of Object.entries(stats)) {
      const safeKey = encodeStatKey(key);
      map.set(safeKey, Number(value) || 0);
    }
  }
  user.achievementStats = map;
  user.markModified?.('achievementStats');
  return map;
}

function getCounterValue(user, key) {
  if (!key) return 0;
  const stats = ensureStatsMap(user);
  const current = stats.get(encodeStatKey(key));
  return Number.isFinite(current) ? current : 0;
}

function incrementAchievementCounter(user, key, amount = 1) {
  if (!user || !key) return 0;
  const stats = ensureStatsMap(user);
  const encodedKey = encodeStatKey(key);
  const prev = Number.isFinite(stats.get(encodedKey)) ? stats.get(encodedKey) : 0;
  const next = prev + amount;
  stats.set(encodedKey, next);
  user.markModified?.('achievementStats');
  return next;
}

function ensureProfileBadgesArray(user) {
  if (!user) return [];
  if (Array.isArray(user.profileBadges)) {
    return user.profileBadges;
  }
  user.profileBadges = [];
  return user.profileBadges;
}

function grantBadgeToUser(user, badgeCode) {
  const code = normalizeCode(badgeCode);
  if (!user || !code) return { granted: false, code: null };

  const badges = ensureProfileBadgesArray(user);
  const hasBadge = badges.some((entry) => normalizeCode(entry) === code);
  if (hasBadge) {
    return { granted: false, code };
  }

  user.profileBadges = [...badges, code];
  user.markModified?.('profileBadges');
  return { granted: true, code };
}

function buildUnlockedPayload(definition, progressValue, badgeReward, badgeGranted) {
  return {
    code: definition.code,
    level: definition.type === 'level' ? definition.level : undefined,
    threshold: definition.type === 'counter' ? definition.threshold : undefined,
    value: progressValue,
    title: definition.title,
    message: definition.message,
    link: definition.link,
    badgeReward: badgeReward || undefined,
    badgeGranted: badgeReward ? !!badgeGranted : undefined,
  };
}

/**
 * Evaluate automatic achievements based on provided context and mutate the given user document when new ones unlock.
 * @param {import('../models/User')} user
 * @param {{ level?: number }} context
 * @returns {Array<{ code: string, level?: number, threshold?: number, value?: number, title?: string, message?: string, link?: string }>}
 */
function evaluateAchievements(user, context = {}) {
  if (!user) return [];

  const owned = new Set(
    ensureAchievementArray(user.achievements).map((entry) => normalizeCode(entry.code))
  );

  const unlocked = [];
  const nextAchievements = ensureAchievementArray(user.achievements).slice();
  const currentLevel = Number.isFinite(context.level) ? context.level : user.level;

  for (const definition of definitions) {
    const code = normalizeCode(definition.code);
    if (!code || owned.has(code)) continue;

    const type = definition.type || 'level';
    let achieved = false;
    let progressValue = null;

    if (type === 'level') {
      const requiredLevel = Number(definition.level);
      if (Number.isFinite(requiredLevel) && Number.isFinite(currentLevel) && currentLevel >= requiredLevel) {
        achieved = true;
        progressValue = currentLevel;
      }
    } else if (type === 'counter') {
      const threshold = Number(definition.threshold);
      if (Number.isFinite(threshold) && definition.counter) {
        const counterValue = getCounterValue(user, definition.counter);
        progressValue = counterValue;
        if (counterValue >= threshold) {
          achieved = true;
        }
      }
    }

    if (!achieved) continue;

    let badgeInfo = { granted: false, code: null };
    if (definition.rewardBadge) {
      badgeInfo = grantBadgeToUser(user, definition.rewardBadge);
    }

    nextAchievements.push({
      code,
      earnedAt: new Date(),
      completed: true,
      progress: progressValue,
    });
    owned.add(code);
    unlocked.push(
      buildUnlockedPayload(definition, progressValue, badgeInfo.code || definition.rewardBadge, badgeInfo.granted)
    );
  }

  if (unlocked.length) {
    user.achievements = nextAchievements;
    user.markModified?.('achievements');
  }

  return unlocked;
}

function sendAchievementNotifications(app, userId, achievements) {
  if (!app || !achievements || !achievements.length) return;

  achievements.forEach((achievement) => {
    const message =
      achievement.message ||
      (achievement.level
        ? `Bạn đã mở khóa thành tựu cấp ${achievement.level}.`
        : 'Bạn đã mở khóa thành tựu mới.');

    pushNotification(app, userId, 'achievement_unlocked', message, {
      metadata: {
        code: achievement.code,
        level: achievement.level,
        threshold: achievement.threshold,
        value: achievement.value,
        badge: achievement.badgeReward,
        badgeGranted: achievement.badgeGranted,
      },
      link: achievement.link,
    }).catch((error) => console.error('Achievement notification error:', error));
  });
}

module.exports = {
  evaluateAchievements,
  sendAchievementNotifications,
  incrementAchievementCounter,
  grantBadgeToUser,
};
