# Environment Configuration Guide

This document explains how to configure environment variables for the 4FUNBET server.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Set required variables:**
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **Start the server:**
   ```bash
   npm start
   ```

## Required Variables

### MONGO_URI (Required)
MongoDB connection string. Must be a valid URI.

**Development:**
```env
MONGO_URI=mongodb://localhost:27017/cado4fun
```

**Production (MongoDB Atlas):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cado4fun?retryWrites=true&w=majority
```

### JWT_SECRET (Required)
Secret key for JWT token signing. Must be at least 32 characters.

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example:
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## Optional Variables

All optional variables have sensible defaults. Override them as needed.

### Server Configuration

```env
PORT=3001                    # Server port (default: 3001)
NODE_ENV=development         # Environment: development, production, test (default: development)
```

### CORS Configuration

```env
CLIENT_URL=http://localhost:3000      # Frontend URL for CORS (default: http://localhost:3000)
FRONTEND_URL=http://localhost:3000    # Alternative frontend URL (default: http://localhost:3000)
```

### Security

```env
SESSION_SECRET=your_session_secret    # Session secret (auto-generated if not set)
```

### Rate Limiting

```env
RATE_LIMIT_MAX=100          # Max requests per window (default: 100)
RATE_LIMIT_WINDOW=15        # Time window in minutes (default: 15)
```

### Logging

```env
LOG_LEVEL=info              # Log level: error, warn, info, debug (default: info)
HTTP_LOG_LEVEL=info         # HTTP log level (default: info)
HTTP_LOG_IGNORE_PATHS=/api/admin/pvp/health  # Paths to ignore in HTTP logs
```

### Game Configuration

```env
MIN_BET_AMOUNT=1            # Minimum bet (default: 1)
MAX_BET_AMOUNT=10000        # Maximum bet (default: 10000)
```

### Rewards

```env
HOURLY_REWARD=50            # Hourly reward amount (default: 50)
DAILY_REWARD=500            # Daily reward amount (default: 500)
WEEKLY_REWARD=5000          # Weekly reward amount (default: 5000)
```

### PvP Configuration

```env
PVP_CLEANUP_INTERVAL=5      # Cleanup interval in minutes (default: 5)
PVP_ROOM_TIMEOUT=30         # Room timeout in minutes (default: 30)
PVP_SWEEP_INTERVAL_MS=60000 # Sweep interval in ms (default: 60000)
PVP_MAX_WAITING_AGE_MS=1800000  # Max waiting age in ms (default: 1800000)
PVP_COINFLIP_GRACE_MS=10000     # Coinflip grace period in ms (default: 10000)
PVP_DICE_GRACE_MS=4000          # Dice grace period in ms (default: 4000)
PVP_DICE_IDLE_MS=60000          # Dice idle timeout in ms (default: 60000)
PVP_DICE_UNSTARTED_REFUND_MS=900000  # Unstarted refund timeout in ms (default: 900000)
PVP_CRON_LOG_LEVEL=error        # PvP cron log level (default: error)
PVP_CRON_FILE_LOG=0             # Enable file logging: 0 or 1 (default: 0)
PVP_CRON_LOG_DIR=./logs         # Log directory (default: ./logs)
PVP_CRON_LOG_MAX_MB=10          # Max log file size in MB (default: 10)
```

## Validation

The server validates all environment variables on startup. If validation fails, the server will:

1. Display detailed error messages
2. Exit with code 1
3. Prevent server startup

### Common Validation Errors

**Missing MONGO_URI:**
```
❌ MONGO_URI is required - please set your MongoDB connection string
```
**Solution:** Set `MONGO_URI` in your `.env` file

**JWT_SECRET too short:**
```
❌ JWT_SECRET must be at least 32 characters long for security
```
**Solution:** Generate a new secret with the command above

**Invalid PORT:**
```
❌ PORT must be a valid port number
```
**Solution:** Set `PORT` to a number between 1 and 65535

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET` (minimum 32 characters)
- [ ] Use MongoDB Atlas or a secure MongoDB instance
- [ ] Set appropriate `CLIENT_URL` and `FRONTEND_URL`
- [ ] Configure rate limiting appropriately
- [ ] Set `LOG_LEVEL=warn` or `LOG_LEVEL=error`
- [ ] Review all PvP timeouts for your use case
- [ ] Never commit `.env` file to git

## Troubleshooting

### Server won't start

1. Check if `.env` file exists in the `server/` directory
2. Verify all required variables are set
3. Check the console for validation error messages
4. Compare your `.env` with `.env.example`

### MongoDB connection fails

1. Verify `MONGO_URI` is correct
2. Check if MongoDB is running (for local)
3. Verify network connectivity (for Atlas)
4. Check credentials in the connection string

### JWT errors

1. Ensure `JWT_SECRET` is at least 32 characters
2. Don't use special characters that need escaping
3. Generate a new secret if unsure

## Security Notes

- **Never commit `.env` files** to version control
- Store production secrets in secure secret management systems
- Rotate `JWT_SECRET` periodically
- Use environment-specific `.env` files
- Limit access to `.env` files (chmod 600)

## Support

For issues related to environment configuration, please check:
1. This documentation
2. `.env.example` file
3. Server startup error messages
4. Project README.md
