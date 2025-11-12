const mongoose = require('mongoose');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const achievementCatalog = require('../config/achievementCatalog');
const badgeCatalog = require('../config/badgeCatalog');
const { AppError } = require('../utils/AppError');
const { ErrorCodes } = require('../utils/ErrorCodes');
const { getExpToNextLevel } = require('../config/leveling');

const MAX_SHOWCASE = 3;

const normalizeCode = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase() : '';

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const defaultSocialLinks = () => ({
  discord: '',
  twitter: '',
  twitch: '',
  youtube: '',
});

const STATUS_STATES = ['online', 'offline', 'busy', 'idle'];
const DEFAULT_STATUS_STATE = 'online';
const MIN_STATUS_DURATION_MINUTES = 5;
const MAX_STATUS_DURATION_MINUTES = 1440;
const DEFAULT_STATUS_DURATION_MINUTES = 60;

const normalizeStatusState = (value) =>
  STATUS_STATES.includes(value) ? value : DEFAULT_STATUS_STATE;

const ensureStatusFreshness = (userDoc) => {
  if (!userDoc) return false;
  const expiresAt = userDoc.statusMessageExpiresAt
    ? new Date(userDoc.statusMessageExpiresAt)
    : null;
  if (!expiresAt) return false;

  const now = new Date();
  if (expiresAt > now) return false;

  userDoc.statusMessage = '';
  userDoc.statusMessageExpiresAt = null;
  return true;
};

const toPlainUser = (userDoc) =>
  userDoc?.toObject({ getters: false, virtuals: false, depopulate: true }) || userDoc;

const sanitizeSingleLine = (value, max) => {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
};

const sanitizeMultiLine = (value, max) => {
  if (typeof value !== 'string') return '';
  const normalized = value.replace(/\r\n/g, '\n').trim();
  return normalized.length > max ? normalized.slice(0, max) : normalized;
};

const sanitizeSocialLink = (value, field) => {
  if (value == null) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch (error) {
      throw new AppError(
        ErrorCodes.PROFILE_SOCIAL_LINK_INVALID,
        400,
        'Invalid social link URL',
        { field }
      );
    }
  }

  if (trimmed.startsWith('@')) {
    return trimmed.slice(0, 64);
  }

  if (/\s/.test(trimmed)) {
    throw new AppError(
      ErrorCodes.PROFILE_SOCIAL_LINK_INVALID,
      400,
      'Invalid social link',
      { field }
    );
  }

  return trimmed.slice(0, 120);
};

function mergeStaticAndDb(staticCatalog, dbDocs) {
  const map = new Map();

  for (const entry of staticCatalog || []) {
    const code = normalizeCode(entry.code);
    if (!code) continue;
    map.set(code, { ...entry, code });
  }

  for (const doc of dbDocs || []) {
    if (!doc?.code) continue;
    const code = normalizeCode(doc.code);
    const base = map.get(code) || {};
    map.set(code, { ...base, ...doc, code });
  }

  return Array.from(map.values()).map((item) => {
    const clone = { ...item };
    clone.code = normalizeCode(clone.code);
    if (clone.badgeUnlock) {
      clone.badgeUnlock = normalizeCode(clone.badgeUnlock);
    }
    return clone;
  });
}

async function loadCatalogs() {
  const [dbAchievements, dbBadges] = await Promise.all([
    Achievement.find().lean().exec(),
    Badge.find().lean().exec(),
  ]);

  const achievements = mergeStaticAndDb(achievementCatalog, dbAchievements);
  const badges = mergeStaticAndDb(badgeCatalog, dbBadges);

  const achievementMap = new Map();
  for (const item of achievements) {
    if (!item?.code) continue;
    achievementMap.set(normalizeCode(item.code), item);
  }

  const badgeMap = new Map();
  for (const badge of badges) {
    if (!badge?.code) continue;
    badgeMap.set(normalizeCode(badge.code), badge);
  }

  return {
    achievements,
    badges,
    achievementMap,
    badgeMap,
  };
}

const buildBaseProfile = (user) => {
  const level = Number.isFinite(user.level) && user.level > 0 ? user.level : 1;
  const experience =
    Number.isFinite(user.experience) && user.experience >= 0 ? user.experience : 0;
  const nextLevelExp = getExpToNextLevel(level);

  const social = { ...defaultSocialLinks(), ...(user.socialLinks || {}) };

  const statusState = normalizeStatusState(user.statusState);
  const rawMessage = typeof user.statusMessage === 'string' ? user.statusMessage : '';
  const expiresAtRaw = user.statusMessageExpiresAt
    ? new Date(user.statusMessageExpiresAt)
    : null;
  const now = new Date();
  const isMessageExpired = rawMessage && expiresAtRaw && expiresAtRaw <= now;
  const statusMessage = isMessageExpired ? '' : rawMessage;
  const status = {
    state: statusState,
    message: statusMessage,
    messageExpiresAt: statusMessage ? expiresAtRaw : null,
  };

  return {
    id: String(user._id),
    username: user.username,
    avatar: user.avatar || '',
    bio: user.bio || '',
    statusMessage,
    status,
    profileVisibility: user.profileVisibility || 'public',
    level,
    experience,
    nextLevelExp,
    createdAt: user.createdAt || user.updatedAt || new Date(),
    socialLinks: Object.keys(social).reduce((acc, key) => {
      acc[key] = social[key] || '';
      return acc;
    }, {}),
  };
};

const composeAchievements = (user, catalogs, options = {}) => {
  const {
    includeLocked = true,
    hideHiddenIfLocked = false,
    requireCompletedForShowcase = true,
  } = options;

  const userAchievements = ensureArray(user.achievements).reduce((map, entry) => {
    const code = normalizeCode(entry.code);
    if (!code || map.has(code)) return map;
    map.set(code, {
      code,
      completed: entry.completed !== false,
      progress: entry.progress ?? null,
      earnedAt: entry.earnedAt ? new Date(entry.earnedAt) : null,
    });
    return map;
  }, new Map());

  const list = [];

  for (const meta of catalogs.achievements) {
    const code = normalizeCode(meta.code);
    if (!code) continue;
    const owned = userAchievements.get(code);
    const completed = !!owned?.completed;

    if (!includeLocked && !completed) continue;
    if (hideHiddenIfLocked && meta.isHidden && !completed) continue;

    list.push({
      code,
      name: meta.name,
      description: meta.description || '',
      icon: meta.icon || '',
      category: meta.category || 'general',
      xpReward: Number.isFinite(meta.xpReward) ? meta.xpReward : 0,
      badgeUnlock: meta.badgeUnlock ? normalizeCode(meta.badgeUnlock) : null,
      isHidden: !!meta.isHidden,
      completed,
      progress: owned?.progress ?? null,
      earnedAt: completed && owned?.earnedAt ? owned.earnedAt : null,
      metadataMissing: false,
    });
    userAchievements.delete(code);
  }

  for (const [code, owned] of userAchievements.entries()) {
    if (!includeLocked && !owned.completed) continue;
    list.push({
      code,
      name: code,
      description: '',
      icon: '',
      category: 'general',
      xpReward: 0,
      badgeUnlock: null,
      isHidden: false,
      completed: !!owned.completed,
      progress: owned.progress ?? null,
      earnedAt: owned.completed && owned.earnedAt ? owned.earnedAt : null,
      metadataMissing: true,
    });
  }

  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const totals = {
    total: list.length,
    completed: list.filter((item) => item.completed).length,
  };

  const showcase = [];
  const seen = new Set();
  const existingPins = ensureArray(user.achievementShowcase).reduce((map, item) => {
    const code = normalizeCode(item.code);
    if (!code || map.has(code)) return map;
    map.set(code, item.pinnedAt ? new Date(item.pinnedAt) : new Date());
    return map;
  }, new Map());

  for (const [code, pinnedAt] of existingPins.entries()) {
    if (showcase.length >= MAX_SHOWCASE) break;
    if (seen.has(code)) continue;
    seen.add(code);

    const entry = list.find((item) => item.code === code);
    if (!entry) continue;
    if (requireCompletedForShowcase && !entry.completed) continue;

    showcase.push({
      code: entry.code,
      name: entry.name,
      description: entry.description,
      icon: entry.icon,
      category: entry.category,
      earnedAt: entry.earnedAt,
      pinnedAt,
    });
  }

  return { list, showcase, totals };
};

const composeBadges = (user, catalogs, achievementsPayload, options = {}) => {
  const { includeCatalog = false } = options;

  const badgeUnlockTime = achievementsPayload.list.reduce((map, ach) => {
    if (!ach.badgeUnlock || !ach.completed) return map;
    if (!map.has(ach.badgeUnlock)) {
      map.set(ach.badgeUnlock, ach.earnedAt || null);
    }
    return map;
  }, new Map());

  const ownedSet = new Set();
  const owned = [];

  for (const rawCode of ensureArray(user.profileBadges)) {
    const code = normalizeCode(rawCode);
    if (!code || ownedSet.has(code)) continue;
    ownedSet.add(code);

    const meta = catalogs.badgeMap.get(code);
    owned.push({
      code,
      name: meta?.name || code,
      description: meta?.description || '',
      icon: meta?.icon || '',
      tier: meta?.tier || 'common',
      isExclusive: !!meta?.isExclusive,
      unlockedAt: badgeUnlockTime.get(code) || null,
    });
  }

  const activeCode = normalizeCode(user.activeBadge);
  let active = null;
  if (activeCode) {
    const meta = catalogs.badgeMap.get(activeCode);
    active = {
      code: activeCode,
      name: meta?.name || activeCode,
      description: meta?.description || '',
      icon: meta?.icon || '',
      tier: meta?.tier || 'common',
      isExclusive: !!meta?.isExclusive,
      unlockedAt: badgeUnlockTime.get(activeCode) || null,
      owned: ownedSet.has(activeCode),
    };
  }

  const catalog = includeCatalog
    ? catalogs.badges.map((badge) => ({
        code: normalizeCode(badge.code),
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon || '',
        tier: badge.tier || 'common',
        isExclusive: !!badge.isExclusive,
      }))
    : undefined;

  return {
    active,
    owned,
    catalog,
  };
};

const buildProfileResponse = (userDoc, catalogs, options = {}) => {
  const {
    includeLockedAchievements = true,
    hideHiddenIfLocked = false,
    includeCatalog = false,
    publicView = false,
  } = options;

  const user = toPlainUser(userDoc);
  const base = buildBaseProfile(user);

  const achievements = composeAchievements(user, catalogs, {
    includeLocked: includeLockedAchievements,
    hideHiddenIfLocked,
    requireCompletedForShowcase: true,
  });

  const badges = composeBadges(user, catalogs, achievements, { includeCatalog });

  if (publicView) {
    Object.keys(base.socialLinks).forEach((key) => {
      if (!base.socialLinks[key]) {
        delete base.socialLinks[key];
      }
    });
  }

  return {
    ...base,
    achievements,
    badges,
    stats: {
      achievementsUnlocked: achievements.totals.completed,
      achievementsTotal: achievements.totals.total,
      badgesOwned: badges.owned.length,
    },
  };
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, 'User not found');
    }

    if (ensureStatusFreshness(user)) {
      await user.save();
    }

    const catalogs = await loadCatalogs();
    const payload = buildProfileResponse(user, catalogs, {
      includeLockedAchievements: true,
      hideHiddenIfLocked: false,
      includeCatalog: true,
      publicView: false,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

exports.updateMyProfile = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const user = await User.findById(req.user.id).session(session).exec();
    if (!user) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, 'User not found');
    }

    ensureStatusFreshness(user);

    const {
      bio,
      statusState,
      statusMessage,
      statusMessageDurationMinutes,
      profileVisibility,
      activeBadge,
      socialLinks,
      achievementShowcase,
    } = req.body;

    const resolveExpiryDate = (minutes) => {
      const numeric = Number(minutes);
      if (!Number.isFinite(numeric)) return null;
      const bounded = Math.min(
        MAX_STATUS_DURATION_MINUTES,
        Math.max(MIN_STATUS_DURATION_MINUTES, Math.round(numeric))
      );
      return new Date(Date.now() + bounded * 60 * 1000);
    };

    if (bio !== undefined) {
      user.bio = sanitizeMultiLine(bio, 300);
    }

    if (statusState !== undefined) {
      user.statusState = normalizeStatusState(statusState);
    }

    if (statusMessage !== undefined) {
      const cleaned = sanitizeSingleLine(statusMessage, 140);
      user.statusMessage = cleaned;
      if (cleaned) {
        const durationSource =
          statusMessageDurationMinutes === undefined || statusMessageDurationMinutes === null
            ? DEFAULT_STATUS_DURATION_MINUTES
            : statusMessageDurationMinutes;
        user.statusMessageExpiresAt =
          resolveExpiryDate(durationSource) || resolveExpiryDate(DEFAULT_STATUS_DURATION_MINUTES);
      } else {
        user.statusMessageExpiresAt = null;
      }
    } else if (statusMessageDurationMinutes !== undefined) {
      if (user.statusMessage) {
        const expiresAt =
          statusMessageDurationMinutes === null
            ? resolveExpiryDate(DEFAULT_STATUS_DURATION_MINUTES)
            : resolveExpiryDate(statusMessageDurationMinutes);
        user.statusMessageExpiresAt =
          expiresAt || resolveExpiryDate(DEFAULT_STATUS_DURATION_MINUTES);
      } else {
        user.statusMessageExpiresAt = null;
      }
    }

    if (profileVisibility !== undefined) {
      user.profileVisibility = profileVisibility;
    }

    if (socialLinks !== undefined) {
      const current = { ...defaultSocialLinks(), ...(user.socialLinks || {}) };
      const nextLinks = defaultSocialLinks();
      for (const key of Object.keys(nextLinks)) {
        if (Object.prototype.hasOwnProperty.call(socialLinks, key)) {
          nextLinks[key] = sanitizeSocialLink(socialLinks[key], key);
        } else {
          nextLinks[key] = current[key] || '';
        }
      }
      user.socialLinks = nextLinks;
    }

    if (activeBadge !== undefined) {
      const code = normalizeCode(activeBadge);
      if (!code) {
        user.activeBadge = null;
      } else {
        const owned = new Set(ensureArray(user.profileBadges).map(normalizeCode));
        if (!owned.has(code)) {
          throw new AppError(
            ErrorCodes.PROFILE_BADGE_NOT_OWNED,
            400,
            'Badge not owned',
            { code }
          );
        }
        user.activeBadge = code;
      }
    }

    if (achievementShowcase !== undefined) {
      const codes = ensureArray(achievementShowcase).map(normalizeCode).filter(Boolean);
      if (codes.length > MAX_SHOWCASE) {
        throw new AppError(ErrorCodes.PROFILE_SHOWCASE_LIMIT, 400, 'Showcase limit exceeded');
      }

      const uniqueCodes = new Set();
      const newShowcase = [];
      const existing = ensureArray(user.achievementShowcase).reduce((map, entry) => {
        const code = normalizeCode(entry.code);
        if (!code || map.has(code)) return map;
        map.set(code, entry.pinnedAt ? new Date(entry.pinnedAt) : new Date());
        return map;
      }, new Map());

      const unlocked = ensureArray(user.achievements).reduce((set, entry) => {
        const code = normalizeCode(entry.code);
        if (!code) return set;
        if (entry.completed !== false) {
          set.add(code);
        }
        return set;
      }, new Set());

      for (const code of codes) {
        if (uniqueCodes.has(code)) {
          throw new AppError(
            ErrorCodes.PROFILE_SHOWCASE_DUPLICATE,
            400,
            'Duplicate achievement in showcase',
            { code }
          );
        }
        uniqueCodes.add(code);

        if (!unlocked.has(code)) {
          throw new AppError(
            ErrorCodes.PROFILE_ACHIEVEMENT_NOT_UNLOCKED,
            400,
            'Achievement not unlocked',
            { code }
          );
        }

        newShowcase.push({
          code,
          pinnedAt: existing.get(code) || new Date(),
        });
      }

      user.achievementShowcase = newShowcase;
    }

    await user.save({ session });
    await session.commitTransaction();

    const catalogs = await loadCatalogs();
    const payload = buildProfileResponse(user, catalogs, {
      includeLockedAchievements: true,
      hideHiddenIfLocked: false,
      includeCatalog: true,
      publicView: false,
    });

    res.json(payload);
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    next(error);
  } finally {
    session.endSession();
  }
};

exports.getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      throw new AppError(ErrorCodes.PROFILE_NOT_FOUND, 404, 'Profile not found');
    }

    const user = await User.findOne({ username }).exec();
    if (!user) {
      throw new AppError(ErrorCodes.PROFILE_NOT_FOUND, 404, 'Profile not found');
    }

    const statusExpired = ensureStatusFreshness(user);

    const viewerId = req.user?.id ? String(req.user.id) : null;
    const isOwner = viewerId && String(user._id) === viewerId;

    if (!isOwner && user.profileVisibility !== 'public') {
      throw new AppError(
        ErrorCodes.PROFILE_NOT_VISIBLE,
        403,
        'Profile is not publicly visible',
        { visibility: user.profileVisibility }
      );
    }

    const catalogs = await loadCatalogs();
    const payload = buildProfileResponse(user, catalogs, {
      includeLockedAchievements: false,
      hideHiddenIfLocked: true,
      includeCatalog: false,
      publicView: !isOwner,
    });

    if (statusExpired) {
      await user.save().catch(() => {});
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
