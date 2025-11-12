// server/models/GameConfig.js
const mongoose = require('mongoose');

const gameConfigSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    multiplier: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    minBet: {
      type: Number,
      required: true,
      min: 1,
    },
    maxBet: {
      type: Number,
      required: true,
      min: 1,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get config for a game
gameConfigSchema.statics.getGameConfig = async function (gameId) {
  let config = await this.findOne({ gameId });
  
  // Return default if not found
  if (!config) {
    const defaults = {
      coinflip: { name: 'Coinflip', multiplier: 2.0, minBet: 1, maxBet: 10000, enabled: true },
      dice: { name: 'Dice', multiplier: 1.98, minBet: 1, maxBet: 10000, enabled: true },
      blackjackdice: { name: 'Blackjack Dice', multiplier: 1.5, minBet: 1, maxBet: 5000, enabled: true },
      dicepoker: { name: 'Dice Poker', multiplier: 2.0, minBet: 1, maxBet: 5000, enabled: true },
      higherlower: { name: 'Higher/Lower', multiplier: 1.5, minBet: 1, maxBet: 10000, enabled: true },
      luckyfive: { name: 'Lucky Five', multiplier: 5.0, minBet: 1, maxBet: 5000, enabled: true },
      slots: { name: 'Slots', multiplier: 10.0, minBet: 1, maxBet: 1000, enabled: true },
      mines: { name: 'Mines', multiplier: 24.0, minBet: 1, maxBet: 1000, enabled: true },
      tower: { name: 'Tower', multiplier: 100.0, minBet: 1, maxBet: 1000, enabled: true },
      roulette: { name: 'Roulette', multiplier: 36.0, minBet: 1, maxBet: 5000, enabled: true },
    };
    
    return defaults[gameId] || { enabled: true, minBet: 1, maxBet: 10000, multiplier: 2.0 };
  }
  
  return config;
};

// Static method to validate bet
gameConfigSchema.statics.validateBet = async function (gameId, betAmount) {
  const config = await this.getGameConfig(gameId);
  
  if (!config.enabled) {
    throw new Error('This game is currently disabled');
  }
  
  if (betAmount < config.minBet) {
    throw new Error(`Minimum bet is ${config.minBet} coins`);
  }
  
  if (betAmount > config.maxBet) {
    throw new Error(`Maximum bet is ${config.maxBet} coins`);
  }
  
  return config;
};

module.exports = mongoose.model('GameConfig', gameConfigSchema);
