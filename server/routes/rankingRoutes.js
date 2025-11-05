// server/routes/rankingRoutes.js
const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { getRankings } = require('../controllers/rankingsController');

const router = express.Router();

router.get('/', asyncHandler(getRankings));

module.exports = router;
