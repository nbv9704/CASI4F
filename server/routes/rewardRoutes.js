// server/routes/rewardRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  getRewardsStatus,
  collectReward,
  collectCheckIn
} = require('../controllers/rewardController');

// Lấy trạng thái cooldown
router.get('/', auth, getRewardsStatus);
// Daily check-in grants EXP
router.post('/checkin', auth, collectCheckIn);
// Collect reward (hourly|daily|weekly)
router.post('/:type', auth, collectReward);

module.exports = router;
