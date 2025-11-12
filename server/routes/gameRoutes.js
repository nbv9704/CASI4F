// server/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../middleware/asyncHandler');
const withNotification = require('../utils/withNotification');
const gameConfig = require('../middleware/gameConfig');

// ✅ Import validation schemas (centralized)
const {
  coinflipSchema,
  diceSchema,
  rouletteSchema,
  higherLowerSchema,
  slotsSchema,
  luckyFiveSchema,
  dicePokerSchema,
  minesStartSchema,
  minesPickSchema,
  towerStartSchema,
  blackjackDiceStartSchema,
} = require('../validation/gameSchemas');

// Import controllers
const { coinflip } = require('../controllers/minigames/coinflipController');
const { slots } = require('../controllers/minigames/slotsController');
const { roulette } = require('../controllers/minigames/rouletteController');
const { luckyFive } = require('../controllers/minigames/luckyFiveController');
const { dice } = require('../controllers/minigames/diceController');
const { dicePoker } = require('../controllers/minigames/dicePokerController');
const { higherLower, getState, stopHigherLower } = require('../controllers/minigames/higherLowerController');
const { startMines, pickMines, cashoutMines } = require('../controllers/minigames/minesController');
const { startTower, ascendTower, cashoutTower } = require('../controllers/minigames/towerController');
const {
  startBlackjackDice,
  hitBlackjackDice,
  standBlackjackDice,
  checkBlackjackDice,
  abandonBlackjackDice,
  resumeBlackjackDice,
} = require('../controllers/minigames/blackjackDiceController');

// ✅ Public endpoint to get all game configs (for client-side checks)
const GameConfig = require('../models/GameConfig');
router.get('/configs', asyncHandler(async (req, res) => {
  const configs = await GameConfig.find({}).select('gameId enabled minBet maxBet').lean();
  res.json({ configs });
}));

// ✅ Apply rate limit to all game endpoints (60 actions per minute)
const { pvpActionLimiter: gameActionLimiter } = require('../middleware/rateLimitStrict');
router.use(gameActionLimiter);

// ✅ Wrap controllers with asyncHandler + validation + gameConfig
router.post('/coinflip', auth, gameConfig('coinflip'), validateRequest(coinflipSchema, 'body'), asyncHandler(withNotification(coinflip, 'Coinflip')));
router.post('/roulette', auth, gameConfig('roulette'), validateRequest(rouletteSchema, 'body'), asyncHandler(withNotification(roulette, 'Roulette')));
router.post('/dice', auth, gameConfig('dice'), validateRequest(diceSchema, 'body'), asyncHandler(withNotification(dice, 'Dice')));
router.post('/higherlower/state', auth, asyncHandler(getState));
router.post('/higherlower', auth, gameConfig('higherlower'), validateRequest(higherLowerSchema, 'body'), asyncHandler(withNotification(higherLower, 'Higher Lower')));
router.post('/higherlower/stop', auth, asyncHandler(stopHigherLower));
router.post('/slots', auth, gameConfig('slots'), validateRequest(slotsSchema, 'body'), asyncHandler(withNotification(slots, 'Slots')));
router.post('/luckyfive', auth, gameConfig('luckyfive'), validateRequest(luckyFiveSchema, 'body'), asyncHandler(withNotification(luckyFive, 'Lucky Five')));
router.post('/dicepoker', auth, gameConfig('dicepoker'), validateRequest(dicePokerSchema, 'body'), asyncHandler(withNotification(dicePoker, 'Dice Poker')));

router.post('/mines/start', auth, gameConfig('mines'), validateRequest(minesStartSchema, 'body'), asyncHandler(startMines));
router.post('/mines/pick', auth, validateRequest(minesPickSchema, 'body'), asyncHandler(pickMines));
router.post('/mines/cashout', auth, asyncHandler(withNotification(cashoutMines, 'Mines')));

router.post('/tower/start', auth, gameConfig('tower'), validateRequest(towerStartSchema, 'body'), asyncHandler(startTower));
router.post('/tower/ascend', auth, asyncHandler(ascendTower));
router.post('/tower/cashout', auth, asyncHandler(cashoutTower));

router.post('/blackjackdice/start', auth, gameConfig('blackjackdice'), validateRequest(blackjackDiceStartSchema, 'body'), asyncHandler(startBlackjackDice));
router.post('/blackjackdice/hit', auth, asyncHandler(withNotification(hitBlackjackDice, 'Blackjack Dice')));
router.post('/blackjackdice/stand', auth, asyncHandler(withNotification(standBlackjackDice, 'Blackjack Dice')));
router.post('/blackjackdice/check', auth, asyncHandler(checkBlackjackDice));
router.post('/blackjackdice/abandon', auth, asyncHandler(abandonBlackjackDice));
router.post('/blackjackdice/resume', auth, asyncHandler(resumeBlackjackDice));

module.exports = router;