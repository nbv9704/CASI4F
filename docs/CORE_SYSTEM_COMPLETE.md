# 🎯 CASI4F - CORE SYSTEM HOÀN CHỈNH

> **Tổng kết đầy đủ tất cả các tính năng core đã được xây dựng**

---

## 📊 TỔNG QUAN HỆ THỐNG

### Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Frontend**: Next.js 14 (App Router) + React
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **Styling**: TailwindCSS

---

## 🗄️ DATABASE MODELS (6 Collections)

### 1. **User** (`models/User.js`)
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'jadmin' | 'admin',
  balance: Number (default: 1000),
  bank: Number (default: 0),
  avatar: String,
  dateOfBirth: Date,
  
  // Provably Fair Seeds (per-user)
  serverSeed: String,
  serverSeedHash: String,
  clientSeed: String,
  nonce: Number,
  
  // Higher/Lower game state
  higherLowerLastNumber: Number,
  higherLowerStreak: Number,
  
  // Reward cooldowns
  hourlyCollectedAt: Date,
  dailyCollectedAt: Date,
  weeklyCollectedAt: Date,
  
  createdAt: Date
}
```

### 2. **Transaction** (`models/Transaction.js`)
```javascript
{
  userId: ObjectId (ref: User),
  type: 'deposit' | 'withdraw' | 'transfer',
  amount: Number,
  toUserId: ObjectId (for transfers),
  fromUserId: ObjectId (for transfers),
  createdAt: Date
}
```

### 3. **GameHistory** (`models/GameHistory.js`)
```javascript
{
  userId: ObjectId (ref: User),
  game: String (coinflip, dice, slots, etc.),
  betAmount: Number,
  outcome: 'win' | 'lose' | 'tie',
  payout: Number,
  createdAt: Date
}
```

### 4. **Notification** (`models/Notification.js`)
```javascript
{
  userId: ObjectId (ref: User),
  type: String (game_win, transfer_received, pvp_invite, etc.),
  message: String,
  read: Boolean (default: false),
  link: String (optional, for actions),
  createdAt: Date
}
```

### 5. **PvpRoom** (`models/PvpRoom.js`)
```javascript
{
  roomId: String (unique, 5-char alphanumeric),
  game: 'coinflip' | 'dice',
  creatorUserId: ObjectId,
  betAmount: Number,
  status: 'waiting' | 'ready' | 'active' | 'finished' | 'cancelled',
  players: [{
    userId: ObjectId,
    username: String,
    avatar: String,
    joinedAt: Date,
    ready: Boolean,
    side: String (for coinflip: 'heads' | 'tails')
  }],
  winnerUserId: ObjectId,
  metadata: Object (game-specific data),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. **BalanceLog** (`models/BalanceLog.js`)
```javascript
{
  userId: ObjectId (ref: User),
  roomId: String (optional, for PvP),
  delta: Number (balance change, + or -),
  reason: String (payout, escrow, refund, etc.),
  balanceAfter: Number,
  meta: Object (additional info),
  createdAt: Date
}
```

---

## 🎮 SOLO GAMES (10 Games)

### Đã có MongoDB Transactions ✅

1. **Coinflip** - Provably Fair
   - Heads/Tails bet
   - 2x multiplier
   - SHA-256 + HMAC verification

2. **Dice** - Provably Fair
   - Roll 1-100
   - Choose target number
   - Variable multiplier

3. **Dice Poker**
   - Roll 5 dice
   - Poker hands (Five of a Kind, Four of a Kind, etc.)
   - Up to 50x multiplier

4. **Higher/Lower**
   - Guess next number vs previous
   - Streak system
   - Increasing multiplier

5. **Slots**
   - 3x3 grid with symbols
   - Multiple paylines
   - Emoji-based

6. **Roulette**
   - Numbers 0-36
   - Color/Range betting
   - Standard multipliers

7. **Mines**
   - Pick safe tiles (max 5)
   - Avoid bombs
   - Progressive multipliers

8. **Tower**
   - Climb 8 levels
   - 3 tiles per level (1 safe, 2 traps)
   - Cashout anytime

9. **Blackjack Dice**
   - Player vs Dealer
   - Roll dice to get closest to 21
   - Hit/Stand mechanics

10. **Lucky Five**
    - Roll 5 dice
    - Number + Color matching
    - Dual betting system

---

## ⚔️ PVP GAMES (2 Games)

### Đã có MongoDB Transactions ✅

1. **PvP Coinflip**
   - 2 players
   - Each picks Heads/Tails
   - Winner takes pot (2x bet)
   - Provably Fair với server seed
   - Auto-reveal system

2. **PvP Dice**
   - 2 players
   - Turn-based rolls
   - Highest total wins
   - Equal splits on tie
   - Auto-advance system

### PvP Features:
- ✅ Room creation với unique 5-char roomId
- ✅ Join/Leave room
- ✅ Ready system (participants must ready)
- ✅ Invite system (notifications + auto-join)
- ✅ Real-time updates via Socket.IO
- ✅ Escrow system (lock bets at start)
- ✅ Auto-cleanup cron job
- ✅ Grace periods for timeouts
- ✅ Refund on cancellation

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Auth System
- ✅ JWT-based authentication
- ✅ Register/Login with validation
- ✅ Password hashing (bcrypt)
- ✅ Role-based access (user, jadmin, admin)
- ✅ Token expiration (1 day)
- ✅ Protected routes with middleware

### Rate Limiting
- ✅ **Auth endpoints**: 5 attempts per 15 minutes
- ✅ **Wallet transfer**: 10 per 5 minutes per user
- ✅ **PvP actions**: 30 per minute
- ✅ **Room creation**: 5 per 5 minutes

### Middleware Stack
1. **auth.js** - JWT verification
2. **admin.js** - Admin role check
3. **jadmin.js** - JAdmin role check
4. **socketAuth.js** - Socket.IO JWT auth
5. **validateObjectId.js** - MongoDB ObjectId validation
6. **validateRequest.js** - Joi schema validation
7. **rateLimit.js** - General rate limiting
8. **rateLimitStrict.js** - Strict rate limiting
9. **idempotency.js** - Prevent duplicate requests
10. **requestId.js** - Request tracking
11. **logRequest.js** - HTTP logging
12. **mongoSanitize.js** - NoSQL injection prevention
13. **errorHandler.js** - Centralized error handling
14. **asyncHandler.js** - Async error catching

---

## 💰 WALLET SYSTEM

### Đã có MongoDB Transactions ✅

### Features:
1. **Balance** - In-game currency (playing money)
2. **Bank** - Safe storage (cannot bet)

### Operations:
- ✅ **Deposit** - Balance → Bank (atomic transaction)
- ✅ **Withdraw** - Bank → Balance (atomic transaction)
- ✅ **Transfer** - User → User (atomic 2-user transaction)
  - Prevents self-transfer
  - Validates recipient exists
  - Creates dual transaction records
  - Real-time notifications

### Transaction History:
- ✅ View all deposits/withdrawals/transfers
- ✅ Timestamp tracking
- ✅ From/To user info

---

## 🎁 REWARD SYSTEM

### Đã có MongoDB Transactions ✅

### Rewards:
- ✅ **Hourly**: 10 coins (1 hour cooldown)
- ✅ **Daily**: 100 coins (24 hours cooldown)
- ✅ **Weekly**: 1000 coins (7 days cooldown)

### Protection:
- ✅ Atomic balance + cooldown update
- ✅ Prevents double-claiming via race condition
- ✅ Cooldown validation in transaction

---

## 🔔 NOTIFICATION SYSTEM

### Features:
- ✅ **Types**: game_win, game_loss, transfer_sent, transfer_received, deposit, withdraw, pvp_invite, etc.
- ✅ **Real-time push** via Socket.IO
- ✅ **Persistent storage** in MongoDB
- ✅ **Mark as read** functionality
- ✅ **Action links** (e.g., join PvP room)
- ✅ **Frontend bell icon** with dropdown
- ✅ **Unread count** badge

---

## 🌐 SOCKET.IO REAL-TIME

### Authentication ✅
- JWT token required for all connections
- Token validation on handshake
- User ID attached to socket
- Prevents user spoofing

### Events:
1. **User Registration**
   - `register` - Register user online
   - Track online users per socketId

2. **Notifications**
   - `notification` - Push real-time notifications

3. **PvP Events**
   - `pvp:joinRoomChannel` - Subscribe to room updates
   - `pvp:leaveRoomChannel` - Unsubscribe from room
   - `pvp:rooms:refresh` - Trigger room list refresh
   - `pvp:roomUpdated` - Room state changed
   - `pvp:roomFinished` - Game finished
   - `pvp:playerJoined` - Player joined room
   - `pvp:playerLeft` - Player left room

---

## 🎲 PROVABLY FAIR SYSTEM

### Implementation ✅
- ✅ **Per-user seeds** stored in MongoDB
- ✅ **Server seed** + **Client seed** + **Nonce**
- ✅ **Committed seed hash** (SHA-256)
- ✅ **HMAC-SHA256** for RNG
- ✅ **Nonce auto-increment** in transactions
- ✅ **Seed rotation** support
- ✅ **Verification API** for players

### Games with Provably Fair:
- Coinflip (solo)
- Dice (solo)
- PvP Coinflip
- PvP Dice

---

## 🔒 SECURITY FEATURES

### 1. MongoDB Transaction Safety ✅
- **All games**: Atomic balance + history + logs
- **Wallet operations**: Atomic multi-step operations
- **Rewards**: Prevent double-claiming
- **PvP**: Escrow + payout in transactions
- **Auto-rollback** on errors

### 2. Environment Validation ✅
- **Required**: MONGO_URI, JWT_SECRET (min 32 chars)
- **Optional**: 40+ environment variables with defaults
- **Fail-fast**: Server won't start with invalid config
- **Clear errors**: Helpful messages for fixes

### 3. Input Validation ✅
- **Joi schemas** for all endpoints
- **ObjectId validation** for MongoDB IDs
- **Amount limits** (min/max bets)
- **Type checking** for all inputs

### 4. NoSQL Injection Prevention ✅
- **mongoSanitize middleware** for all requests
- **Strips $ and . operators** from inputs

### 5. Rate Limiting ✅
- **Per-IP** and **per-user** limits
- **Separate limits** for different endpoint types
- **Exponential backoff** support

### 6. Error Handling ✅
- **Centralized AppError** class
- **Standardized error codes** (50+ codes)
- **Vietnamese error messages**
- **Meta data exposure control** (prod vs dev)
- **Request ID tracking**

### 7. Audit Logging ✅
- **BalanceLog**: All balance changes tracked
- **GameHistory**: All game results recorded
- **Transaction**: All wallet operations logged
- **HTTP logs**: Configurable request logging

---

## 📡 API ROUTES

### Auth Routes (`/api/auth`)
- `POST /register` - Create account
- `POST /login` - Login
- `GET /me` - Get current user
- `PATCH /me` - Update profile

### User Routes (`/api/user`)
- `GET /:id` - Get user details
- `GET /:id/history` - Get game history
- `PATCH /:id/profile` - Update profile
- `PATCH /:id/password` - Change password
- `PATCH /:id/email` - Change email

### Wallet Routes (`/api/wallet`)
- `POST /:id/bank/deposit` - Balance → Bank
- `POST /:id/bank/withdraw` - Bank → Balance
- `POST /:id/transfer` - Transfer to user
- `GET /:id/transactions` - Transaction history

### Game Routes (`/api/game`)
- `POST /coinflip` - Play coinflip
- `POST /dice` - Play dice
- `POST /dicepoker` - Play dice poker
- `POST /higherlower` - Play higher/lower
- `POST /slots` - Play slots
- `POST /roulette` - Play roulette
- `POST /mines/start` - Start mines
- `POST /mines/pick` - Pick tile
- `POST /tower/start` - Start tower
- `POST /tower/ascend` - Climb tower
- `POST /tower/cashout` - Cash out tower
- `POST /blackjackdice/start` - Start blackjack dice
- `POST /blackjackdice/hit` - Hit
- `POST /blackjackdice/stand` - Stand
- `GET /blackjackdice/check` - Check game state
- `POST /blackjackdice/abandon` - Abandon game
- `POST /blackjackdice/resume` - Resume game
- `POST /luckyfive` - Play lucky five

### PvP Routes (`/api/pvp`)
- `GET /rooms` - List all rooms
- `POST /rooms` - Create room
- `GET /rooms/:roomId` - Get room details
- `POST /rooms/:roomId/join` - Join room
- `POST /rooms/:roomId/leave` - Leave room
- `POST /rooms/:roomId/ready` - Mark ready
- `POST /rooms/:roomId/start` - Start game
- `POST /rooms/:roomId/bet` - Place bet (coinflip)
- `POST /rooms/:roomId/roll` - Roll dice (dice game)
- `POST /rooms/:roomId/finish` - Finish game
- `POST /rooms/:roomId/invite` - Invite user

### Reward Routes (`/api/rewards`)
- `GET /` - Get reward status
- `POST /:type` - Collect reward (hourly/daily/weekly)

### Notification Routes (`/api/notification`)
- `GET /` - Get all notifications
- `PATCH /:id/read` - Mark as read

### Admin PvP Routes (`/api/admin/pvp`)
- `GET /health` - System health check
- `GET /rooms` - Admin room list
- `GET /stats` - PvP statistics

### History Routes (`/api/user`)
- `GET /:userId/history` - Game history with pagination

---

## 🛠️ UTILITIES

### 1. **fair.js** - Provably Fair System
- `getActiveServerSeed()` - Get current seed
- `getSeedHash()` - Get SHA-256 hash
- `coinflip()` - Fair coinflip RNG
- `rollDice()` - Fair dice RNG
- `randomInt()` - Fair random integer
- `hmacHex()` - HMAC-SHA256 hash

### 2. **history.js** - Game History
- `recordGameHistory()` - Save game result

### 3. **balanceLog.js** - Balance Tracking
- `logBalanceChange()` - Track balance changes

### 4. **notify.js** - Notifications
- `pushNotification()` - Create & push notification

### 5. **withNotification.js** - Auto Notifications
- Wrapper for game controllers
- Auto-send win/loss notifications

### 6. **validateEnv.js** - Config Validation
- Validate 40+ environment variables
- Fail-fast on startup

### 7. **ErrorCodes.js** - Error Management
- 50+ standardized error codes
- Vietnamese error messages

### 8. **AppError.js** - Custom Error Class
- Structured error handling
- HTTP status codes
- Meta data support

### 9. **logger.js** - Logging System
- Winston-based logging
- Log levels (error, warn, info, debug)
- File + console output

### 10. **random.js** - Random Generators
- Crypto-secure random numbers
- Used for non-provably-fair games

---

## 🔄 CRON JOBS

### PvP Room Cleanup (`cron/cleanupRooms.js`)
- ✅ **Auto-cleanup waiting rooms** (30 min timeout)
- ✅ **Auto-finish stuck games** with grace periods:
  - Coinflip: 10s after reveal
  - Dice: 4s after advance
  - Dice idle: 60s no activity
  - Dice unstarted: 15m no first roll
- ✅ **Auto-refund** cancelled/timeout rooms
- ✅ **Configurable intervals** via ENV
- ✅ **File logging** support
- ✅ **Transaction safety** for all operations

---

## 🎨 FRONTEND FEATURES

### Pages:
- `/` - Home/Game lobby
- `/login` - Login
- `/register` - Register
- `/profile` - User profile
- `/settings` - Account settings
- `/wallet` - Wallet management
- `/history` - Game history
- `/rewards` - Collect rewards
- `/notifications` - Notification center
- `/game/*` - Individual game pages
- `/game/battle` - PvP lobby
- `/game/battle/room/:roomId` - PvP room

### Components:
- **Layout** - Main app layout
- **Navbar** - Navigation with user menu
- **NotificationBell** - Real-time notifications
- **GameCard** - Game display cards
- **RequireAuth** - Protected route wrapper
- **ConfirmDialog** - Confirmation dialogs
- **PromptDialog** - Input dialogs
- **Loading** - Loading states
- **Skeleton** - Loading skeletons

### Hooks:
- **useUser** - User context & auth
- **useApi** - API client with error handling
- **useSocket** - Socket.IO management

### Context:
- **UserContext** - Global user state

---

## 📝 VALIDATION SCHEMAS

### Game Schemas (`validation/gameSchemas.js`)
- coinflipSchema
- diceSchema
- dicePokerSchema
- higherLowerSchema
- slotsSchema
- rouletteSchema
- minesStartSchema, minesPickSchema
- towerStartSchema, towerAscendSchema
- blackjackDiceStartSchema
- luckyFiveSchema

### PvP Schemas (`validation/pvpSchemas.js`)
- createRoomSchema
- joinRoomSchema
- readySchema
- startRoomSchema
- rollDiceSchema
- placeBetSchema
- finishRoomSchema
- inviteSchema

### Wallet Schemas (`validation/walletSchemas.js`)
- depositSchema
- withdrawSchema
- transferSchema

---

## 🌍 ENVIRONMENT VARIABLES

### Required:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret (min 32 chars)

### Optional (40+ variables):
- Server config (PORT, NODE_ENV)
- CORS (CLIENT_URL, FRONTEND_URL)
- Session (SESSION_SECRET)
- Rate limiting (RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)
- Logging (LOG_LEVEL, HTTP_LOG_LEVEL)
- Game config (MIN_BET_AMOUNT, MAX_BET_AMOUNT)
- Rewards (HOURLY_REWARD, DAILY_REWARD, WEEKLY_REWARD)
- PvP timeouts (PVP_SWEEP_INTERVAL_MS, PVP_MAX_WAITING_AGE_MS, etc.)
- Cron logging (PVP_CRON_LOG_LEVEL, PVP_CRON_FILE_LOG)

---

## 📊 CORE STATISTICS

### Code Coverage:
- **MongoDB Transactions**: 100% coverage
  - 10 solo game controllers ✅
  - 3 wallet operations ✅
  - 1 reward collection ✅
  - 2 PvP games ✅
  - PvP cron cleanup ✅

- **Provably Fair**: 4 games
  - Coinflip (solo) ✅
  - Dice (solo) ✅
  - PvP Coinflip ✅
  - PvP Dice ✅

- **Rate Limiting**: 100% coverage
  - Auth endpoints ✅
  - Wallet transfers ✅
  - PvP actions ✅
  - Room creation ✅

- **Input Validation**: 100% coverage
  - All game endpoints ✅
  - All wallet endpoints ✅
  - All PvP endpoints ✅
  - All auth endpoints ✅

### Database:
- **6 Collections** (User, Transaction, GameHistory, Notification, PvpRoom, BalanceLog)
- **Indexes**: Optimized for queries
- **TTL Indexes**: Auto-cleanup support

### Middleware:
- **14 Middleware** components
- **Security**: 8 layers
- **Validation**: 3 types
- **Logging**: 2 systems

### API Endpoints:
- **60+ endpoints** across 9 route files
- **RESTful design**
- **Consistent error handling**
- **Vietnamese error messages**

---

## 🎯 CORE STRENGTHS

### 1. **Security First** 🔒
- Transaction safety everywhere
- No race conditions
- No partial updates
- JWT authentication
- Rate limiting
- Input validation
- NoSQL injection prevention

### 2. **Scalability Ready** 🚀
- MongoDB transactions support horizontal scaling
- Socket.IO can be clustered
- Stateless JWT auth
- Cron jobs can run separately
- Environment-based configuration

### 3. **Developer Experience** 👨‍💻
- Centralized error handling
- Standardized error codes
- Comprehensive validation
- Clear folder structure
- Modular architecture
- Reusable utilities

### 4. **User Experience** 🎮
- Real-time updates
- Clear error messages (Vietnamese)
- Fast response times
- Fair gaming (Provably Fair)
- Responsive UI
- Mobile-friendly

### 5. **Maintainability** 🛠️
- Clean code structure
- Consistent patterns
- Well-documented
- Error tracking
- Audit logging
- Environment validation

---

## 🚀 PRODUCTION READY CHECKLIST

### ✅ Completed:
- [x] MongoDB transaction safety
- [x] Provably Fair gaming
- [x] JWT authentication
- [x] Socket.IO authentication
- [x] Rate limiting
- [x] Input validation
- [x] Error handling
- [x] Environment validation
- [x] Audit logging
- [x] NoSQL injection prevention
- [x] Real-time notifications
- [x] PvP system with auto-cleanup
- [x] Wallet system with transfers
- [x] Reward system with cooldowns
- [x] Game history tracking
- [x] Balance change logging

### 🔧 Optional Improvements:
- [ ] JWT refresh tokens
- [ ] Email verification
- [ ] Password reset
- [ ] Two-factor authentication
- [ ] Admin dashboard
- [ ] Analytics/metrics
- [ ] Backup system
- [ ] Load testing
- [ ] Monitoring/alerting
- [ ] CDN for static assets

---

## 📚 DOCUMENTATION

### Available Docs:
- ✅ `SOCKET_AUTH.md` - Socket.IO authentication guide
- ✅ `ENV_CONFIG.md` - Environment configuration guide
- ✅ `.env.example` - Environment variable reference
- ✅ `SECURITY_IMPROVEMENTS_SUMMARY.md` - Security improvements
- ✅ `progress.md` - Development progress tracking
- ✅ `project_structure.txt` - Project structure overview

---

## 🎉 CONCLUSION

**CASI4F Core System** là một hệ thống casino game hoàn chỉnh với:
- ✅ **10 Solo Games** + **2 PvP Games**
- ✅ **100% Transaction Safety** (no race conditions)
- ✅ **Provably Fair** gaming system
- ✅ **Real-time** notifications & updates
- ✅ **Secure** authentication & authorization
- ✅ **Scalable** architecture
- ✅ **Production-ready** code quality

Hệ thống đã sẵn sàng cho:
1. ✅ **Development** - Full feature set
2. ✅ **Testing** - Comprehensive validation
3. ✅ **Staging** - Production-like environment
4. 🚀 **Production** - With optional improvements

**Core foundation is SOLID and COMPLETE!** 🎯
