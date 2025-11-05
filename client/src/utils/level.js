// client/src/utils/level.js
export const DAILY_CHECKIN_EXP = 50
export const LEVEL_CAP = 50

export const LEVEL_TIERS = [
  { from: 1, to: 10, exp: 1000 },
  { from: 11, to: 20, exp: 2000 },
  { from: 21, to: 30, exp: 5000 },
  { from: 31, to: 40, exp: 10000 },
  { from: 41, to: 50, exp: 20000 }
]

export function getExpToNextLevel(level = 1) {
  const safeLevel = Number.isFinite(level) && level > 0 ? level : 1
  if (safeLevel >= LEVEL_CAP) return null
  const tier = LEVEL_TIERS.find(t => safeLevel >= t.from && safeLevel <= t.to) ?? LEVEL_TIERS[LEVEL_TIERS.length - 1]
  return tier?.exp ?? null
}

export function getLevelProgress(level = 1, experience = 0) {
  const next = getExpToNextLevel(level)
  if (!next) {
    return {
      nextLevelExp: null,
      ratio: 1,
      percent: 100
    }
  }
  const safeExp = Number.isFinite(experience) && experience >= 0 ? experience : 0
  const ratio = next > 0 ? Math.min(1, safeExp / next) : 0
  return {
    nextLevelExp: next,
    ratio,
    percent: Math.round(ratio * 100)
  }
}
