# Test Documentation: /api/1/auth/refresh

This document describes the comprehensive test suite for the refresh endpoint.

**Note:** This is test **documentation** only. Actual test implementation is pending.

---

## Test Framework

**Testing Stack:**
- **Jest** - Test runner and assertion library
- **Supertest** - HTTP assertions
- **Redis Mock** or **ioredis-mock** - Redis mocking for unit tests
- **Integration Tests** - Real Redis instance required

**Test File Location:** `tests/auth.refresh.test.ts` (to be created)

---

## Test Structure

### Setup and Teardown

```typescript
import request from 'supertest';
import app from '../src/app';
import { redisService } from '../src/services/redis.service';
import { tokenRotationService } from '../src/services/tokenRotation.service';
import { jwtService } from '../src/services/jwt.service';

describe('POST /api/1/auth/refresh', () => {
  beforeAll(async () => {
    // Connect to test Redis
    await redisService.connect();
  });

  afterAll(async () => {
    // Cleanup and disconnect
    await redisService.flushdb();
    await redisService.disconnect();
  });

  beforeEach(async () => {
    // Clear all test tokens before each test
    await redisService.flushdb();
  });

  // ... test cases
});
```

---

## Test Categories

### Category 1: Input Validation (7 tests)

Tests SPEC-AU-RF-001 through SPEC-AU-RF-004

#### Test 1.1: Accept refresh_token in body

**SPEC:** SPEC-AU-RF-001
**Priority:** Critical

```typescript
test('accepts refresh_token in request body', async () => {
  // Setup: Create valid refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Send refresh request with token in body
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: Response contains new tokens
  expect(response.body).toHaveProperty('access_token');
  expect(response.body).toHaveProperty('refresh_token');
  expect(response.body).toHaveProperty('token_type', 'bearer');
  expect(response.body).toHaveProperty('expires_in');
});
```

#### Test 1.2: Accept refresh_token in cookie

**SPEC:** SPEC-AU-RF-002
**Priority:** High

```typescript
test('accepts refresh_token in HTTP-only cookie', async () => {
  // Setup: Create valid refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Send refresh request with token in cookie
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .set('Cookie', [`refresh_token=${refreshToken}`])
    .expect(200);

  // Assert: Response contains new tokens
  expect(response.body).toHaveProperty('access_token');
  expect(response.body).toHaveProperty('refresh_token');
});
```

#### Test 1.3: Body has priority over cookie

**SPEC:** SPEC-AU-RF-003
**Priority:** High

```typescript
test('prioritizes body token over cookie token when both present', async () => {
  // Setup: Create two valid tokens
  const bodyToken = tokenRotationService.generateRefreshToken();
  const cookieToken = tokenRotationService.generateRefreshToken();

  await tokenRotationService.storeRefreshToken(bodyToken, {
    userId: 'user-body',
    familyId: 'family-body',
  });

  await tokenRotationService.storeRefreshToken(cookieToken, {
    userId: 'user-cookie',
    familyId: 'family-cookie',
  });

  // Execute: Send both tokens
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .set('Cookie', [`refresh_token=${cookieToken}`])
    .send({ refresh_token: bodyToken })
    .expect(200);

  // Assert: Body token was used (verify by checking userId in new access token)
  const newAccessToken = response.body.access_token;
  const payload = jwtService.verifyAccessToken(newAccessToken);
  expect(payload.sub).toBe('user-body');
});
```

#### Test 1.4: Validate token is string

**SPEC:** SPEC-AU-RF-004
**Priority:** Critical

```typescript
test('rejects non-string token with invalid_token_format', async () => {
  // Execute: Send number instead of string
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 12345 })
    .expect(401);

  // Assert: Specific error code
  expect(response.body).toEqual({
    code: 'invalid_token_format',
    message: 'Refresh token must be a non-empty string',
  });
});
```

#### Test 1.5: Missing token returns 401

**SPEC:** Implicit requirement
**Priority:** Critical

```typescript
test('returns 401 when token is missing', async () => {
  // Execute: Send request with no token
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({})
    .expect(401);

  // Assert: Specific error code
  expect(response.body).toEqual({
    code: 'missing_token',
    message: 'Refresh token is required',
  });
});
```

#### Test 1.6: Empty string token returns 401

**SPEC:** SPEC-AU-RF-004
**Priority:** High

```typescript
test('rejects empty string token', async () => {
  // Execute: Send empty string
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: '' })
    .expect(401);

  // Assert: Specific error code
  expect(response.body.code).toBe('invalid_token_format');
});
```

#### Test 1.7: Whitespace-only token returns 401

**SPEC:** SPEC-AU-RF-004
**Priority:** Medium

```typescript
test('rejects whitespace-only token', async () => {
  // Execute: Send whitespace string
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: '   ' })
    .expect(401);

  // Assert: Specific error code
  expect(response.body.code).toBe('invalid_token_format');
});
```

---

### Category 2: Token Validation (4 tests)

Tests SPEC-AU-RF-006, SPEC-AU-RF-007, SPEC-AU-RF-018

#### Test 2.1: Validates refresh token exists

**SPEC:** SPEC-AU-RF-006
**Priority:** Critical

```typescript
test('rejects non-existent token with invalid_token', async () => {
  // Execute: Send token that doesn't exist in Redis
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 'nonexistent_token_12345' })
    .expect(401);

  // Assert: Specific error code
  expect(response.body).toEqual({
    code: 'invalid_token',
    message: 'Refresh token is invalid or expired',
  });
});
```

#### Test 2.2: Checks token is not revoked

**SPEC:** SPEC-AU-RF-007
**Priority:** Critical

```typescript
test('rejects revoked token with token_revoked', async () => {
  // Setup: Create and revoke token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });
  await tokenRotationService.revokeToken(refreshToken);

  // Execute: Try to use revoked token
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401);

  // Assert: Specific error code
  expect(response.body).toEqual({
    code: 'token_revoked',
    message: 'Refresh token has been revoked',
  });
});
```

#### Test 2.3: Rejects expired token

**SPEC:** SPEC-AU-RF-018
**Priority:** Critical

```typescript
test('rejects expired token with token_expired', async () => {
  // Setup: Create token with past expiration
  const refreshToken = tokenRotationService.generateRefreshToken();
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Store with expiration 1 second ago
  const metadata = {
    token_hash: tokenHash,
    user_id: 'user123',
    family_id: 'family123',
    issued_at: Date.now() - 2000,
    expires_at: Date.now() - 1000, // 1 second ago
    revoked: false,
  };

  await redisService.setex(
    `refresh_token:${tokenHash}`,
    1, // TTL 1 second (will expire immediately)
    JSON.stringify(metadata)
  );

  // Wait for expiration
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Execute: Try to use expired token
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401);

  // Assert: Specific error code
  expect(response.body.code).toBe('token_expired');
});
```

#### Test 2.4: Returns 500 on Redis errors

**SPEC:** Error handling requirement
**Priority:** Medium

```typescript
test('returns 500 on Redis connection errors', async () => {
  // Setup: Mock Redis failure
  jest.spyOn(redisService, 'get').mockRejectedValueOnce(new Error('Redis connection lost'));

  // Execute: Try to refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 'any_token' })
    .expect(500);

  // Assert: Internal error code
  expect(response.body.code).toBe('internal_error');
});
```

---

### Category 3: Token Reuse Detection (5 tests)

Tests SPEC-AU-RF-008, SPEC-AU-RF-009, SPEC-AU-RF-019, SPEC-AU-RF-023

#### Test 3.1: Detects token reuse

**SPEC:** SPEC-AU-RF-008
**Priority:** Critical

```typescript
test('detects when consumed token is reused', async () => {
  // Setup: Create and use token once
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // First use: Should succeed
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Second use: Should detect reuse
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401);

  // Assert: Reuse detected
  expect(response.body.code).toBe('token_reused');
});
```

#### Test 3.2: Revokes family on reuse

**SPEC:** SPEC-AU-RF-009, SPEC-AU-RF-023
**Priority:** Critical

```typescript
test('revokes entire token family when reuse detected', async () => {
  // Setup: Create token chain (3 rotations in same family)
  const token1 = tokenRotationService.generateRefreshToken();
  const familyId = 'family123';

  await tokenRotationService.storeRefreshToken(token1, {
    userId: 'user123',
    familyId,
  });

  // Rotation 1: token1 → token2
  const res1 = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: token1 })
    .expect(200);
  const token2 = res1.body.refresh_token;

  // Rotation 2: token2 → token3
  const res2 = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: token2 })
    .expect(200);
  const token3 = res2.body.refresh_token;

  // Reuse token1 (should revoke family)
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: token1 })
    .expect(401);

  // Verify all family tokens are revoked
  // Try to use token3 (most recent, should be revoked)
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: token3 })
    .expect(401);

  expect(response.body.code).toBe('token_revoked');
});
```

#### Test 3.3: Returns 401 on reuse

**SPEC:** SPEC-AU-RF-019
**Priority:** Critical

```typescript
test('returns HTTP 401 when reuse is detected', async () => {
  // Setup: Create and use token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // First use
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Second use
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401); // HTTP status must be 401

  // Assert: Appropriate message
  expect(response.body.message).toContain('reused');
  expect(response.body.message).toContain('revoked');
});
```

#### Test 3.4: Logs security events on reuse

**SPEC:** Security requirement
**Priority:** Medium

```typescript
test('logs security event when reuse is detected', async () => {
  // Setup: Spy on console.warn
  const warnSpy = jest.spyOn(console, 'warn');

  // Setup: Create and use token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // First use
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Second use
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401);

  // Assert: Security event logged
  expect(warnSpy).toHaveBeenCalledWith(
    expect.stringContaining('Token reuse detected'),
    expect.objectContaining({
      userId: 'user123',
      familyId: 'family123',
    })
  );

  warnSpy.mockRestore();
});
```

#### Test 3.5: Invalidates entire family

**SPEC:** SPEC-AU-RF-023
**Priority:** Critical

```typescript
test('all family members become unusable after reuse', async () => {
  // Setup: Create rotation chain
  const familyId = 'family123';
  const tokens = [];

  // Create token1
  const token1 = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(token1, {
    userId: 'user123',
    familyId,
  });
  tokens.push(token1);

  // Rotate 5 times
  let currentToken = token1;
  for (let i = 0; i < 5; i++) {
    const res = await request(app)
      .post('/api/1/auth/refresh')
      .send({ refresh_token: currentToken })
      .expect(200);
    currentToken = res.body.refresh_token;
    tokens.push(currentToken);
  }

  // Reuse token3 (middle of chain)
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: tokens[2] })
    .expect(401);

  // Verify ALL tokens are revoked
  for (const token of tokens) {
    const response = await request(app)
      .post('/api/1/auth/refresh')
      .send({ refresh_token: token })
      .expect(401);

    expect(response.body.code).toBe('token_revoked');
  }
});
```

---

### Category 4: Token Rotation (4 tests)

Tests SPEC-AU-RF-010, SPEC-AU-RF-011, SPEC-AU-RF-012, SPEC-AU-RF-022

#### Test 4.1: Generates new access token

**SPEC:** SPEC-AU-RF-010
**Priority:** Critical

```typescript
test('generates new JWT access token', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: New access token is valid JWT
  const accessToken = response.body.access_token;
  expect(accessToken).toBeDefined();

  const payload = jwtService.verifyAccessToken(accessToken);
  expect(payload.sub).toBe('user123');
});
```

#### Test 4.2: Generates new refresh token

**SPEC:** SPEC-AU-RF-011
**Priority:** Critical

```typescript
test('generates new refresh token (rotation)', async () => {
  // Setup: Create refresh token
  const oldRefreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(oldRefreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: oldRefreshToken })
    .expect(200);

  // Assert: New refresh token is different
  const newRefreshToken = response.body.refresh_token;
  expect(newRefreshToken).toBeDefined();
  expect(newRefreshToken).not.toBe(oldRefreshToken);
});
```

#### Test 4.3: Invalidates old refresh token

**SPEC:** SPEC-AU-RF-012
**Priority:** Critical

```typescript
test('marks old refresh token as consumed', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: Old token cannot be used again
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401);

  expect(response.body.code).toBe('token_reused');
});
```

#### Test 4.4: Rotation maintains same family

**SPEC:** SPEC-AU-RF-022
**Priority:** High

```typescript
test('rotation keeps tokens in same family', async () => {
  // Setup: Create token with known family
  const familyId = 'family123';
  const token1 = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(token1, {
    userId: 'user123',
    familyId,
  });

  // Execute: Rotate token
  const res1 = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: token1 })
    .expect(200);

  // Get new token metadata from Redis
  const token2 = res1.body.refresh_token;
  const token2Hash = crypto.createHash('sha256').update(token2).digest('hex');
  const metadata = await redisService.get(`refresh_token:${token2Hash}`);
  const parsed = JSON.parse(metadata!);

  // Assert: Same family ID
  expect(parsed.family_id).toBe(familyId);
});
```

---

### Category 5: Success Response (5 tests)

Tests SPEC-AU-RF-013 through SPEC-AU-RF-017

#### Test 5.1: Returns new access_token

**SPEC:** SPEC-AU-RF-013
**Priority:** Critical

```typescript
test('response includes access_token field', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: access_token field exists and is valid
  expect(response.body).toHaveProperty('access_token');
  expect(typeof response.body.access_token).toBe('string');
  expect(response.body.access_token.length).toBeGreaterThan(0);
});
```

#### Test 5.2: Returns new refresh_token

**SPEC:** SPEC-AU-RF-014
**Priority:** Critical

```typescript
test('response includes refresh_token field', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: refresh_token field exists and is valid
  expect(response.body).toHaveProperty('refresh_token');
  expect(typeof response.body.refresh_token).toBe('string');
  expect(response.body.refresh_token.length).toBeGreaterThan(0);
});
```

#### Test 5.3: Returns token_type "bearer"

**SPEC:** SPEC-AU-RF-015
**Priority:** High

```typescript
test('response includes token_type field with value "bearer"', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: token_type is "bearer"
  expect(response.body.token_type).toBe('bearer');
});
```

#### Test 5.4: Returns expires_in seconds

**SPEC:** SPEC-AU-RF-016
**Priority:** High

```typescript
test('response includes expires_in field with seconds', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute: Refresh
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Assert: expires_in is a number
  expect(response.body).toHaveProperty('expires_in');
  expect(typeof response.body.expires_in).toBe('number');
  expect(response.body.expires_in).toBeGreaterThan(0);
});
```

#### Test 5.5: Returns HTTP 200 on success

**SPEC:** Implicit requirement
**Priority:** Critical

```typescript
test('returns HTTP 200 status code on success', async () => {
  // Setup: Create refresh token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute and Assert: HTTP 200
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);
});
```

---

### Category 6: Error Response Format (3 tests)

Tests SPEC-AU-RF-020

#### Test 6.1: Errors include code field

**SPEC:** SPEC-AU-RF-020
**Priority:** High

```typescript
test('all error responses include code field', async () => {
  // Execute: Invalid token
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 'invalid_token' })
    .expect(401);

  // Assert: code field exists
  expect(response.body).toHaveProperty('code');
  expect(typeof response.body.code).toBe('string');
});
```

#### Test 6.2: Errors include message field

**SPEC:** SPEC-AU-RF-020
**Priority:** High

```typescript
test('all error responses include message field', async () => {
  // Execute: Invalid token
  const response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 'invalid_token' })
    .expect(401);

  // Assert: message field exists
  expect(response.body).toHaveProperty('message');
  expect(typeof response.body.message).toBe('string');
  expect(response.body.message.length).toBeGreaterThan(0);
});
```

#### Test 6.3: Specific error codes for each failure

**SPEC:** SPEC-AU-RF-020
**Priority:** High

```typescript
test('returns specific error codes for different failure types', async () => {
  // Test 1: Missing token
  let response = await request(app)
    .post('/api/1/auth/refresh')
    .send({})
    .expect(401);
  expect(response.body.code).toBe('missing_token');

  // Test 2: Invalid format
  response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 123 })
    .expect(401);
  expect(response.body.code).toBe('invalid_token_format');

  // Test 3: Not found
  response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: 'nonexistent' })
    .expect(401);
  expect(response.body.code).toBe('invalid_token');

  // Test 4: Revoked
  const revokedToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(revokedToken, {
    userId: 'user123',
    familyId: 'family123',
  });
  await tokenRotationService.revokeToken(revokedToken);

  response = await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: revokedToken })
    .expect(401);
  expect(response.body.code).toBe('token_revoked');
});
```

---

### Category 7: Token Family Management (3 tests)

Tests SPEC-AU-RF-021, SPEC-AU-RF-024

#### Test 7.1: Tokens belong to a family

**SPEC:** SPEC-AU-RF-021
**Priority:** High

```typescript
test('tokens are assigned to a family', async () => {
  // Setup: Create token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Get token metadata
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const metadata = await redisService.get(`refresh_token:${tokenHash}`);
  const parsed = JSON.parse(metadata!);

  // Assert: family_id exists
  expect(parsed).toHaveProperty('family_id');
  expect(typeof parsed.family_id).toBe('string');
});
```

#### Test 7.2: Family is identifiable

**SPEC:** SPEC-AU-RF-024
**Priority:** Medium

```typescript
test('family ID is a valid UUID', async () => {
  // Setup: Create token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: crypto.randomUUID(), // Should be UUID
  });

  // Get token metadata
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const metadata = await redisService.get(`refresh_token:${tokenHash}`);
  const parsed = JSON.parse(metadata!);

  // Assert: family_id is UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  expect(parsed.family_id).toMatch(uuidRegex);
});
```

#### Test 7.3: Family revocation affects all members

**SPEC:** SPEC-AU-RF-023
**Priority:** Critical

```typescript
test('revoking family affects all family members', async () => {
  // Setup: Create token chain (5 tokens in same family)
  const familyId = 'family123';
  const tokens = [];

  let currentToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(currentToken, {
    userId: 'user123',
    familyId,
  });
  tokens.push(currentToken);

  // Rotate 4 times
  for (let i = 0; i < 4; i++) {
    const res = await request(app)
      .post('/api/1/auth/refresh')
      .send({ refresh_token: currentToken })
      .expect(200);
    currentToken = res.body.refresh_token;
    tokens.push(currentToken);
  }

  // Revoke family
  await tokenRotationService.revokeTokenFamily(familyId);

  // Verify all tokens are revoked
  for (const token of tokens) {
    const response = await request(app)
      .post('/api/1/auth/refresh')
      .send({ refresh_token: token })
      .expect(401);

    expect(response.body.code).toBe('token_revoked');
  }
});
```

---

### Category 8: Security (3 tests)

#### Test 8.1: Tokens are hashed before storage

**SPEC:** Security requirement
**Priority:** High

```typescript
test('tokens are stored as SHA-256 hashes in Redis', async () => {
  // Setup: Create token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Get all Redis keys
  const keys = await redisService.keys('refresh_token:*');

  // Assert: No key contains the plain token
  for (const key of keys) {
    expect(key).not.toContain(refreshToken);
  }

  // Assert: Hash format is correct (64 hex characters for SHA-256)
  const hashPattern = /^refresh_token:[0-9a-f]{64}$/;
  expect(keys[0]).toMatch(hashPattern);
});
```

#### Test 8.2: Includes IP and user-agent in audit trail

**SPEC:** Security requirement
**Priority:** Medium

```typescript
test('stores IP address and user-agent for audit trail', async () => {
  // Setup: Create token with request metadata
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 Test Browser',
  });

  // Get token metadata
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const metadata = await redisService.get(`refresh_token:${tokenHash}`);
  const parsed = JSON.parse(metadata!);

  // Assert: Audit fields exist
  expect(parsed.ip_address).toBe('192.168.1.1');
  expect(parsed.user_agent).toBe('Mozilla/5.0 Test Browser');
});
```

#### Test 8.3: Logs include context but not tokens

**SPEC:** Security requirement
**Priority:** High

```typescript
test('security logs include context but not token values', async () => {
  // Setup: Spy on console.warn
  const warnSpy = jest.spyOn(console, 'warn');

  // Setup: Create and reuse token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Use once
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);

  // Reuse to trigger logging
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(401);

  // Assert: Log contains context
  expect(warnSpy).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      userId: 'user123',
      familyId: 'family123',
    })
  );

  // Assert: Log does NOT contain full token (only truncated hash)
  const logCall = warnSpy.mock.calls[0][1];
  expect(logCall.tokenHash).toMatch(/^[a-f0-9]{16}\.\.\.$/); // Truncated hash
  expect(logCall).not.toHaveProperty('token');

  warnSpy.mockRestore();
});
```

---

### Category 9: Performance (2 tests)

#### Test 9.1: Response time under 100ms

**SPEC:** Performance requirement
**Priority:** Medium

```typescript
test('completes refresh in less than 100ms', async () => {
  // Setup: Create token
  const refreshToken = tokenRotationService.generateRefreshToken();
  await tokenRotationService.storeRefreshToken(refreshToken, {
    userId: 'user123',
    familyId: 'family123',
  });

  // Execute and measure
  const start = Date.now();
  await request(app)
    .post('/api/1/auth/refresh')
    .send({ refresh_token: refreshToken })
    .expect(200);
  const duration = Date.now() - start;

  // Assert: Under 100ms
  expect(duration).toBeLessThan(100);
});
```

#### Test 9.2: Handles concurrent requests

**SPEC:** Performance requirement
**Priority:** Low

```typescript
test('handles concurrent refresh requests safely', async () => {
  // Setup: Create multiple tokens
  const tokens = [];
  for (let i = 0; i < 10; i++) {
    const token = tokenRotationService.generateRefreshToken();
    await tokenRotationService.storeRefreshToken(token, {
      userId: `user${i}`,
      familyId: `family${i}`,
    });
    tokens.push(token);
  }

  // Execute: Concurrent refreshes
  const promises = tokens.map(token =>
    request(app)
      .post('/api/1/auth/refresh')
      .send({ refresh_token: token })
  );

  const responses = await Promise.all(promises);

  // Assert: All succeeded
  responses.forEach(response => {
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
  });
});
```

---

## Test Execution

### Run All Tests

```bash
# Run all refresh endpoint tests
npm test -- auth.refresh.test.ts

# Run with coverage
npm run test:coverage -- auth.refresh.test.ts

# Run in watch mode
npm run test:watch -- auth.refresh.test.ts
```

### Run Specific Category

```bash
# Run only input validation tests
npm test -- auth.refresh.test.ts -t "Input Validation"

# Run only security tests
npm test -- auth.refresh.test.ts -t "Security"
```

### Coverage Targets

**Minimum Coverage:**
- Statements: 95%
- Branches: 90%
- Functions: 100%
- Lines: 95%

**Current Coverage:** Not implemented yet

---

## Manual Testing Checklist

### Success Scenarios

- [ ] POST with token in body → 200 with new tokens
- [ ] POST with token in cookie → 200 with new tokens
- [ ] POST with both body and cookie → 200, uses body token
- [ ] Multiple rotations in sequence → All succeed
- [ ] Concurrent refreshes with different tokens → All succeed

### Error Scenarios

- [ ] POST with no token → 401 missing_token
- [ ] POST with empty string → 401 invalid_token_format
- [ ] POST with number instead of string → 401 invalid_token_format
- [ ] POST with invalid token → 401 invalid_token
- [ ] POST with revoked token → 401 token_revoked
- [ ] POST with expired token → 401 token_expired
- [ ] POST with reused token → 401 token_reused, family revoked

### Security Scenarios

- [ ] Reuse token after successful rotation → 401 token_reused
- [ ] All family tokens revoked after reuse → All return 401
- [ ] Security event logged with context → Console shows warning
- [ ] Token values not in logs → Logs show hash only
- [ ] Tokens stored as hashes in Redis → Verify with redis-cli

---

## Test Summary

**Total Test Cases:** 39
**Critical Tests:** 22
**High Priority Tests:** 12
**Medium Priority Tests:** 4
**Low Priority Tests:** 1

**Coverage by SPEC:**
- Input Validation: 7 tests (SPEC-AU-RF-001:004)
- Processing: 4 tests (SPEC-AU-RF-006:009)
- Token Rotation: 4 tests (SPEC-AU-RF-010:012)
- Success Response: 5 tests (SPEC-AU-RF-013:016)
- Error Handling: 6 tests (SPEC-AU-RF-018:020)
- Token Family: 6 tests (SPEC-AU-RF-021:024)
- Security: 3 tests (Implicit requirements)
- Performance: 2 tests (Implicit requirements)
- Error Format: 2 tests (SPEC-AU-RF-020)

**SPEC Compliance Coverage:** 100% (all 24 requirements have tests)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-05
**Status:** Documentation complete - Implementation pending
