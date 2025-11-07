# 🎲 4FUNBET — Game & Battle Platform# 🎲 CASI4F — Game & Battle Platform



**Version 1.0** — November 8, 2025



A diverse mini-game entertainment platform (solo & battle) built with Next.js (client) and Node/Express (server). The goal of this project is to operate an online casino featuring multiple mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, etc.), supporting PvP battles (battle rooms), game history, leaderboards, and reward systems.**Phiên bản 1.0** — 08/11/2025



---Một dự án trò chơi nhiều mini-game (solo & battle) được xây dựng với Next.js (client) và Node/Express (server). Mục tiêu của repository này là vận hành một sòng bài nhỏ gồm nhiều mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, v.v.), hỗ trợ trận đấu (pvp/battle rooms), lịch sử, bảng xếp hạng và hệ thống phần thưởng.



## 🚀 Live DemoNền tảng giải trí mini-game đa dạng (solo & battle) được xây dựng với Next.js (client) và Node/Express (server). Mục tiêu của dự án là vận hành một sòng bài trực tuyến gồm nhiều mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, v.v.), hỗ trợ trận đấu PvP (battle rooms), lịch sử ván chơi, bảng xếp hạng và hệ thống phần thưởng.



👉 **[View Demo](https://your-vercel-app.vercel.app)** *(Coming soon!)*Mục tiêu bản 1.0



------- Đồng bộ giao diện solo games thành một hệ thống `SoloGameLayout` / `SoloCard` để giữ nhất quán.



## ✨ Features- Cải thiện header và fairness controls cho các phòng battle.



### 🎮 Solo Games## 🚀 Demo Trực Tuyến- Chuyển đổi các trang solo còn lại (Coinflip, LuckyFive, Tower, Dice, Blackjack Dice, Slots) sang layout chung.

- 🪙 **Coinflip** - Choose heads/tails, flip the coin and win x2

- 🎯 **Dice** - Predict dice outcomes with multiple choices (over/under/even/odd)- Fix lint/compile lỗi gây cản trở deploy (ví dụ: escaping apostrophes, react-hooks deps).

- 🃏 **Blackjack Dice** - Dice version of Blackjack, beat the dealer to get close to 21

- 🎰 **Slots** - Spin 3x3 grid, match 8 lines to win big👉 **[Xem Demo](https://your-vercel-app.vercel.app)** *(Coming soon!)*

- 💣 **Mines** - Find safe tiles, avoid mines and cash out before explosion

- 🗼 **Tower** - Climb the tower, pick correct tiles to multiply winsNội dung chính

- 🎲 **Dice Poker** - Roll 5 dice, create poker hands for payouts

- 🔢 **Lucky Five** - Pick numbers and colors, match results to win---- client/: Frontend Next.js (app router) — giao diện người chơi.

- 🎡 **Roulette** - Bet on numbers/colors, spin the wheel of fortune

- server/: Backend Express API + game controllers + websocket (socket) cho battle rooms.

### ⚔️ Battle (PvP)

- 👥 **Room-based battles** - Create rooms, invite friends, play 1v1 or multiplayer## ✨ Tính Năng- docs/: Ghi chú thiết kế, kế hoạch nâng cấp, security notes.

- 🔒 **Fairness Proof** - Commit-reveal, seed verification, complete audit trail

- 📊 **Live updates** - Real-time status via Socket.io

- 🏆 **Winner takes all** - Winner receives the entire pot

### 🎮 Solo GamesTính năng nổi bật

### 📈 Systems

- 🎯 **Leveling & XP** - Play to level up, unlock achievements- 🪙 **Coinflip** - Chọn mặt ngửa/sấp, flip đồng xu và nhận thưởng x2- Hệ thống solo games (xem `client/src/app/game/*`).

- 💰 **Wallet & Transactions** - Manage balance, detailed transaction history

- 🏅 **Rankings** - Leaderboards by wins, level, earnings- 🎯 **Dice** - Đoán kết quả xúc xắc với nhiều lựa chọn (trên/dưới/chẵn/lẻ)- Phòng battle (pvp) có cơ chế fairness proof (seed / commit-reveal), live via websockets.

- 🎁 **Rewards** - Daily rewards, achievements, streaks

- 📜 **History** - Review all games with seed proof- 🃏 **Blackjack Dice** - Blackjack phiên bản xúc xắc, đấu với dealer để gần 21- Thống kê, lịch sử ván chơi, reward & leveling.

- 🔐 **Auth & Security** - JWT authentication, rate limiting, input validation

- 🎰 **Slots** - Quay 3x3 grid, khớp 8 line để thắng lớn- Hệ thống middleware (auth, rate-limit, validate, error handler).

---

- 💣 **Mines** - Tìm ô an toàn, tránh mìn và cash out trước khi nổ

## 🛠️ Technologies Used

- 🗼 **Tower** - Leo tháp, chọn ô đúng để nhân multiplierKiến trúc & Công nghệ

### Frontend

- **⚛️ Next.js 14** - App router, React Server Components- 🎲 **Dice Poker** - Lắc 5 xúc xắc, tạo poker hand để nhận payout- Frontend: Next.js (React), app router, client components, Tailwind-like utilities.

- **🎨 Tailwind CSS** - Utility-first styling

- **🔥 React Hot Toast** - Elegant notifications- 🔢 **Lucky Five** - Chọn số và màu, khớp kết quả để thắng lớn- Backend: Node.js + Express, MongoDB (mongoose), socket.io cho real-time.

- **🌐 Socket.io Client** - Real-time battle updates

- **🎭 Custom Components** - SoloGameLayout, SoloCard, battle UI primitives- 🎡 **Roulette** - Đặt cược vào số/màu, quay bánh xe may mắn- Tools: react-hot-toast, ESLint, Prettier (project conventions), jest/tests (when present).



### Backend

- **🟢 Node.js + Express** - RESTful API server

- **🍃 MongoDB + Mongoose** - Database & ODM### ⚔️ Battle (PvP)Chạy dự án (phát triển) — Windows (cmd.exe)

- **⚡ Socket.io** - WebSocket server for PvP

- **🔐 JWT** - Token-based authentication- 👥 **Room-based battles** - Tạo phòng, mời bạn bè, đấu 1v1 hoặc multiplayer1) Cài đặt dependencies

- **🛡️ Middleware Stack** - Auth, rate limit, validation, error handling, logging

- 🔒 **Fairness Proof** - Commit-reveal, seed verification, audit trail đầy đủ

### DevOps & Tools

- **🚀 Vercel** - Frontend deployment- 📊 **Live updates** - Trạng thái real-time qua Socket.io```cmd

- **🔧 ESLint + Prettier** - Code quality

- **📦 npm** - Package management- 🏆 **Winner takes all** - Người chiến thắng nhận toàn bộ potcd d:\Downloads\cado4fun\client



---npm install



## 💻 Getting Started### 📈 Hệ Thốngcd ..\..\server



### Requirements- 🎯 **Leveling & XP** - Chơi để lên level, mở khóa thành tựunpm install

- Node.js 18+

- MongoDB (local or Atlas)- 💰 **Wallet & Transactions** - Quản lý balance, lịch sử giao dịch chi tiết```

- npm or yarn

- 🏅 **Rankings** - Bảng xếp hạng theo wins, level, earnings

### Installation

- 🎁 **Rewards** - Phần thưởng hàng ngày, thành tựu, streaks2) Chạy song song client và server (phát triển)

```bash

# Clone repository- 📜 **History** - Xem lại mọi ván chơi với seed proof

git clone https://github.com/nbv9704/4FUNBET.git

cd cado4fun- 🔐 **Auth & Security** - JWT authentication, rate limiting, input validationClient (Next.js):



# Install client dependencies```cmd

cd client

npm install---cd d:\Downloads\cado4fun\client



# Install server dependenciesnpm run dev

cd ../server

npm install## 🛠️ Công Nghệ Sử Dụng```

```



### Environment Variables Setup

### FrontendServer (API + socket):

**Server** (`server/.env`):

```env- **⚛️ Next.js 14** - App router, React Server Components```cmd

MONGO_URI=mongodb://localhost:27017/4funbet

JWT_SECRET=your_secret_key_here- **🎨 Tailwind CSS** - Utility-first stylingcd d:\Downloads\cado4fun\server

SOCKET_SECRET=your_socket_secret

NODE_ENV=development- **🔥 React Hot Toast** - Elegant notificationsnpm run dev

PORT=5000

```- **🌐 Socket.io Client** - Real-time battle updates```



**Client** (if needed):- **🎭 Custom Components** - SoloGameLayout, SoloCard, battle UI primitives

```env

NEXT_PUBLIC_API_BASE=http://localhost:5000/apiMột cách nhanh: mở hai terminal, chạy client và server riêng.

```

### Backend

### Run Development

- **🟢 Node.js + Express** - RESTful API serverBuild & kiểm tra (local)

**Open 2 terminals:**

- **🍃 MongoDB + Mongoose** - Database & ODM

Terminal 1 - Server:

```bash- **⚡ Socket.io** - WebSocket server cho PvP```cmd

cd server

npm run dev- **🔐 JWT** - Token-based authenticationcd d:\Downloads\cado4fun\client

```

- **🛡️ Middleware Stack** - Auth, rate limit, validation, error handling, loggingnpm run build

Terminal 2 - Client:

```bash

cd client

npm run dev### DevOps & Toolscd d:\Downloads\cado4fun\server

```

- **🚀 Vercel** - Frontend deploymentnpm run build   # nếu có script build cho server

Visit: **http://localhost:3000**

- **🔧 ESLint + Prettier** - Code quality```

### Build & Deploy

- **📦 npm** - Package management

**Build client:**

```bashGhi chú về lỗi deploy thường gặp

cd client

npm run build---- Lỗi ESLint trên Vercel: Next.js chạy lint trong build — sửa lỗi `react/no-unescaped-entities` (escape apostrophes với `&apos;` hoặc `&rsquo;`) và `react-hooks/exhaustive-deps` (đảm bảo dependency array đầy đủ).

npm start

```- Nếu build Vercel thất bại: chạy `npm run build` local trong `client` để tái hiện và sửa.



**Build server** (if build script exists):## 💻 Bắt Đầu

```bash

cd serverEnvironment variables (ví dụ)

npm run build

```### Yêu Cầu- Server (server/.env hoặc biến môi trường trên host):



---- Node.js 18+	- MONGO_URI



## 📸 Screenshots- MongoDB (local hoặc Atlas)	- JWT_SECRET



*Coming soon!*- npm hoặc yarn	- SOCKET_SECRET (nếu có)



---	- NODE_ENV=production



## 🎯 Version 1.0 Goals### Cài Đặt



- ✅ Unify solo game interfaces into `SoloGameLayout` / `SoloCard` system- Client (nếu cần):

- ✅ Improve header and fairness controls for battle rooms

- ✅ Migrate all solo games to shared layout```bash	- NEXT_PUBLIC_API_BASE (mặc định /api nếu deploy monorepo)

- ✅ Fix lint/compile errors causing deploy failures (apostrophes, react-hooks deps)

- ✅ Refactor Blackjack Dice and Slots with Solo primitives# Clone repository



---git clone https://github.com/nbv9704/4FUNBET.gitKiểm thử nhanh



## 📂 Project Structurecd cado4fun- Để kiểm tra mạng lưới websocket/battle: start server, vào UI battle và tạo phòng.



```

cado4fun/

├── client/                 # Next.js frontend# Cài đặt dependencies cho clientTriển khai (Vercel) — tóm tắt

│   ├── src/

│   │   ├── app/           # App router pagescd client- Dự án hiện có client (Next.js) và server (Node). Cách phổ biến:

│   │   │   ├── game/      # Solo games

│   │   │   │   ├── coinflip/npm install	- Triển khai `client/` trên Vercel như một project Next.js.

│   │   │   │   ├── dice/

│   │   │   │   ├── blackjackdice/	- Triển khai `server/` trên một server riêng (Heroku, DigitalOcean, Railway, Render) hoặc sử dụng Serverless (nếu ported) — vì socket.io và state in-memory yêu cầu long-running process.

│   │   │   │   ├── slots/

│   │   │   │   ├── mines/# Cài đặt dependencies cho server

│   │   │   │   └── ...

│   │   │   └── game/battle/  # PvP battle roomscd ../serverVercel build checklist

│   │   ├── components/    # Shared components

│   │   │   ├── solo/      # SoloGameLayout, SoloCardnpm install1. Đảm bảo mọi trang Next.js build local thành công: `cd client && npm run build`.

│   │   │   └── battle/    # Battle UI components

│   │   ├── hooks/         # Custom React hooks```2. Fix mọi lỗi ESLint/TypeScript báo trước khi đẩy.

│   │   ├── context/       # Context providers

│   │   └── utils/         # Helpers & utilities3. Nếu bạn deploy `client/` trên Vercel, set môi trường `NEXT_PUBLIC_API_BASE` trỏ tới backend đã deployed.

│   └── package.json

│### Cấu Hình Environment Variables

├── server/                # Express backend

│   ├── controllers/       # Game logic controllersThành phần quan trọng (tệp tham khảo)

│   │   ├── minigames/    # Solo game endpoints

│   │   └── pvp/          # Battle endpoints**Server** (`server/.env`):- `client/src/components/solo/SoloGameLayout.jsx` — layout dùng chung cho solo games.

│   ├── models/           # Mongoose schemas

│   ├── routes/           # API routes```env- `client/src/app/game/*/page.js` — các trang solo games.

│   ├── middleware/       # Auth, validation, etc.

│   ├── socket/           # Socket.io handlersMONGO_URI=mongodb://localhost:27017/4funbet- `client/src/app/game/battle/*/[roomId]/page.js` — battle rooms per-game.

│   └── utils/            # Server utilities

│JWT_SECRET=your_secret_key_here- `server/controllers/minigames/*.js` — game logic endpoints.

├── docs/                 # Documentation

└── README.mdSOCKET_SECRET=your_socket_secret

```

NODE_ENV=developmentCác bước đã thực hiện trong bản 1.0

---

PORT=5000- Hợp nhất UI solo games vào `SoloGameLayout` / `SoloCard`.

## 🔮 Future Features

```- Cập nhật `coinflip`, `luckyfive`, `dice`, `tower`, `coinflip`, `dicepoker`, `blackjackdice`, `slots` pages.

- [ ] 📱 Progressive Web App (PWA)

- [ ] 🌍 Multi-language support (English, Vietnamese)- Sửa lỗi lint/cicd gây fail build (escaping apostrophes; missing hook deps).

- [ ] 🎨 Theme customization

- [ ] 🤝 Friend system & social features**Client** (nếu cần):

- [ ] 🏦 Crypto wallet integration

- [ ] 📊 Advanced analytics & stats```envChangelog — 1.0 (08/11/2025)

- [ ] 🎮 New games (Blackjack, Poker, Baccarat)

- [ ] 🏆 Tournament systemNEXT_PUBLIC_API_BASE=http://localhost:5000/api

- [ ] 🎁 Referral & affiliate program

- [ ] 📧 Email notifications```- Giao diện:

- [ ] 🔔 Push notifications

- [ ] 👤 Profile customization	- Thống nhất layout cho tất cả solo games: `SoloGameLayout` & `SoloCard`.



---### Chạy Development	- Cập nhật style cho `coinflip`, `luckyfive`, `tower`, `dice`, `dicepoker`, `blackjackdice`, `slots`, `mines`, `roulette`.



## 📋 Changelog



### 🎉 Version 1.0 (November 8, 2025)**Mở 2 terminal:**- Chức năng:



#### ✨ UI/UX	- Giữ nguyên logic trò chơi; chỉ refactor giao diện và tổ chức component.

- Unified layout for all solo games with `SoloGameLayout` & `SoloCard`

- Updated styles for: coinflip, luckyfive, tower, dice, dicepoker, blackjackdice, slots, mines, rouletteTerminal 1 - Server:	- Blackjack Dice và Slots đã được tái cấu trúc sử dụng Solo primitives.

- Header stats display balance, bet, multiplier, outcomes

- Responsive design for mobile/tablet/desktop```bash



#### 🎮 Functionalitycd server- Hệ thống & ops:

- Preserved game logic — UI & component refactoring only

- Blackjack Dice: Restructured with Solo primitives, pending game resumenpm run dev	- Fix lỗi ESLint (react/no-unescaped-entities) và missing hook deps (react-hooks/exhaustive-deps) gây build fail trên Vercel.

- Slots: Spin animation cleanup, timeout handling

```

#### 🛡️ System & Ops

- Fixed ESLint errors: `react/no-unescaped-entities` (apostrophes)Hướng dẫn đóng góp

- Fixed `react-hooks/exhaustive-deps` warnings

- Successful Vercel buildTerminal 2 - Client:- Fork → tạo branch feature/x → PR vào branch `main`.



#### 📁 Structure```bash- Tuân thủ ESLint & code style project. Chạy local linter trước khi push.

- Created `client/src/components/solo/` folder

- Shared components: `SoloGameLayout.jsx`, `SoloCard.jsx`cd client

- Utility: `formatCoins()` in `utils/format.js`

npm run devLiên hệ / Maintainers

---

```- Người phát triển: nbv9704 (owner)

## 🐛 Known Issues

- Repo: 4FUNBET

- In-memory state for blackjack games (production should use Redis)

- Rate limiting can be fine-tuned furtherTruy cập: **http://localhost:3000**

- Some games need additional animations/transitions

- SEO meta tags need dynamic contentGhi chú cuối



---### Build & Deploy- README này là bản khởi tạo mô tả tổng quan và changelog cho bản 1.0 (08/11/2025). Nếu bạn muốn thêm badges (CI, coverage), hướng dẫn deploy server, hoặc thông tin môi trường chi tiết hơn, cho tôi biết — tôi sẽ bổ sung ngay.



## 🤝 Contributing



All contributions are welcome! Follow these steps:**Build client:**# Casino4Fun Monorepo



1. Fork the project```bash

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)cd client## Project Layout

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Requestnpm run build- `client/` – Next.js 15 frontend with Tailwind CSS and socket.io client hooks.



**Guidelines:**npm start- `server/` – Express + Socket.IO backend, MongoDB integration, scheduled jobs.

- Follow the project's ESLint config

- Run `npm run build` locally before pushing```- `docs/` – Product and security notes consolidated from previous root markdown files.

- Write clear commit messages

- Update tests if needed



---**Build server** (nếu có script):## Prerequisites



## 👨‍💻 Author```bash- Node.js 20+ (recommended for Next.js 15 and Express 5 tooling).



**Ngô Bảo Việt**cd server- npm or pnpm/yarn; examples below use `npm`.



- GitHub: [@nbv9704](https://github.com/nbv9704)npm run build- MongoDB instance reachable from the backend.

- Repository: [4FUNBET](https://github.com/nbv9704/4FUNBET)

```

---

## Install Dependencies

## 📄 License

---```cmd

This project is released under the MIT License. See [LICENSE](LICENSE) file for details.

cd client

---

## 📸 Screenshotsnpm install

## 🙏 Acknowledgments



- **Next.js Team** - Amazing framework

- **Vercel** - Deployment platform*Coming soon!*cd ..\server

- **MongoDB** - Database solution

- **Socket.io** - Real-time communicationnpm install

- **Tailwind CSS** - Styling framework

---```

---



## 📞 Contact & Support

## 🎯 Mục Tiêu Bản 1.0## Running the Apps Locally

If you have questions, encounter bugs, or want to contribute ideas:

1. **Backend**

- 🐛 [Report bugs](https://github.com/nbv9704/4FUNBET/issues)

- 💡 [Suggest features](https://github.com/nbv9704/4FUNBET/issues/new)- ✅ Đồng bộ giao diện solo games thành hệ thống `SoloGameLayout` / `SoloCard`	```cmd

- 📧 Email: ngobaoviet97@gmail.com

- ✅ Cải thiện header và fairness controls cho battle rooms	cd server

---

- ✅ Chuyển đổi tất cả solo games sang layout chung	npm run dev

<div align="center">

  <strong>⭐ If this project is useful, give it a star! ⭐</strong>- ✅ Fix lint/compile lỗi gây deploy fail (apostrophes, react-hooks deps)	```

  <br><br>

  Made with ❤️ by nbv9704- ✅ Refactor Blackjack Dice và Slots với Solo primitives	The dev script uses `nodemon` to reload `server/server.js`. Configure environment variables based on `server/ENV_CONFIG.md`.

</div>



---2. **Frontend**

	```cmd

## 📂 Cấu Trúc Dự Án	cd client

	npm run dev

```	```

cado4fun/	The Next.js app runs on `http://localhost:3000` by default and proxies API calls to the backend URL set in your env config.

├── client/                 # Next.js frontend

│   ├── src/## Deployment Notes

│   │   ├── app/           # App router pages- Frontend is ready for Vercel; ensure environment variables for API URLs and socket endpoints are defined there.

│   │   │   ├── game/      # Solo games- Backend expects a MongoDB connection string, JWT secret, and socket CORS origins; review `server/ENV_CONFIG.md` and `server/SOCKET_AUTH.md` before deploying.

│   │   │   │   ├── coinflip/

│   │   │   │   ├── dice/## Housekeeping

│   │   │   │   ├── blackjackdice/- Legacy backups and scratch files were removed (`battle_room_backup.js`, `important_code.txt`, etc.).

│   │   │   │   ├── slots/- Root-level `package.json` and `node_modules` were deleted to avoid conflicting dependency trees; work inside `client/` and `server/` packages instead.
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

## 🔮 Tính Năng Tương Lai

- [ ] 📱 Progressive Web App (PWA)
- [ ] 🌍 Đa ngôn ngữ (Tiếng Anh, Tiếng Việt)
- [ ] 🎨 Theme customization
- [ ] 🤝 Friend system & social features
- [ ] 🏦 Crypto wallet integration
- [ ] 📊 Advanced analytics & stats
- [ ] 🎮 Thêm games mới (Blackjack, Poker, Baccarat)
- [ ] 🏆 Tournament system
- [ ] 🎁 Referral & affiliate program
- [ ] 📧 Email notifications
- [ ] 🔔 Push notifications
- [ ] 👤 Profile customization

---

## 📋 Changelog

### 🎉 Version 1.0 (08/11/2025)

#### ✨ Giao Diện
- Thống nhất layout cho tất cả solo games với `SoloGameLayout` & `SoloCard`
- Cập nhật style cho: coinflip, luckyfive, tower, dice, dicepoker, blackjackdice, slots, mines, roulette
- Header stats hiển thị balance, bet, multiplier, outcomes
- Responsive design cho mobile/tablet/desktop

#### 🎮 Chức Năng
- Giữ nguyên logic game — chỉ refactor UI & components
- Blackjack Dice: Restructured với Solo primitives, pending game resume
- Slots: Spin animation cleanup, timeout handling

#### 🛡️ Hệ Thống & Ops
- Fix ESLint errors: `react/no-unescaped-entities` (apostrophes)
- Fix `react-hooks/exhaustive-deps` warnings
- Build success trên Vercel

#### 📁 Cấu Trúc
- Tạo `client/src/components/solo/` folder
- Shared components: `SoloGameLayout.jsx`, `SoloCard.jsx`
- Utility: `formatCoins()` trong `utils/format.js`

---

## 🐛 Known Issues

- In-memory state cho blackjack games (production nên dùng Redis)
- Rate limiting có thể được tinh chỉnh thêm
- Một số game cần thêm animations/transitions
- SEO meta tags cần dynamic content

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Hãy làm theo các bước sau:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

**Lưu ý:**
- Tuân thủ ESLint config của project
- Chạy `npm run build` local trước khi push
- Viết commit message rõ ràng
- Update tests nếu cần

---

## 👨‍💻 Tác Giả

**Ngô Bảo Việt**

- GitHub: [@nbv9704](https://github.com/nbv9704)
- Repository: [4FUNBET](https://github.com/nbv9704/4FUNBET)

---

## 📄 Giấy Phép

Dự án này được phát hành dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🙏 Lời Cảm Ơn

- **Next.js Team** - Framework tuyệt vời
- **Vercel** - Deployment platform
- **MongoDB** - Database solution
- **Socket.io** - Real-time communication
- **Tailwind CSS** - Styling framework

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu bạn có câu hỏi, gặp lỗi hoặc muốn đóng góp ý tưởng:

- 🐛 [Báo lỗi](https://github.com/nbv9704/4FUNBET/issues)
- 💡 [Đề xuất tính năng](https://github.com/nbv9704/4FUNBET/issues/new)
- 📧 Email: ngobaoviet97@gmail.com

---

<div align="center">
  <strong>⭐ Nếu dự án hữu ích, hãy cho một ngôi sao! ⭐</strong>
  <br><br>
  Made with ❤️ by nbv9704
</div>
