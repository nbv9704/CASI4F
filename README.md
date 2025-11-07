# 🎲 4FUNBET — Game & Battle Platform

**Version 1.0** — November 8, 2025

A diverse mini-game entertainment platform (solo & battle) built with Next.js (client) and Node/Express (server). The goal of this project is to operate an online casino featuring multiple mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, etc.), supporting PvP battles (battle rooms), game history, leaderboards, and reward systems.

---

## 🚀 Live Demo

👉 **[View Demo](https://your-vercel-app.vercel.app)** *(Coming soon!)*

---

## ✨ Features

### 🎮 Solo Games

- 🪙 **Coinflip** — Choose heads/tails, flip the coin and win x2
- 🎯 **Dice** — Predict dice outcomes with multiple choices (over/under/even/odd)
- 🃏 **Blackjack Dice** — Dice version of Blackjack, beat the dealer to get close to 21
- 🎰 **Slots** — Spin 3x3 grid, match 8 lines to win big
- 💣 **Mines** — Find safe tiles, avoid mines and cash out before explosion
- 🗼 **Tower** — Climb the tower, pick correct tiles to multiply wins
- 🎲 **Dice Poker** — Roll 5 dice, create poker hands for payouts
- 🔢 **Lucky Five** — Pick numbers and colors, match results to win
- 🎡 **Roulette** — Bet on numbers/colors, spin the wheel of fortune

### ⚔️ Battle (PvP)

- 👥 **Room-based battles** — Create rooms, invite friends, play 1v1 or multiplayer
- 🔒 **Fairness Proof** — Commit-reveal, seed verification, complete audit trail
- 📊 **Live updates** — Real-time status via Socket.io
- 🏆 **Winner takes all** — Winner receives the entire pot

### 📈 Systems

- 🎯 **Leveling & XP** — Play to level up, unlock achievements
- 💰 **Wallet & Transactions** — Manage balance, detailed transaction history
- 🏅 **Rankings** — Leaderboards by wins, level, earnings
- 🎁 **Rewards** — Daily rewards, achievements, streaks
- 📜 **History** — Review all games with seed proof
- 🔐 **Auth & Security** — JWT authentication, rate limiting, input validation

---

## 🛠️ Technologies Used

### Frontend

- **⚛️ Next.js 14** — App router, React Server Components
- **🎨 Tailwind CSS** — Utility-first styling
- **🔥 React Hot Toast** — Elegant notifications
- **🌐 Socket.io Client** — Real-time battle updates
- **🎭 Custom Components** — SoloGameLayout, SoloCard, battle UI primitives

### Backend

- **🟢 Node.js + Express** — RESTful API server
- **🍃 MongoDB + Mongoose** — Database & ODM
- **⚡ Socket.io** — WebSocket server for PvP
- **🔐 JWT** — Token-based authentication
- **🛡️ Middleware Stack** — Auth, rate limit, validation, error handling, logging

### DevOps & Tools

- **🚀 Vercel** — Frontend deployment
- **🔧 ESLint + Prettier** — Code quality
- **📦 npm** — Package management

---

## 💻 Getting Started

### Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/nbv9704/4FUNBET.git
cd cado4fun

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Environment Variables Setup

**Server** (`server/.env`):

```env
MONGO_URI=mongodb://localhost:27017/4funbet
JWT_SECRET=your_secret_key_here
SOCKET_SECRET=your_socket_secret
NODE_ENV=development
PORT=5000
```

**Client** (if needed):

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

### Run Development

**Open 2 terminals:**

Terminal 1 - Server:

```bash
cd server
npm run dev
```

Terminal 2 - Client:

```bash
cd client
npm run dev
```

Visit: **http://localhost:3000**

### Build & Deploy

**Build client:**

```bash
cd client
npm run build
npm start
```

**Build server** (if build script exists):

```bash
cd server
npm run build
```

---

## 📸 Screenshots

*Coming soon!*

---

## 🎯 Version 1.0 Goals

- ✅ Unify solo game interfaces into `SoloGameLayout` / `SoloCard` system
- ✅ Improve header and fairness controls for battle rooms
- ✅ Migrate all solo games to shared layout
- ✅ Fix lint/compile errors causing deploy failures (apostrophes, react-hooks deps)
- ✅ Refactor Blackjack Dice and Slots with Solo primitives

---

## 📂 Project Structure

```
cado4fun/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── game/      # Solo games
│   │   │   │   ├── coinflip/
│   │   │   │   ├── dice/
│   │   │   │   ├── blackjackdice/
│   │   │   │   ├── slots/
│   │   │   │   ├── mines/
│   │   │   │   └── ...
│   │   │   └── game/battle/  # PvP battle rooms
│   │   ├── components/    # Shared components
│   │   │   ├── solo/      # SoloGameLayout, SoloCard
│   │   │   └── battle/    # Battle UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # Context providers
│   │   └── utils/         # Helpers & utilities
│   └── package.json
│
├── server/                # Express backend
│   ├── controllers/       # Game logic controllers
│   │   ├── minigames/    # Solo game endpoints
│   │   └── pvp/          # Battle endpoints
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation, etc.
│   ├── socket/           # Socket.io handlers
│   └── utils/            # Server utilities
│
├── docs/                 # Documentation
└── README.md
```

---

## 🔮 Future Features

- [ ] 📱 Progressive Web App (PWA)
- [ ] 🌍 Multi-language support (English, Vietnamese)
- [ ] 🎨 Theme customization
- [ ] 🤝 Friend system & social features
- [ ] 🏦 Crypto wallet integration
- [ ] 📊 Advanced analytics & stats
- [ ] 🎮 New games (Blackjack, Poker, Baccarat)
- [ ] 🏆 Tournament system
- [ ] 🎁 Referral & affiliate program
- [ ] 📧 Email notifications
- [ ] 🔔 Push notifications
- [ ] 👤 Profile customization

---

## 📋 Changelog

### 🎉 Version 1.0 (November 8, 2025)

#### ✨ UI/UX

- Unified layout for all solo games with `SoloGameLayout` & `SoloCard`
- Updated styles for: coinflip, luckyfive, tower, dice, dicepoker, blackjackdice, slots, mines, roulette
- Header stats display balance, bet, multiplier, outcomes
- Responsive design for mobile/tablet/desktop

#### 🎮 Functionality

- Preserved game logic — UI & component refactoring only
- Blackjack Dice: Restructured with Solo primitives, pending game resume
- Slots: Spin animation cleanup, timeout handling

#### 🛡️ System & Ops

- Fixed ESLint errors: `react/no-unescaped-entities` (apostrophes)
- Fixed `react-hooks/exhaustive-deps` warnings
- Successful Vercel build

#### 📁 Structure

- Created `client/src/components/solo/` folder
- Shared components: `SoloGameLayout.jsx`, `SoloCard.jsx`
- Utility: `formatCoins()` in `utils/format.js`

---

## 🐛 Known Issues

- In-memory state for blackjack games (production should use Redis)
- Rate limiting can be fine-tuned further
- Some games need additional animations/transitions
- SEO meta tags need dynamic content

---

## 🤝 Contributing

All contributions are welcome! Follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Guidelines:**

- Follow the project&rsquo;s ESLint config
- Run `npm run build` locally before pushing
- Write clear commit messages
- Update tests if needed

---

## 👨‍💻 Author

**Ngô Bảo Việt**

- GitHub: [@nbv9704](https://github.com/nbv9704)
- Repository: [4FUNBET](https://github.com/nbv9704/4FUNBET)

---

## 📄 License

This project is released under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** — Amazing framework
- **Vercel** — Deployment platform
- **MongoDB** — Database solution
- **Socket.io** — Real-time communication
- **Tailwind CSS** — Styling framework

---

## 📞 Contact & Support

If you have questions, encounter bugs, or want to contribute ideas:

- 🐛 [Report bugs](https://github.com/nbv9704/4FUNBET/issues)
- 💡 [Suggest features](https://github.com/nbv9704/4FUNBET/issues/new)
- 📧 Email: ngobaoviet97@gmail.com

---

<div align="center">
  <strong>⭐ If this project is useful, give it a star! ⭐</strong>
  <br><br>
  Made with ❤️ by nbv9704
</div>
