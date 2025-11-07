# 🎲 4FUNBET — Game & Battle Platform# 4FUNBET — Game & Battle Platform



**Phiên bản 1.0** — 08/11/2025Phiên bản: 1.0 — 08/11/2025

Một dự án trò chơi nhiều mini-game (solo & battle) được xây dựng với Next.js (client) và Node/Express (server). Mục tiêu của repository này là vận hành một sòng bài nhỏ gồm nhiều mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, v.v.), hỗ trợ trận đấu (pvp/battle rooms), lịch sử, bảng xếp hạng và hệ thống phần thưởng.

Nền tảng giải trí mini-game đa dạng (solo & battle) được xây dựng với Next.js (client) và Node/Express (server). Mục tiêu của dự án là vận hành một sòng bài trực tuyến gồm nhiều mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, v.v.), hỗ trợ trận đấu PvP (battle rooms), lịch sử ván chơi, bảng xếp hạng và hệ thống phần thưởng.

Mục tiêu bản 1.0

---- Đồng bộ giao diện solo games thành một hệ thống `SoloGameLayout` / `SoloCard` để giữ nhất quán.

- Cải thiện header và fairness controls cho các phòng battle.

## 🚀 Demo Trực Tuyến- Chuyển đổi các trang solo còn lại (Coinflip, LuckyFive, Tower, Dice, Blackjack Dice, Slots) sang layout chung.

- Fix lint/compile lỗi gây cản trở deploy (ví dụ: escaping apostrophes, react-hooks deps).

👉 **[Xem Demo](https://your-vercel-app.vercel.app)** *(Coming soon!)*

Nội dung chính

---- client/: Frontend Next.js (app router) — giao diện người chơi.

- server/: Backend Express API + game controllers + websocket (socket) cho battle rooms.

## ✨ Tính Năng- docs/: Ghi chú thiết kế, kế hoạch nâng cấp, security notes.



### 🎮 Solo GamesTính năng nổi bật

- 🪙 **Coinflip** - Chọn mặt ngửa/sấp, flip đồng xu và nhận thưởng x2- Hệ thống solo games (xem `client/src/app/game/*`).

- 🎯 **Dice** - Đoán kết quả xúc xắc với nhiều lựa chọn (trên/dưới/chẵn/lẻ)- Phòng battle (pvp) có cơ chế fairness proof (seed / commit-reveal), live via websockets.

- 🃏 **Blackjack Dice** - Blackjack phiên bản xúc xắc, đấu với dealer để gần 21- Thống kê, lịch sử ván chơi, reward & leveling.

- 🎰 **Slots** - Quay 3x3 grid, khớp 8 line để thắng lớn- Hệ thống middleware (auth, rate-limit, validate, error handler).

- 💣 **Mines** - Tìm ô an toàn, tránh mìn và cash out trước khi nổ

- 🗼 **Tower** - Leo tháp, chọn ô đúng để nhân multiplierKiến trúc & Công nghệ

- 🎲 **Dice Poker** - Lắc 5 xúc xắc, tạo poker hand để nhận payout- Frontend: Next.js (React), app router, client components, Tailwind-like utilities.

- 🔢 **Lucky Five** - Chọn số và màu, khớp kết quả để thắng lớn- Backend: Node.js + Express, MongoDB (mongoose), socket.io cho real-time.

- 🎡 **Roulette** - Đặt cược vào số/màu, quay bánh xe may mắn- Tools: react-hot-toast, ESLint, Prettier (project conventions), jest/tests (when present).



### ⚔️ Battle (PvP)Chạy dự án (phát triển) — Windows (cmd.exe)

- 👥 **Room-based battles** - Tạo phòng, mời bạn bè, đấu 1v1 hoặc multiplayer1) Cài đặt dependencies

- 🔒 **Fairness Proof** - Commit-reveal, seed verification, audit trail đầy đủ

- 📊 **Live updates** - Trạng thái real-time qua Socket.io```cmd

- 🏆 **Winner takes all** - Người chiến thắng nhận toàn bộ potcd d:\Downloads\cado4fun\client

npm install

### 📈 Hệ Thốngcd ..\..\server

- 🎯 **Leveling & XP** - Chơi để lên level, mở khóa thành tựunpm install

- 💰 **Wallet & Transactions** - Quản lý balance, lịch sử giao dịch chi tiết```

- 🏅 **Rankings** - Bảng xếp hạng theo wins, level, earnings

- 🎁 **Rewards** - Phần thưởng hàng ngày, thành tựu, streaks2) Chạy song song client và server (phát triển)

- 📜 **History** - Xem lại mọi ván chơi với seed proof

- 🔐 **Auth & Security** - JWT authentication, rate limiting, input validationClient (Next.js):

```cmd

---cd d:\Downloads\cado4fun\client

npm run dev

## 🛠️ Công Nghệ Sử Dụng```



### FrontendServer (API + socket):

- **⚛️ Next.js 14** - App router, React Server Components```cmd

- **🎨 Tailwind CSS** - Utility-first stylingcd d:\Downloads\cado4fun\server

- **🔥 React Hot Toast** - Elegant notificationsnpm run dev

- **🌐 Socket.io Client** - Real-time battle updates```

- **🎭 Custom Components** - SoloGameLayout, SoloCard, battle UI primitives

Một cách nhanh: mở hai terminal, chạy client và server riêng.

### Backend

- **🟢 Node.js + Express** - RESTful API serverBuild & kiểm tra (local)

- **🍃 MongoDB + Mongoose** - Database & ODM

- **⚡ Socket.io** - WebSocket server cho PvP```cmd

- **🔐 JWT** - Token-based authenticationcd d:\Downloads\cado4fun\client

- **🛡️ Middleware Stack** - Auth, rate limit, validation, error handling, loggingnpm run build



### DevOps & Toolscd d:\Downloads\cado4fun\server

- **🚀 Vercel** - Frontend deploymentnpm run build   # nếu có script build cho server

- **🔧 ESLint + Prettier** - Code quality```

- **📦 npm** - Package management

Ghi chú về lỗi deploy thường gặp

---- Lỗi ESLint trên Vercel: Next.js chạy lint trong build — sửa lỗi `react/no-unescaped-entities` (escape apostrophes với `&apos;` hoặc `&rsquo;`) và `react-hooks/exhaustive-deps` (đảm bảo dependency array đầy đủ).

- Nếu build Vercel thất bại: chạy `npm run build` local trong `client` để tái hiện và sửa.

## 💻 Bắt Đầu

Environment variables (ví dụ)

### Yêu Cầu- Server (server/.env hoặc biến môi trường trên host):

- Node.js 18+	- MONGO_URI

- MongoDB (local hoặc Atlas)	- JWT_SECRET

- npm hoặc yarn	- SOCKET_SECRET (nếu có)

	- NODE_ENV=production

### Cài Đặt

- Client (nếu cần):

```bash	- NEXT_PUBLIC_API_BASE (mặc định /api nếu deploy monorepo)

# Clone repository

git clone https://github.com/nbv9704/4FUNBET.gitKiểm thử nhanh

cd cado4fun- Để kiểm tra mạng lưới websocket/battle: start server, vào UI battle và tạo phòng.



# Cài đặt dependencies cho clientTriển khai (Vercel) — tóm tắt

cd client- Dự án hiện có client (Next.js) và server (Node). Cách phổ biến:

npm install	- Triển khai `client/` trên Vercel như một project Next.js.

	- Triển khai `server/` trên một server riêng (Heroku, DigitalOcean, Railway, Render) hoặc sử dụng Serverless (nếu ported) — vì socket.io và state in-memory yêu cầu long-running process.

# Cài đặt dependencies cho server

cd ../serverVercel build checklist

npm install1. Đảm bảo mọi trang Next.js build local thành công: `cd client && npm run build`.

```2. Fix mọi lỗi ESLint/TypeScript báo trước khi đẩy.

3. Nếu bạn deploy `client/` trên Vercel, set môi trường `NEXT_PUBLIC_API_BASE` trỏ tới backend đã deployed.

### Cấu Hình Environment Variables

Thành phần quan trọng (tệp tham khảo)

**Server** (`server/.env`):- `client/src/components/solo/SoloGameLayout.jsx` — layout dùng chung cho solo games.

```env- `client/src/app/game/*/page.js` — các trang solo games.

MONGO_URI=mongodb://localhost:27017/4funbet- `client/src/app/game/battle/*/[roomId]/page.js` — battle rooms per-game.

JWT_SECRET=your_secret_key_here- `server/controllers/minigames/*.js` — game logic endpoints.

SOCKET_SECRET=your_socket_secret

NODE_ENV=developmentCác bước đã thực hiện trong bản 1.0

PORT=5000- Hợp nhất UI solo games vào `SoloGameLayout` / `SoloCard`.

```- Cập nhật `coinflip`, `luckyfive`, `dice`, `tower`, `coinflip`, `dicepoker`, `blackjackdice`, `slots` pages.

- Sửa lỗi lint/cicd gây fail build (escaping apostrophes; missing hook deps).

**Client** (nếu cần):

```envChangelog — 1.0 (08/11/2025)

NEXT_PUBLIC_API_BASE=http://localhost:5000/api

```- Giao diện:

	- Thống nhất layout cho tất cả solo games: `SoloGameLayout` & `SoloCard`.

### Chạy Development	- Cập nhật style cho `coinflip`, `luckyfive`, `tower`, `dice`, `dicepoker`, `blackjackdice`, `slots`, `mines`, `roulette`.



**Mở 2 terminal:**- Chức năng:

	- Giữ nguyên logic trò chơi; chỉ refactor giao diện và tổ chức component.

Terminal 1 - Server:	- Blackjack Dice và Slots đã được tái cấu trúc sử dụng Solo primitives.

```bash

cd server- Hệ thống & ops:

npm run dev	- Fix lỗi ESLint (react/no-unescaped-entities) và missing hook deps (react-hooks/exhaustive-deps) gây build fail trên Vercel.

```

Hướng dẫn đóng góp

Terminal 2 - Client:- Fork → tạo branch feature/x → PR vào branch `main`.

```bash- Tuân thủ ESLint & code style project. Chạy local linter trước khi push.

cd client

npm run devLiên hệ / Maintainers

```- Người phát triển: nbv9704 (owner)

- Repo: 4FUNBET

Truy cập: **http://localhost:3000**

Ghi chú cuối

### Build & Deploy- README này là bản khởi tạo mô tả tổng quan và changelog cho bản 1.0 (08/11/2025). Nếu bạn muốn thêm badges (CI, coverage), hướng dẫn deploy server, hoặc thông tin môi trường chi tiết hơn, cho tôi biết — tôi sẽ bổ sung ngay.



**Build client:**# Casino4Fun Monorepo

```bash

cd client## Project Layout

npm run build- `client/` – Next.js 15 frontend with Tailwind CSS and socket.io client hooks.

npm start- `server/` – Express + Socket.IO backend, MongoDB integration, scheduled jobs.

```- `docs/` – Product and security notes consolidated from previous root markdown files.



**Build server** (nếu có script):## Prerequisites

```bash- Node.js 20+ (recommended for Next.js 15 and Express 5 tooling).

cd server- npm or pnpm/yarn; examples below use `npm`.

npm run build- MongoDB instance reachable from the backend.

```

## Install Dependencies

---```cmd

cd client

## 📸 Screenshotsnpm install



*Coming soon!*cd ..\server

npm install

---```



## 🎯 Mục Tiêu Bản 1.0## Running the Apps Locally

1. **Backend**

- ✅ Đồng bộ giao diện solo games thành hệ thống `SoloGameLayout` / `SoloCard`	```cmd

- ✅ Cải thiện header và fairness controls cho battle rooms	cd server

- ✅ Chuyển đổi tất cả solo games sang layout chung	npm run dev

- ✅ Fix lint/compile lỗi gây deploy fail (apostrophes, react-hooks deps)	```

- ✅ Refactor Blackjack Dice và Slots với Solo primitives	The dev script uses `nodemon` to reload `server/server.js`. Configure environment variables based on `server/ENV_CONFIG.md`.



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
