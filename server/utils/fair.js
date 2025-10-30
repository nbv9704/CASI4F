// server/utils/fair.js
const crypto = require('crypto');

/** Tạo serverSeed ngẫu nhiên (64 hex) */
function makeServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

/** Tạo clientSeed mặc định từ userId */
function makeClientSeed(userId) {
  return String(userId);
}

/** SHA-256 tiện dụng (dùng làm commit hash) */
function sha256(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

/**
 * Initialize or rotate seeds for a user
 * @param {Object} user - Mongoose User document
 * @returns {Object} { serverSeed, serverSeedHash, clientSeed, nonce }
 */
async function initializeUserSeeds(user) {
  const serverSeed = makeServerSeed();
  const serverSeedHash = sha256(serverSeed);
  const clientSeed = user.clientSeed || makeClientSeed(user._id);
  
  user.serverSeed = serverSeed;
  user.serverSeedHash = serverSeedHash;
  user.clientSeed = clientSeed;
  user.nonce = 0;
  
  await user.save();
  
  return { serverSeed, serverSeedHash, clientSeed, nonce: 0 };
}

/**
 * Get user's current seeds, initialize if needed
 * @param {Object} user - Mongoose User document
 * @returns {Promise<Object>} { serverSeed, serverSeedHash, clientSeed, nonce }
 */
async function getUserSeeds(user) {
  if (!user.serverSeed || !user.serverSeedHash) {
    return await initializeUserSeeds(user);
  }
  
  return {
    serverSeed: user.serverSeed,
    serverSeedHash: user.serverSeedHash,
    clientSeed: user.clientSeed,
    nonce: user.nonce
  };
}

/**
 * Increment user's nonce (call after each game)
 * @param {Object} user - Mongoose User document
 * @returns {Promise<number>} new nonce value
 */
async function incrementNonce(user) {
  user.nonce += 1;
  await user.save();
  return user.nonce;
}

/**
 * Rotate user's server seed (for seed change feature)
 * @param {Object} user - Mongoose User document
 * @returns {Promise<Object>} { oldServerSeed, newServerSeed, newServerSeedHash }
 */
async function rotateServerSeed(user) {
  const oldServerSeed = user.serverSeed;
  const newServerSeed = makeServerSeed();
  const newServerSeedHash = sha256(newServerSeed);
  
  user.serverSeed = newServerSeed;
  user.serverSeedHash = newServerSeedHash;
  user.nonce = 0; // Reset nonce on seed rotation
  
  await user.save();
  
  return { oldServerSeed, newServerSeed, newServerSeedHash };
}

/**
 * Update user's client seed (allow user customization)
 * @param {Object} user - Mongoose User document
 * @param {string} newClientSeed - New client seed
 * @returns {Promise<string>} new client seed
 */
async function updateClientSeed(user, newClientSeed) {
  user.clientSeed = String(newClientSeed);
  user.nonce = 0; // Reset nonce on client seed change
  await user.save();
  return user.clientSeed;
}

/**
 * HMAC hex = HMAC_SHA256(serverSeed, `${clientSeed}:${nonce}`)
 * Đây là lõi "provably fair": clientSeed + nonce khiến server không thể đơn phương điều khiển kết quả.
 */
function hmacHex({ serverSeed, clientSeed, nonce }) {
  const key = String(serverSeed);
  const msg = `${String(clientSeed)}:${String(nonce)}`;
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

/** Lấy số thực [0,1) từ 8 hex đầu của HMAC */
function hmacFloat({ serverSeed, clientSeed, nonce }) {
  const hex = hmacHex({ serverSeed, clientSeed, nonce });
  const int32 = parseInt(hex.slice(0, 8), 16);
  return int32 / 0xffffffff; // 0..1 (không bao gồm 1)
}

/** Coinflip từ seed (heads/tails) */
function coinflip({ serverSeed, clientSeed, nonce }) {
  return hmacFloat({ serverSeed, clientSeed, nonce }) < 0.5 ? 'heads' : 'tails';
}

/** Verify một kết quả coinflip */
function verify({ serverSeed, clientSeed, nonce, result }) {
  return coinflip({ serverSeed, clientSeed, nonce }) === result;
}

module.exports = {
  // seed generation
  makeServerSeed,
  makeClientSeed,
  sha256,
  // user seed management (DB-based)
  initializeUserSeeds,
  getUserSeeds,
  incrementNonce,
  rotateServerSeed,
  updateClientSeed,
  // rng
  hmacHex,
  hmacFloat,
  coinflip,
  verify,
};
