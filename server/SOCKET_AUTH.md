# Socket.IO Authentication

## 🔐 Overview

All Socket.IO connections now require JWT authentication. This prevents unauthorized access to real-time features including PvP games, notifications, and live updates.

## Implementation

### Server-Side

**Authentication Middleware** (`middleware/socketAuth.js`):
```javascript
// Applied to all socket connections
io.use(socketAuthMiddleware);
```

**What it does:**
1. ✅ Extracts JWT token from handshake (`auth.token` or `query.token`)
2. ✅ Verifies token with `JWT_SECRET`
3. ✅ Validates user ID format (MongoDB ObjectId)
4. ✅ Attaches `socket.userId`, `socket.userRole`, `socket.user` for authorization
5. ❌ Rejects connection with error code if authentication fails

**Error Codes:**
- `AUTH_TOKEN_MISSING` - No token provided
- `AUTH_TOKEN_EXPIRED` - Token has expired
- `AUTH_TOKEN_INVALID` - Invalid token signature
- `AUTH_TOKEN_INVALID_USER_ID` - Invalid user ID format
- `AUTH_FAILED` - General authentication failure

### Client-Side

**Connection with Authentication:**

```javascript
import { io } from 'socket.io-client';

// Get JWT token from localStorage/cookies
const token = localStorage.getItem('token');

const socket = io('http://localhost:3001', {
  auth: {
    token: token  // ✅ Preferred method
  }
  // OR
  // query: {
  //   token: token  // ✅ Alternative method
  // }
});

// Handle authentication errors
socket.on('connect_error', (err) => {
  if (err.message === 'AUTH_TOKEN_MISSING') {
    console.error('Authentication required');
    // Redirect to login
  }
  if (err.message === 'AUTH_TOKEN_EXPIRED') {
    console.error('Token expired, please login again');
    // Refresh token or redirect to login
  }
});

socket.on('connect', () => {
  console.log('✅ Connected and authenticated');
  // Now safe to emit events
  socket.emit('register', userId);
});
```

## Security Features

### ✅ Authenticated Events

All socket events are now protected:

1. **User Registration**
   ```javascript
   socket.on('register', (userId) => {
     // ✅ Verify userId matches authenticated user
     if (socket.userId !== userId) {
       socket.emit('error', { message: 'Unauthorized: User ID mismatch' });
       return;
     }
     // Register user
   });
   ```

2. **PvP Room Operations**
   ```javascript
   // socket.userId is available in all handlers
   socket.on('pvp:joinRoomChannel', (roomId) => {
     // ✅ User is authenticated
     // Can safely track which user joined which room
     socket.join(`pvp:${roomId}`);
   });
   ```

### 🔐 Benefits

- **Prevent Spoofing**: Users can't impersonate others
- **Authorization**: Know exactly who is performing each action
- **Audit Trail**: Log authenticated user actions
- **Rate Limiting**: Apply per-user rate limits
- **Data Privacy**: Only send data to authorized users

## Testing

### Valid Connection
```bash
# Test with valid token
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_VALID_JWT_TOKEN' }
});
socket.on('connect', () => console.log('✅ Connected'));
socket.on('connect_error', (err) => console.error('❌ Error:', err.message));
"
```

### Invalid Connection
```bash
# Test without token (should fail)
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3001');
socket.on('connect_error', (err) => console.log('✅ Correctly rejected:', err.message));
"
```

## Migration Guide

### Frontend Changes Required

Update all Socket.IO client connections:

**Before:**
```javascript
const socket = io('http://localhost:3001');
```

**After:**
```javascript
const token = localStorage.getItem('token');
const socket = io('http://localhost:3001', {
  auth: { token }
});
```

### Reconnection Handling

```javascript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server forced disconnect (likely auth failure)
    // User needs to re-authenticate
    window.location.href = '/login';
  }
  // Socket.IO will auto-reconnect for other reasons
});
```

## Best Practices

1. ✅ **Always validate token on client before connecting**
2. ✅ **Handle token expiration gracefully** (refresh or redirect to login)
3. ✅ **Use `auth` parameter** (not query string for sensitive tokens)
4. ✅ **Store tokens securely** (httpOnly cookies preferred over localStorage)
5. ✅ **Implement token refresh** for long-lived connections
6. ✅ **Log authentication failures** for security monitoring

## Troubleshooting

### Connection Refused
- Check if token is valid and not expired
- Verify `JWT_SECRET` matches between token generation and validation
- Ensure token is passed in `auth` or `query` parameter

### User ID Mismatch
- Token payload must include valid MongoDB ObjectId in `id` field
- Client should not send different `userId` than token claims

### Logs
```bash
# Check authentication logs
grep "Socket authenticated" logs/app.log
grep "Socket authentication failed" logs/app.log
```

## Related Files

- `server/middleware/socketAuth.js` - Authentication middleware
- `server/server.js` - Socket.IO setup with auth
- `server/socket/pvp.js` - Secured PvP socket handlers
- `server/middleware/auth.js` - HTTP JWT auth (reference)
