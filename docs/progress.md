# 📌 CASI4F - Progress Tracking

## ✅ A. ĐÃ HOÀN THÀNH
### 1. Hoàn thiện hệ thống hiện tại
- [x] Wallet UI với Deposit/Withdraw cơ bản.
- [x] Game history.
- [x] Game API (coinflip, dice...).
- [x] Transaction API.
- [x] Daily/Hourly/Weekly bonus.
- [x] Tách Profile/Settings:
  - app/settings/page.js cho đổi email/username/password.
  - profile/page.js chỉ hiển thị thông tin user.
- [x] Wallet transaction history:
  - Tab "Transaction History" vào Wallet UI.
  - API /transactions lấy deposit/withdraw.
- [x] Refactor Navbar:
  - Navbar theo logic mới (hamburger khi login).
  - Wallet 2 tầng (balance + bank) click được.

### 2. Notification System nâng cao
- [x] models/Notification.js (userId, type, message, read, createdAt).
- [x] notificationRoutes.js (fetch, mark as read).
- [x] socket.io backend push realtime.
- [x] Frontend: hooks/useSocket.js, NotificationBell + dropdown.

### 3. PvP Service (sườn cơ bản)
- [x] Backend:
  - models/PvpRoom.js (roomId, players[], bets[], status).
  - pvpRoutes.js (create/join, ready/start cơ bản).
  - socket.io handler cho PvP events.
- [x] Frontend:
  - PvP UI cơ bản (room list, join/create).
  - Realtime update qua socket.
- [x] Logic mới:
  - Start chỉ yêu cầu participant ready, owner không cần.
  - Invite gửi realtime qua socket (chưa lưu DB).
- [x] Nâng cấp bổ sung:
  - `roomId` rút gọn 5 ký tự (a-z, A-Z, 0-9) + kiểm tra unique khi tạo.
  - Slot hiển thị username + avatar nhỏ (thay vì _id).
  - Xóa phần "Joined at" trong slot.
  - Notification invite hiển thị username đúng, không lặp.

### 3*. PvP Service (nâng cao) – phần đã xong
- [x] Backend: Lưu PvP invite vào Notification DB + kèm link join room.
- [x] Frontend: NotificationBell click vào invite → auto **join phòng** rồi **redirect** vào room.

---

## ⏳ B. CHƯA HOÀN THÀNH
### 1. PvP Service (nâng cao) – phần còn lại
- [ ] UI Invite chọn user từ danh sách bạn bè thay vì prompt.

### 2. Leaderboard
- [ ] Backend:
  - models/Leaderboard.js hoặc tổng hợp từ game_logs.
  - leaderboardRoutes.js (top winners theo tuần/tháng).
- [ ] Frontend: Page leaderboard hiển thị bảng xếp hạng.

### 3. Lottery System
- [ ] Backend:
  - models/Lottery.js (tickets[], drawDate, winners).
  - lotteryRoutes.js (buy ticket, draw result).
  - cron/lottery.js auto draw 2 lần/tuần.
- [ ] Frontend: UI lottery (mua vé, xem kết quả gần nhất).

### 4. Game Lobby nâng cấp
- [x] Thêm UI dạng card (icon, tỉ lệ thắng, min bet).
- [x] Filter (PvP / Single Player).
- [x] PvP button trỏ tới PvP Lobby.

### 5. Database bổ sung
- [x] PvpRoom.js (đã có).
- [ ] Leaderboard.js.
- [ ] Lottery.js.

### 6. Cleanup & Optimization
- [ ] Tối ưu API (pagination cho history/transaction).
- [ ] Tối ưu UI (loading state, error handling).
- [ ] Bảo mật: thêm JWT refresh + rate limit trước khi mở public.
- [ ] Dọn code, log, cấu hình env.

### 7. Security & Reliability Improvements ✅
- [x] **MongoDB Transaction Safety**: Thêm transactions cho tất cả solo game controllers (atomicity cho balance + history + logs).
- [x] **Provably Fair Seeds Migration**: Di chuyển seeds từ memory sang MongoDB với TTL index (persist qua server restarts).
- [x] **Environment Config Validation**: Validate MONGO_URI, JWT_SECRET, PORT, etc. khi server khởi động (fail-fast).
- [x] **Socket.IO Authentication**: JWT auth cho tất cả socket connections, secure PvP games (prevent spoofing).

---

## 🚧 C. Localization & UI Modernization Mapping

### 1. Core App Pages
- [x] `app/settings/page.js` – localized + gradient card layout (done)
- [x] `app/profile/page.js` – localized + modernized (done)
- [x] `app/history/page.js` – localized + modernized (done)
- [x] `app/wallet/page.js` – localized + modernized (done)
- [ ] `app/page.js` – home/dashboard needs localization + new hero/cards
- [x] `app/login/page.js` – full localization, gradient auth layout, error toasts
- [x] `app/register/page.js` – same treatment as login
- [x] `app/notifications/page.js` – translate strings, align to new card style
- [ ] `app/rewards/page.js` – translate copy, upgrade reward cards & hero
- [x] `app/game/page.js` – convert lobby filters/headers to new style, localize copy
- [x] `app/game/solo/page.js` & `app/game/battle/page.js` – localized lobby selectors with new hero layouts
- [ ] `app/admin/**` – audit admin dashboards/forms for localization & styling
- [ ] `app/notifications/*` detail routes (if any) – confirm coverage
- [x] Dịch đầy đủ nội dung cho các trang `Provably fair`, `Terms of Service` và `Security & privacy`

### 2. Game Detail Pages (`app/game/*`)
- [ ] `game/battle`, `game/solo`, `game/roulette`, `game/slots`, `game/mines`, etc. – translate all prompts/tooltips/results, align layouts with shared components
- [ ] Ensure provably-fair dialogs/messages are pulled from i18n keys

### 3. Auth & Utility Routes
- [x] `app/login/page.js` & `app/register/page.js` – shared auth card component with i18n strings
- [ ] `app/api` route responses/messages – confirm backend error messages mapped via `errorMap`

### 4. Shared Components (frontend)
- [ ] `components/ConfirmDialog.jsx`, `PromptDialog.jsx`, `VerifyFairnessModal.jsx` – replace hard-coded labels/buttons with `useLocale`
- [x] `components/GameCard.jsx`, `GameFilterBar.jsx`, `GameDetailModal.jsx` – translate UI text/tooltips và áp dụng gradient/card mới
- [ ] `components/TurnTimer.jsx`, `ConfirmDialog.jsx`, `PromptDialog.jsx`, `VerifyFairnessModal.jsx` – tiếp tục nội địa hóa & chuẩn hóa giao diện
- [x] `components/NotificationBell.jsx` dropdown labels/status chips – ensure translations
- [x] `components/Navbar.jsx` – verify remaining literal strings (e.g., “Game”, “Rewards”) move into locale map
- [ ] `components/Layout.jsx`, skeleton/loading states – replace fallback strings with `t('loading.*')`

### 5. Contexts & Hooks
- [ ] `hooks/useApi.js` toasts – map server error codes to localized messages
- [ ] `hooks/useSocket.js`, other hooks – replace literal console/toast messaging
- [ ] `context/UserContext.jsx` – ensure default values/notifications use locale

### 6. Shared Utilities & Toast Copy
- [ ] `utils/*` helpers returning user-facing text (fairness notices, notifications) – wrap with `t`
- [ ] `server` responses that bubble up to UI – confirm `errorMap` contains localized copy for both languages

### 7. Design System Extraction (optional but recommended)
- [ ] Factor out reusable hero/header component with gradient background
- [ ] Factor out stat card & action panel primitives to reduce Tailwind duplication
- [ ] Document typography/color tokens for consistency across upgraded pages

---

## 📋 Feature Verification Checklist
- [x] Profile nâng cao – `app/profile/page.jsx`, `components/profile/*`
- [ ] History & Analytics – `/history`, enhanced filters & streak/graph logic (`historyController.js`)
- [ ] Level-up Rewards – rewards flow (`levelRewards.js`, `rewardController.js`, `app/rewards`, `components/rewards/*`)
- [ ] Admin Dashboard – new layout with realtime data (`app/admin/**`, `adminRoutes.js`, `controllers/*`)
- [ ] Social Phase 1 – friends API + UI (`friendController.js`, `socialRoutes.js`, `app/friends`, `components/chat/*`)
- [ ] Advanced Notifications – achievements/reminders, NotificationBell & cron (`achievementMilestones.js`, `achievements.js`, `history.js`, `friendController.js`, `dailyRewardReminder.js`, `NotificationBell.jsx`, `/notifications`)
