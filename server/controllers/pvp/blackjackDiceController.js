// server/controllers/pvp/blackjackDiceController.js
const PvpRoom = require("../../models/PvpRoom");
const { makeServerSeed, makeClientSeed, sha256, provablyFairDiceRoll } = require("../../utils/fair");
const AppError = require("../../utils/AppError");

// Start game: deal initial 2 dice to each player and dealer
async function startBlackjackDice(io, room) {
  const serverSeed = makeServerSeed();
  const clientSeed = makeClientSeed(room.createdBy);
  let nonceCounter = 0;
  
  console.log(`[START BLACKJACK] serverSeed=${serverSeed.substring(0, 16)}..., clientSeed=${clientSeed}, startNonce=${nonceCounter}`);

  const players = [];
  const log = [];
  
  // Deal to each player (2 dice each)
  for (const player of room.players) {
    const dice = [];

    for (let i = 0; i < 2; i += 1) {
      const nonceUsed = nonceCounter;
      const roll = provablyFairDiceRoll(serverSeed, clientSeed, nonceCounter++, 6);
      dice.push(roll);
      log.push({
        userId: String(player.userId),
        action: 'deal',
        order: log.length,
        nonce: nonceUsed,
        value: roll,
      });
    }
    
    players.push({
      userId: player.userId,
      dice,
      sum: dice.reduce((a, b) => a + b, 0),
      busted: false,
      standing: false
    });
  }

  room.metadata.blackjackDice = {
    players,
    serverSeed,
    serverSeedHash: sha256(serverSeed),
    clientSeed,
    nonce: nonceCounter,
    phase: 'playing', // playing, finished
    log,
    startedAt: Date.now(),
  };

  room.metadata.serverSeed = serverSeed;
  room.metadata.serverSeedHash = room.metadata.blackjackDice.serverSeedHash;
  room.metadata.clientSeed = clientSeed;
  room.metadata.nonce = nonceCounter;

  return room;
}

// Player hits (adds a dice)
async function hitBlackjackDice(io, room, userId) {
  const bjd = room.metadata.blackjackDice;
  if (!bjd) throw new AppError("Game not started", 400);
  if (bjd.phase !== 'playing') throw new AppError("Not in playing phase", 400);

  const playerData = bjd.players.find(p => String(p.userId) === String(userId));
  if (!playerData) throw new AppError("Player not found", 404);
  if (playerData.busted || playerData.standing) throw new AppError("Already busted or standing", 400);

  // Roll new die
  const currentNonce = bjd.nonce;
  bjd.nonce++;
  const newDie = provablyFairDiceRoll(bjd.serverSeed, bjd.clientSeed, currentNonce, 6);
  console.log(`[HIT] userId=${userId}, nonce=${currentNonce}, die=${newDie}`);
  playerData.dice.push(newDie);
  playerData.sum = playerData.dice.reduce((a, b) => a + b, 0);

  const log = Array.isArray(bjd.log) ? bjd.log : [];
  log.push({
    userId: String(userId),
    action: 'hit',
    order: log.length,
    nonce: currentNonce,
    value: newDie,
  });
  bjd.log = log;
  room.metadata.nonce = bjd.nonce;

  // Check bust
  if (playerData.sum > 21) {
    playerData.busted = true;
  }

  // Check if all players done
  checkAllPlayersDone(room);

  return room;
}

// Player stands
async function standBlackjackDice(io, room, userId) {
  const bjd = room.metadata.blackjackDice;
  if (!bjd) throw new AppError("Game not started", 400);
  if (bjd.phase !== 'playing') throw new AppError("Not in playing phase", 400);

  const playerData = bjd.players.find(p => String(p.userId) === String(userId));
  if (!playerData) throw new AppError("Player not found", 404);
  if (playerData.busted || playerData.standing) throw new AppError("Already busted or standing", 400);

  playerData.standing = true;

  // Check if all players done
  checkAllPlayersDone(room);

  return room;
}

// Check if all players are done (busted or standing)
function checkAllPlayersDone(room) {
  const bjd = room.metadata.blackjackDice;
  const allDone = bjd.players.every(p => p.busted || p.standing);

  if (allDone) {
    determineWinners(room);
  }
}

// Determine winners (PvP - highest sum wins, no dealer)
function determineWinners(room) {
  const bjd = room.metadata.blackjackDice;
  
  // Find highest sum among non-busted players
  let maxSum = 0;
  const validPlayers = bjd.players.filter(p => !p.busted);
  
  for (const player of validPlayers) {
    if (player.sum > maxSum && player.sum <= 21) {
      maxSum = player.sum;
    }
  }

  // All players with maxSum are winners
  const winners = [];
  for (const player of validPlayers) {
    if (player.sum === maxSum) {
      winners.push(String(player.userId));
    }
  }

  bjd.winners = winners;
  bjd.phase = 'finished';
  bjd.finishedAt = Date.now();
  bjd.serverSeedReveal = bjd.serverSeed;
  room.metadata.serverSeedReveal = room.metadata.serverSeed;
  room.winnerUserId = winners.length === 1 ? winners[0] : null;
  
  console.log(`[GAME FINISHED] maxSum=${maxSum}, winners=${winners.join(', ')}`);
}

module.exports = {
  startBlackjackDice,
  hitBlackjackDice,
  standBlackjackDice
};
