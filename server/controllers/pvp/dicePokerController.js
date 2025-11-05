// server/controllers/pvp/dicePokerController.js
const PvpRoom = require("../../models/PvpRoom");
const { makeServerSeed, makeClientSeed, sha256, provablyFairDiceRoll } = require("../../utils/fair");
const AppError = require("../../utils/AppError");

const HAND_MULTIPLIERS = {
  'Five of a Kind': 20,
  'Four of a Kind': 10,
  'Full House': 8,
  'Straight': 5,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'One Pair': 1,
  'High Card': 0
};

// Evaluate dice poker hand
function evaluateHand(dice) {
  const sorted = [...dice].sort((a, b) => a - b);
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const values = Object.values(counts).sort((a, b) => b - a);
  const unique = Object.keys(counts).length;

  // Five of a Kind
  if (values[0] === 5) return { hand: 'Five of a Kind', multiplier: HAND_MULTIPLIERS['Five of a Kind'] };
  
  // Four of a Kind
  if (values[0] === 4) return { hand: 'Four of a Kind', multiplier: HAND_MULTIPLIERS['Four of a Kind'] };
  
  // Full House (3 + 2)
  if (values[0] === 3 && values[1] === 2) return { hand: 'Full House', multiplier: HAND_MULTIPLIERS['Full House'] };
  
  // Straight
  const straights = [[1,2,3,4,5], [2,3,4,5,6]];
  if (straights.some(s => s.every(v => sorted.includes(v)))) {
    return { hand: 'Straight', multiplier: HAND_MULTIPLIERS['Straight'] };
  }
  
  // Three of a Kind
  if (values[0] === 3) return { hand: 'Three of a Kind', multiplier: HAND_MULTIPLIERS['Three of a Kind'] };
  
  // Two Pair
  if (values[0] === 2 && values[1] === 2) return { hand: 'Two Pair', multiplier: HAND_MULTIPLIERS['Two Pair'] };
  
  // One Pair
  if (values[0] === 2) return { hand: 'One Pair', multiplier: HAND_MULTIPLIERS['One Pair'] };
  
  // High Card
  return { hand: 'High Card', multiplier: HAND_MULTIPLIERS['High Card'] };
}

// Compare two hands
function compareHands(hand1, hand2, dice1, dice2) {
  // Compare by multiplier first
  if (hand1.multiplier !== hand2.multiplier) {
    return hand1.multiplier - hand2.multiplier;
  }
  
  // Same hand type - compare by dice sum
  const sum1 = dice1.reduce((a, b) => a + b, 0);
  const sum2 = dice2.reduce((a, b) => a + b, 0);
  
  if (sum1 !== sum2) return sum1 - sum2;
  
  // Same sum - compare highest dice
  const sorted1 = [...dice1].sort((a, b) => b - a);
  const sorted2 = [...dice2].sort((a, b) => b - a);
  
  for (let i = 0; i < 5; i++) {
    if (sorted1[i] !== sorted2[i]) return sorted1[i] - sorted2[i];
  }
  
  return 0; // Perfect tie
}

// Start game: roll 5 dice for all players
async function startDicePoker(io, room) {
  const serverSeed = makeServerSeed();
  const clientSeed = makeClientSeed(room.createdBy);
  let nonceCounter = 0;

  const rolls = [];
  
  for (const player of room.players) {
    const dice = [];
    for (let i = 0; i < 5; i++) {
      const roll = provablyFairDiceRoll(serverSeed, clientSeed, nonceCounter++, 6);
      dice.push(roll);
    }
    
    const handResult = evaluateHand(dice);
    
    rolls.push({
      userId: player.userId,
      dice,
      hand: handResult.hand,
      multiplier: handResult.multiplier,
      sum: dice.reduce((a, b) => a + b, 0)
    });
  }

  // Find winner(s)
  let maxScore = -1;
  let winners = [];
  
  for (const roll of rolls) {
    if (roll.multiplier > maxScore) {
      maxScore = roll.multiplier;
      winners = [roll];
    } else if (roll.multiplier === maxScore) {
      winners.push(roll);
    }
  }

  // If multiple with same multiplier, compare by sum and dice
  if (winners.length > 1) {
    winners.sort((a, b) => compareHands(
      { multiplier: a.multiplier }, 
      { multiplier: b.multiplier },
      a.dice,
      b.dice
    ));
    
    const bestScore = compareHands(
      { multiplier: winners[0].multiplier },
      { multiplier: winners[0].multiplier },
      winners[0].dice,
      winners[0].dice
    );
    
    winners = winners.filter(w => 
      compareHands(
        { multiplier: w.multiplier },
        { multiplier: winners[0].multiplier },
        w.dice,
        winners[0].dice
      ) === 0
    );
  }

  room.metadata.dicePoker = {
    rolls,
    serverSeed,
    serverSeedHash: sha256(serverSeed),
    clientSeed,
    nonce: nonceCounter,
  };

  room.winnerUserId = winners.length === 1 ? winners[0].userId : null;
  room.metadata.dicePoker.winners = winners.map(w => String(w.userId));
  
  return room;
}

module.exports = {
  startDicePoker,
  evaluateHand,
  compareHands,
  HAND_MULTIPLIERS
};
