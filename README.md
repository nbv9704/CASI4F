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