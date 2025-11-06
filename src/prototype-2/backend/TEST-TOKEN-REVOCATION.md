# Token Revocation Testing Guide

## Overview

This document provides comprehensive testing procedures for the token revocation system implemented in tasks 1.3.7, 1.3.8, and 1.3.9.

## Prerequisites

### Environment Setup

1. **Redis Server Running**
   ```bash
   # Start Redis (Windows with Chocolatey)
   redis-server

   # OR using Docker
   docker run -d -p 6379:6379 redis:latest

   # Verify Redis is running
   redis-cli ping
   # Expected output: PONG
   ```

2. **Backend Environment Variables**

   Ensure `.env` file has:
   ```env
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   # REDIS_PASSWORD= (optional)

   # JWT Configuration
   JWT_SECRET=your-secret-key-min-32-chars-long
   JWT_ACCESS_TOKEN_EXPIRES_IN=15m
   JWT_REFRESH_TOKEN_EXPIRES_IN=7d
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm run dev

   # Expected output:
   # ✅ Environment configuration loaded
   # ✅ Redis connected
   # 🚀 Backend server started successfully
   ```

## Testing Scenarios

### Test 1: Single Token Revocation (Logout)

**Objective:** Verify `/api/1/auth/logout` revokes a specific token

**SPEC References:**
- SPEC-AU-LO-005: Revoke specific refresh_token
- SPEC-AU-LO-006: Revocation is immediate
- SPEC-AU-LO-007: Revoked token cannot be used

**Steps:**

1. **Generate a test token** (simulate login)
   ```bash
   # Using curl or Postman
   POST http://localhost:3000/api/1/auth/logout
   Content-Type: application/json

   {
     "refresh_token": "test-token-12345"
   }
   ```

2. **Expected Response - Success (HTTP 200)**
   ```json
   {
     "code": "success",
     "message": "Token revoked successfully"
   }
   ```

3. **Verify in Redis**
   ```bash
   redis-cli

   # Get token data (hash of token)
   GET refresh_token:<hash-of-test-token-12345>

   # Should show revoked: true
   ```

4. **Test Idempotency** - Call logout again with same token
   ```bash
   # Should still return 200 success (idempotent)
   ```

5. **Expected Behavior:**
   - ✅ First call: Marks token as revoked
   - ✅ Subsequent calls: Succeed silently (SPEC-AU-LO-011: idempotent)
   - ✅ Token cannot be used for refresh

**Error Cases:**

| Scenario | HTTP Status | Response Code | Response Message |
|----------|-------------|---------------|------------------|
| Missing refresh_token | 400 | `missing_token` | "Refresh token is required" |
| Redis connection error | 500 | Internal error | Error logged to console |

---

### Test 2: Logout All (Revoke All User Tokens)

**Objective:** Verify `/api/1/auth/logout-all` revokes all user tokens

**SPEC References:**
- SPEC-AU-LA-008: Revoke ALL refresh tokens for user
- SPEC-AU-LA-009: Revocation is immediate
- SPEC-AU-LA-010: All sessions must be terminated

**Steps:**

1. **Create multiple tokens for a user** (simulate multiple devices)
   ```bash
   # Token 1
   redis-cli
   SET refresh_token:hash1 '{"user_id":"user-123","revoked":false}'
   SADD user_tokens:user-123 hash1

   # Token 2
   SET refresh_token:hash2 '{"user_id":"user-123","revoked":false}'
   SADD user_tokens:user-123 hash2

   # Token 3
   SET refresh_token:hash3 '{"user_id":"user-123","revoked":false}'
   SADD user_tokens:user-123 hash3
   ```

2. **Generate access token for user** (using JWT service)
   ```bash
   # You'll need a valid access_token (JWT) for the user
   # Can be obtained from /login or generated for testing
   ```

3. **Call logout-all with access token**
   ```bash
   # Method 1: Authorization header (recommended)
   POST http://localhost:3000/api/1/auth/logout-all
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Method 2: Body
   POST http://localhost:3000/api/1/auth/logout-all
   Content-Type: application/json

   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }

   # Method 3: Cookie
   POST http://localhost:3000/api/1/auth/logout-all
   Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Expected Response - Success (HTTP 200)**
   ```json
   {
     "code": "success",
     "message": "Revoked 3 token(s) successfully",
     "tokens_revoked": 3
   }
   ```

4. **Verify in Redis** - All tokens marked as revoked
   ```bash
   redis-cli

   GET refresh_token:hash1
   # Should show "revoked": true

   GET refresh_token:hash2
   # Should show "revoked": true

   GET refresh_token:hash3
   # Should show "revoked": true
   ```

**Error Cases:**

| Scenario | HTTP Status | Response Code | Response Message |
|----------|-------------|---------------|------------------|
| Missing access_token | 401 | `missing_token` | "Access token is required" |
| Invalid JWT format | 401 | `invalid_token` | "Access token is invalid" |
| Expired JWT | 401 | `token_expired` | "Access token has expired" |
| JWT missing user ID | 401 | `invalid_token` | "Token does not contain user ID" |
| User has no tokens | 200 | `success` | "All sessions logged out successfully" (tokens_revoked: 0) |
| Redis connection error | 500 | Internal error | Error logged to console |

---

### Test 3: Token Reuse Detection & Family Revocation

**Objective:** Verify reuse detection triggers family revocation

**SPEC References:**
- SPEC-AU-RF-008: Detect token reuse
- SPEC-AU-RF-009: Reuse revokes entire family
- SPEC-AU-RF-019: Reuse returns HTTP 401
- SPEC-AU-RF-023: Reuse invalidates entire family

**Steps:**

1. **Create token family** (simulate refresh chain)
   ```bash
   redis-cli

   # Token 1 (original)
   SET refresh_token:hash1 '{"user_id":"user-123","family_id":"family-abc","consumed_at":1234567890,"revoked":false}'
   SADD family_tokens:family-abc hash1

   # Token 2 (rotated from token 1)
   SET refresh_token:hash2 '{"user_id":"user-123","family_id":"family-abc","revoked":false}'
   SADD family_tokens:family-abc hash2

   # Token 3 (rotated from token 2)
   SET refresh_token:hash3 '{"user_id":"user-123","family_id":"family-abc","revoked":false}'
   SADD family_tokens:family-abc hash3
   ```

2. **Attempt to use consumed token** (simulate reuse)
   ```bash
   POST http://localhost:3000/api/1/auth/refresh
   Content-Type: application/json

   {
     "refresh_token": "original-token-1"
   }
   ```

3. **Expected Response - Reuse Detected (HTTP 401)**
   ```json
   {
     "code": "token_reused",
     "message": "Refresh token has been reused. All sessions have been revoked for security."
   }
   ```

4. **Verify Family Revocation**
   ```bash
   redis-cli

   # All family tokens should be revoked
   GET refresh_token:hash1
   # Should show "revoked": true

   GET refresh_token:hash2
   # Should show "revoked": true

   GET refresh_token:hash3
   # Should show "revoked": true
   ```

5. **Check Console Logs**
   ```
   Expected logs:
   ⚠️ Token reuse detected { userId: 'user-123', familyId: 'family-abc', ... }
   🚨 Token family revoked due to reuse { familyId: 'family-abc', userId: 'user-123' }
   ```

**Security Impact:**
- ✅ Entire token family is invalidated
- ✅ All sessions in that family are terminated
- ✅ User must re-authenticate
- ✅ Prevents further unauthorized access

---

### Test 4: Token Rotation with Revocation

**Objective:** Verify token rotation marks old token as consumed

**SPEC References:**
- SPEC-AU-RF-011: Token rotation
- SPEC-AU-RF-012: Old token invalidated

**Steps:**

1. **Create valid refresh token**
   ```bash
   redis-cli

   SET refresh_token:hash1 '{"user_id":"user-123","family_id":"family-xyz","issued_at":1234567890,"expires_at":9999999999,"revoked":false}'
   SADD user_tokens:user-123 hash1
   SADD family_tokens:family-xyz hash1
   ```

2. **Use token for refresh**
   ```bash
   POST http://localhost:3000/api/1/auth/refresh
   Content-Type: application/json

   {
     "refresh_token": "original-token-1"
   }
   ```

3. **Expected Response - Success (HTTP 200)**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refresh_token": "new-rotated-token-abc123",
     "token_type": "bearer",
     "expires_in": 900
   }
   ```

4. **Verify Old Token Marked Consumed**
   ```bash
   redis-cli

   GET refresh_token:hash1
   # Should now have "consumed_at": <timestamp>
   ```

5. **Attempt to reuse old token**
   ```bash
   POST http://localhost:3000/api/1/auth/refresh
   Content-Type: application/json

   {
     "refresh_token": "original-token-1"
   }
   ```

6. **Expected Response - Reuse Detected (HTTP 401)**
   ```json
   {
     "code": "token_reused",
     "message": "Refresh token has been reused. All sessions have been revoked for security."
   }
   ```

---

### Test 5: Graceful Error Handling

**Objective:** Verify system handles errors gracefully

**Error Scenarios:**

#### 5.1 Redis Connection Lost

1. **Stop Redis while backend is running**
   ```bash
   # Stop Redis service
   redis-cli shutdown
   ```

2. **Attempt logout**
   ```bash
   POST http://localhost:3000/api/1/auth/logout
   Content-Type: application/json

   {
     "refresh_token": "test-token"
   }
   ```

3. **Expected Behavior:**
   - HTTP 500 Internal Server Error
   - Error logged to console
   - No crash/hang

#### 5.2 Invalid Token Format

1. **Send malformed token**
   ```bash
   POST http://localhost:3000/api/1/auth/refresh
   Content-Type: application/json

   {
     "refresh_token": "not-a-valid-token"
   }
   ```

2. **Expected Response (HTTP 401)**
   ```json
   {
     "code": "invalid_token",
     "message": "Refresh token is invalid or expired"
   }
   ```

#### 5.3 Expired Token

1. **Create expired token in Redis**
   ```bash
   redis-cli

   SET refresh_token:hashX '{"user_id":"user-123","expires_at":1234567890,"revoked":false}'
   # expires_at is in the past
   ```

2. **Attempt to use expired token**

3. **Expected Response (HTTP 401)**
   ```json
   {
     "code": "token_expired",
     "message": "Refresh token has expired"
   }
   ```

---

## Performance & Security Validation

### Performance Tests

1. **Concurrent Logout Requests**
   ```bash
   # Use Apache Bench or similar
   ab -n 100 -c 10 -T 'application/json' -p logout.json \
      http://localhost:3000/api/1/auth/logout
   ```

   **Expected:** All requests succeed without errors

2. **Logout-All with Many Tokens**
   ```bash
   # Create 100 tokens for user
   for i in {1..100}; do
     redis-cli SET "refresh_token:hash$i" "{\"user_id\":\"user-123\",\"revoked\":false}"
     redis-cli SADD "user_tokens:user-123" "hash$i"
   done

   # Call logout-all
   # Expected: All 100 tokens revoked in < 1 second
   ```

### Security Tests

1. **Token Cannot Be Used After Revocation**
   - Revoke token
   - Attempt refresh with revoked token
   - Expected: HTTP 401, cannot refresh

2. **Family Revocation Is Complete**
   - Trigger reuse detection
   - Verify ALL family tokens are revoked
   - Attempt to use any family token
   - Expected: All fail with HTTP 401

3. **Revocation Is Immediate**
   - Revoke token
   - Immediately attempt to use it
   - Expected: Fails immediately (no delay)

---

## Redis Data Inspection

### Key Patterns

```bash
redis-cli

# List all refresh tokens
KEYS refresh_token:*

# List user's tokens
SMEMBERS user_tokens:user-123

# List family's tokens
SMEMBERS family_tokens:family-abc

# Get token data
GET refresh_token:hash1

# Check TTL (time to live)
TTL refresh_token:hash1
```

### Expected Data Structure

**Refresh Token Data:**
```json
{
  "token_hash": "sha256-hash-of-token",
  "user_id": "user-123",
  "family_id": "family-abc",
  "issued_at": 1234567890,
  "expires_at": 1234567890,
  "consumed_at": 1234567890,  // Present only if consumed
  "revoked": true,             // true if revoked
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

---

## Cleanup After Testing

```bash
redis-cli

# Delete all test tokens
KEYS refresh_token:* | xargs redis-cli DEL

# Delete all test user token sets
KEYS user_tokens:* | xargs redis-cli DEL

# Delete all test family token sets
KEYS family_tokens:* | xargs redis-cli DEL

# Or flush entire database (CAUTION: deletes everything)
FLUSHDB
```

---

## Compliance Checklist

### SPEC-AU-LO (Logout) Requirements

- [x] SPEC-AU-LO-001: Accept refresh_token in body JSON
- [x] SPEC-AU-LO-002: Accept refresh_token in HTTP-only cookie
- [x] SPEC-AU-LO-003: Body has priority if both present
- [x] SPEC-AU-LO-005: Revoke specific refresh_token
- [x] SPEC-AU-LO-006: Revocation is immediate
- [x] SPEC-AU-LO-007: Revoked token cannot be used
- [x] SPEC-AU-LO-008: Return HTTP 200 on success
- [x] SPEC-AU-LO-009: Return code "success"
- [x] SPEC-AU-LO-010: Return message
- [x] SPEC-AU-LO-011: Token invalid can return success (idempotent)

### SPEC-AU-LA (Logout-All) Requirements

- [x] SPEC-AU-LA-001: Accept access_token in body JSON
- [x] SPEC-AU-LA-002: Accept access_token in header Authorization: Bearer
- [x] SPEC-AU-LA-003: Accept access_token in HTTP-only cookie
- [x] SPEC-AU-LA-004: Priority order: header > body > cookie
- [x] SPEC-AU-LA-005: Backend validates access_token (JWT)
- [x] SPEC-AU-LA-006: Backend extracts userId from token
- [x] SPEC-AU-LA-008: Revoke ALL refresh tokens for user
- [x] SPEC-AU-LA-009: Revocation is immediate
- [x] SPEC-AU-LA-010: All sessions terminated
- [x] SPEC-AU-LA-011: Return HTTP 200 on success
- [x] SPEC-AU-LA-012: Return code "success"
- [x] SPEC-AU-LA-013: Return message
- [x] SPEC-AU-LA-014: Return number of sessions revoked
- [x] SPEC-AU-LA-015: Invalid token returns HTTP 401
- [x] SPEC-AU-LA-016: Expired token returns HTTP 401
- [x] SPEC-AU-LA-017: Internal error returns HTTP 500

### SPEC-AU-RF (Refresh) Reuse Detection

- [x] SPEC-AU-RF-008: Detect token reuse
- [x] SPEC-AU-RF-009: Reuse revokes entire family
- [x] SPEC-AU-RF-012: Old token invalidated
- [x] SPEC-AU-RF-019: Reuse returns HTTP 401
- [x] SPEC-AU-RF-020: Return appropriate code and message
- [x] SPEC-AU-RF-023: Reuse invalidates entire family

---

## Known Limitations & Future Improvements

### Current Limitations

1. **No Audit Trail:**
   - Revocations are logged to console
   - No persistent audit log
   - **Recommendation:** Add audit logging service

2. **Cookie Support:**
   - Cookie parsing requires `cookie-parser` middleware
   - Ensure middleware is configured in app setup
   - **Recommendation:** Verify cookie-parser is installed and configured

3. **SCAN vs KEYS:**
   - Uses Redis KEYS command (blocking)
   - SPEC plan recommended SCAN (non-blocking)
   - **Note:** Current implementation works, but SCAN is more production-ready

### Recommended Improvements

1. **Add Metrics:**
   - Track revocation count
   - Monitor reuse detection frequency
   - Alert on suspicious patterns

2. **Add Rate Limiting:**
   - Limit logout attempts per IP
   - Prevent abuse of revocation endpoints

3. **Add Notification:**
   - Notify user when tokens are revoked
   - Email alert on reuse detection

---

## Troubleshooting

### Backend won't start

**Symptom:** Backend crashes on startup

**Solutions:**
1. Check Redis is running: `redis-cli ping`
2. Verify `.env` file exists and has all required variables
3. Check port 3000 is not in use: `netstat -ano | findstr :3000`

### Tokens not being revoked

**Symptom:** Token still works after revocation

**Check:**
1. Redis data: `redis-cli GET refresh_token:<hash>`
2. Verify `revoked: true` is set
3. Check backend logs for errors

### Reuse detection not working

**Symptom:** Reused token doesn't trigger family revocation

**Check:**
1. Token has `consumed_at` field set
2. Verify token is in family set: `redis-cli SMEMBERS family_tokens:<familyId>`
3. Check backend console for warning logs

---

## Success Criteria

✅ **All tests pass**
✅ **SPEC requirements met**
✅ **No errors in backend logs**
✅ **Redis data structure correct**
✅ **Security features working (reuse detection, family revocation)**
✅ **Error handling graceful**
✅ **Performance acceptable (< 1s for logout-all with 100 tokens)**

---

## Contact & Support

For issues or questions about token revocation:
- Check backend console logs
- Inspect Redis data directly
- Review SPEC-authentication.md for requirements
- Review implementation in `backend/src/services/tokenRotation.service.ts`
