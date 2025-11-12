# Temporarily Disabled Features

> Last updated: 2025-11-10

## Strict Rate Limiting (server/middleware/rateLimitStrict.js)
- **What changed**: The strict rate limiters now short-circuit to `next()` in non-production environments.
- **Why**: Needed to unblock local testing after multiple failed login attempts triggered the auth lockout.
- **How to restore**:
  - Deploy with `NODE_ENV=production`, **or**
  - Set `ENABLE_STRICT_RATE_LIMIT=true` in the environment and restart the server.

Keep this file updated whenever we temporarily disable, comment out, or remove behavior so we can track and revert the changes later.
