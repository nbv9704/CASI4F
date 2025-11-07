# 4FUNBET — Game & Battle Platform

Phiên bản: 1.0 — 08/11/2025
Một dự án trò chơi nhiều mini-game (solo & battle) được xây dựng với Next.js (client) và Node/Express (server). Mục tiêu của repository này là vận hành một sòng bài nhỏ gồm nhiều mini-games (coinflip, dice, blackjack-dice, dice-poker, slots, mines, v.v.), hỗ trợ trận đấu (pvp/battle rooms), lịch sử, bảng xếp hạng và hệ thống phần thưởng.

Mục tiêu bản 1.0
- Đồng bộ giao diện solo games thành một hệ thống `SoloGameLayout` / `SoloCard` để giữ nhất quán.
- Cải thiện header và fairness controls cho các phòng battle.
- Chuyển đổi các trang solo còn lại (Coinflip, LuckyFive, Tower, Dice, Blackjack Dice, Slots) sang layout chung.
- Fix lint/compile lỗi gây cản trở deploy (ví dụ: escaping apostrophes, react-hooks deps).

Nội dung chính
- client/: Frontend Next.js (app router) — giao diện người chơi.
- server/: Backend Express API + game controllers + websocket (socket) cho battle rooms.
- docs/: Ghi chú thiết kế, kế hoạch nâng cấp, security notes.

Tính năng nổi bật
- Hệ thống solo games (xem `client/src/app/game/*`).
- Phòng battle (pvp) có cơ chế fairness proof (seed / commit-reveal), live via websockets.
- Thống kê, lịch sử ván chơi, reward & leveling.
- Hệ thống middleware (auth, rate-limit, validate, error handler).

Kiến trúc & Công nghệ
- Frontend: Next.js (React), app router, client components, Tailwind-like utilities.
- Backend: Node.js + Express, MongoDB (mongoose), socket.io cho real-time.
- Tools: react-hot-toast, ESLint, Prettier (project conventions), jest/tests (when present).

Chạy dự án (phát triển) — Windows (cmd.exe)
1) Cài đặt dependencies

```cmd
cd d:\Downloads\cado4fun\client
npm install
cd ..\..\server
npm install
```

2) Chạy song song client và server (phát triển)

Client (Next.js):
```cmd
cd d:\Downloads\cado4fun\client
npm run dev
```

Server (API + socket):
```cmd
cd d:\Downloads\cado4fun\server
npm run dev
```

Một cách nhanh: mở hai terminal, chạy client và server riêng.

Build & kiểm tra (local)

```cmd
cd d:\Downloads\cado4fun\client
npm run build

cd d:\Downloads\cado4fun\server
npm run build   # nếu có script build cho server
```

Ghi chú về lỗi deploy thường gặp
- Lỗi ESLint trên Vercel: Next.js chạy lint trong build — sửa lỗi `react/no-unescaped-entities` (escape apostrophes với `&apos;` hoặc `&rsquo;`) và `react-hooks/exhaustive-deps` (đảm bảo dependency array đầy đủ).
- Nếu build Vercel thất bại: chạy `npm run build` local trong `client` để tái hiện và sửa.

Environment variables (ví dụ)
- Server (server/.env hoặc biến môi trường trên host):
	- MONGO_URI
	- JWT_SECRET
	- SOCKET_SECRET (nếu có)
	- NODE_ENV=production

- Client (nếu cần):
	- NEXT_PUBLIC_API_BASE (mặc định /api nếu deploy monorepo)

Kiểm thử nhanh
- Để kiểm tra mạng lưới websocket/battle: start server, vào UI battle và tạo phòng.

Triển khai (Vercel) — tóm tắt
- Dự án hiện có client (Next.js) và server (Node). Cách phổ biến:
	- Triển khai `client/` trên Vercel như một project Next.js.
	- Triển khai `server/` trên một server riêng (Heroku, DigitalOcean, Railway, Render) hoặc sử dụng Serverless (nếu ported) — vì socket.io và state in-memory yêu cầu long-running process.

Vercel build checklist
1. Đảm bảo mọi trang Next.js build local thành công: `cd client && npm run build`.
2. Fix mọi lỗi ESLint/TypeScript báo trước khi đẩy.
3. Nếu bạn deploy `client/` trên Vercel, set môi trường `NEXT_PUBLIC_API_BASE` trỏ tới backend đã deployed.

Thành phần quan trọng (tệp tham khảo)
- `client/src/components/solo/SoloGameLayout.jsx` — layout dùng chung cho solo games.
- `client/src/app/game/*/page.js` — các trang solo games.
- `client/src/app/game/battle/*/[roomId]/page.js` — battle rooms per-game.
- `server/controllers/minigames/*.js` — game logic endpoints.

Các bước đã thực hiện trong bản 1.0
- Hợp nhất UI solo games vào `SoloGameLayout` / `SoloCard`.
- Cập nhật `coinflip`, `luckyfive`, `dice`, `tower`, `coinflip`, `dicepoker`, `blackjackdice`, `slots` pages.
- Sửa lỗi lint/cicd gây fail build (escaping apostrophes; missing hook deps).

Changelog — 1.0 (08/11/2025)

- Giao diện:
	- Thống nhất layout cho tất cả solo games: `SoloGameLayout` & `SoloCard`.
	- Cập nhật style cho `coinflip`, `luckyfive`, `tower`, `dice`, `dicepoker`, `blackjackdice`, `slots`, `mines`, `roulette`.

- Chức năng:
	- Giữ nguyên logic trò chơi; chỉ refactor giao diện và tổ chức component.
	- Blackjack Dice và Slots đã được tái cấu trúc sử dụng Solo primitives.

- Hệ thống & ops:
	- Fix lỗi ESLint (react/no-unescaped-entities) và missing hook deps (react-hooks/exhaustive-deps) gây build fail trên Vercel.

Hướng dẫn đóng góp
- Fork → tạo branch feature/x → PR vào branch `main`.
- Tuân thủ ESLint & code style project. Chạy local linter trước khi push.

Liên hệ / Maintainers
- Người phát triển: nbv9704 (owner)
- Repo: 4FUNBET

Ghi chú cuối
- README này là bản khởi tạo mô tả tổng quan và changelog cho bản 1.0 (08/11/2025). Nếu bạn muốn thêm badges (CI, coverage), hướng dẫn deploy server, hoặc thông tin môi trường chi tiết hơn, cho tôi biết — tôi sẽ bổ sung ngay.

# Casino4Fun Monorepo

## Project Layout
- `client/` – Next.js 15 frontend with Tailwind CSS and socket.io client hooks.
- `server/` – Express + Socket.IO backend, MongoDB integration, scheduled jobs.
- `docs/` – Product and security notes consolidated from previous root markdown files.

## Prerequisites
- Node.js 20+ (recommended for Next.js 15 and Express 5 tooling).
- npm or pnpm/yarn; examples below use `npm`.
- MongoDB instance reachable from the backend.

## Install Dependencies
```cmd
cd client
npm install

cd ..\server
npm install
```

## Running the Apps Locally
1. **Backend**
	```cmd
	cd server
	npm run dev
	```
	The dev script uses `nodemon` to reload `server/server.js`. Configure environment variables based on `server/ENV_CONFIG.md`.

2. **Frontend**
	```cmd
	cd client
	npm run dev
	```
	The Next.js app runs on `http://localhost:3000` by default and proxies API calls to the backend URL set in your env config.

## Deployment Notes
- Frontend is ready for Vercel; ensure environment variables for API URLs and socket endpoints are defined there.
- Backend expects a MongoDB connection string, JWT secret, and socket CORS origins; review `server/ENV_CONFIG.md` and `server/SOCKET_AUTH.md` before deploying.

## Housekeeping
- Legacy backups and scratch files were removed (`battle_room_backup.js`, `important_code.txt`, etc.).
- Root-level `package.json` and `node_modules` were deleted to avoid conflicting dependency trees; work inside `client/` and `server/` packages instead.