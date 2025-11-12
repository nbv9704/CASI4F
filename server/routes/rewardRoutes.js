// server/routes/rewardRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  getRewardsStatus,
  collectReward,
  collectCheckIn,
  getLevelRewardsCatalog,
  claimLevelReward,
} = require('../controllers/rewardController');

// Lấy trạng thái cooldown
router.get('/', auth, getRewardsStatus);
router.get('/level', auth, getLevelRewardsCatalog);
// Daily check-in grants EXP
router.post('/checkin', auth, collectCheckIn);
router.post('/level/:level', auth, claimLevelReward);
// Collect reward (hourly|daily|weekly)
router.post('/:type', auth, collectReward);

module.exports = router;
