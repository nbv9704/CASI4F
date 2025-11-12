// server/config/levelRewards.js
// Reward bundle unlocked when a player reaches a specific level.
// Rewards may include coins (balance boost) and bonus experience.
// Values are intentionally incremental so dashboards can validate XP injections.

module.exports = [
  { level: 5, rewards: { coins: 250, xp: 100 } },
  { level: 10, rewards: { coins: 500, xp: 150 } },
  { level: 15, rewards: { coins: 750, xp: 200 } },
  { level: 20, rewards: { coins: 1000, xp: 250 } },
  { level: 25, rewards: { coins: 1250, xp: 300 } },
  { level: 30, rewards: { coins: 1500, xp: 350 } },
  { level: 35, rewards: { coins: 2000, xp: 400 } },
  { level: 40, rewards: { coins: 2500, xp: 450 } },
  { level: 45, rewards: { coins: 3000, xp: 500 } },
  { level: 50, rewards: { coins: 4000, xp: 600 } },
];
