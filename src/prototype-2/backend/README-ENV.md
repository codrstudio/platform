# Environment Configuration Guide

## Overview

This document explains all environment variables for Platform Backend. Environment variables control infrastructure-level settings and require application restart when changed.

**Important**: This is for **Platform Settings** only. Portal/Module/Instance configurations use JQEL backend schema instead.

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in required values (marked with ⚠️)
3. Adjust optional values as needed
4. Restart application

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env  # or your preferred editor

# Start application
npm run dev
```

## Required Variables

### NODE_ENV ⚠️
- **Purpose:** Application environment mode
- **Values:** `development`, `staging`, `production`
- **Example:** `NODE_ENV=development`
- **Notes:**
  - Affects logging verbosity, rate limiting strictness, and security headers
  - Use `development` for local work
  - Use `production` for deployed environments

### PORT ⚠️
- **Purpose:** HTTP server port
- **Type:** Number (1-65535)
- **Example:** `PORT=3000`
- **Notes:**
  - Must be available (not in use by another service)
  - Common choices: 3000, 8000, 8080

### FRONTEND_URL ⚠️
- **Purpose:** Frontend application URL for CORS configuration
- **Type:** Valid URL
- **Example:** `FRONTEND_URL=http://localhost:5173`
- **Notes:**
  - Must match the URL where frontend is served
  - Used for CORS allowed origins
  - HTTP allowed in development, HTTPS required in production

### BACKEND_URL ⚠️
- **Purpose:** Backend callback URL for n8n integration
- **Type:** Valid URL
- **Example:** `BACKEND_URL=http://localhost:3000`
- **Notes:**
  - URL where n8n can call back to this backend
  - Should be accessible from n8n instance
  - May differ from localhost in containerized environments

### N8N_BASE_URL ⚠️
- **Purpose:** n8n Backbone webhook base URL
- **Type:** Valid URL
- **Example:** `N8N_BASE_URL=http://localhost:5678`
- **Notes:**
  - Backend proxies requests to n8n workflows
  - Must be accessible from backend server
  - n8n must be running and healthy

### N8N_SHARED_SECRET ⚠️
- **Purpose:** Mutual authentication secret with n8n
- **Type:** String (minimum 32 characters)
- **Example:** `N8N_SHARED_SECRET=your_shared_secret_min_32_characters_random_alphanumeric`
- **Notes:**
  - Must match n8n's configured secret
  - Use cryptographically secure random string
  - Generate with: `openssl rand -base64 32`

### PLATFORM_SHARED_SECRET ⚠️
- **Purpose:** Platform authentication secret (must match N8N_SHARED_SECRET)
- **Type:** String (minimum 32 characters)
- **Example:** `PLATFORM_SHARED_SECRET=your_shared_secret_min_32_characters_random_alphanumeric`
- **Notes:**
  - **MUST be identical to N8N_SHARED_SECRET**
  - Used for mutual authentication
  - Change both together

### JWT_SECRET ⚠️
- **Purpose:** Secret for signing JWT tokens
- **Type:** String (minimum 32 characters)
- **Example:** `JWT_SECRET=your_jwt_secret_min_32_characters_random_alphanumeric`
- **Notes:**
  - Used for access and refresh token signing
  - NEVER reuse across environments
  - Generate with: `openssl rand -base64 32`
  - Changing this invalidates all existing tokens

### JWT_ACCESS_TOKEN_EXPIRES_IN ⚠️
- **Purpose:** Access token lifetime
- **Type:** String (time duration)
- **Example:** `JWT_ACCESS_TOKEN_EXPIRES_IN=15m`
- **Notes:**
  - Format: `1m`, `5m`, `15m`, `1h`, `2h`, etc.
  - Recommended: 5-15 minutes
  - Shorter is more secure, longer is more convenient

### JWT_REFRESH_TOKEN_EXPIRES_IN ⚠️
- **Purpose:** Refresh token lifetime
- **Type:** String (time duration)
- **Example:** `JWT_REFRESH_TOKEN_EXPIRES_IN=7d`
- **Notes:**
  - Format: `1d`, `7d`, `14d`, `30d`, etc.
  - Recommended: 7-30 days
  - Users must re-login after expiration

### REDIS_HOST ⚠️
- **Purpose:** Redis server hostname
- **Type:** Hostname or IP address
- **Example:** `REDIS_HOST=localhost`
- **Notes:**
  - Redis is required for token storage, SSE pub/sub, and caching
  - Use `localhost` for local development
  - Use service name in Docker Compose (e.g., `redis`)

### REDIS_PORT ⚠️
- **Purpose:** Redis server port
- **Type:** Number (1-65535)
- **Example:** `REDIS_PORT=6379`
- **Notes:**
  - Default Redis port is 6379

### REDIS_DB ⚠️
- **Purpose:** Redis database number
- **Type:** Number (0-15)
- **Example:** `REDIS_DB=0`
- **Notes:**
  - Redis supports 16 databases (0-15)
  - Use different databases for different environments
  - Default is 0

## Optional Variables

### REDIS_PASSWORD
- **Purpose:** Redis authentication password
- **Type:** String
- **Default:** Empty (no authentication)
- **Example:** `REDIS_PASSWORD=my_redis_password`
- **Notes:**
  - Only needed if Redis has authentication enabled
  - Recommended for production environments

### LOG_LEVEL
- **Purpose:** Logging verbosity
- **Type:** String
- **Values:** `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`
- **Default:** `info`
- **Example:** `LOG_LEVEL=debug`
- **Notes:**
  - `debug` for development (verbose)
  - `info` for production (moderate)
  - `warn` or `error` for minimal logging

### LOG_FORMAT
- **Purpose:** Log output format
- **Type:** String
- **Values:** `json`, `text`
- **Default:** `json`
- **Example:** `LOG_FORMAT=text`
- **Notes:**
  - `json` for production (structured logging, log aggregation)
  - `text` for development (human-readable)

### REQUEST_TIMEOUT
- **Purpose:** Maximum HTTP request duration
- **Type:** Number (milliseconds)
- **Default:** `30000` (30 seconds)
- **Example:** `REQUEST_TIMEOUT=60000`
- **Notes:**
  - Requests exceeding this timeout will be aborted
  - Increase for slow n8n workflows

### MAX_REQUEST_SIZE
- **Purpose:** Maximum request body size
- **Type:** String (size with unit)
- **Default:** `10mb`
- **Example:** `MAX_REQUEST_SIZE=50mb`
- **Notes:**
  - Applies to JSON payloads, file uploads, etc.
  - Increase for large data imports

### SSE_HEARTBEAT_INTERVAL
- **Purpose:** Server-Sent Events heartbeat interval
- **Type:** Number (milliseconds)
- **Default:** `30000` (30 seconds)
- **Example:** `SSE_HEARTBEAT_INTERVAL=15000`
- **Notes:**
  - Keeps SSE connection alive through proxies
  - Lower values = more keepalive traffic

### RATE_LIMIT_WINDOW_MS
- **Purpose:** Rate limiting time window
- **Type:** Number (milliseconds)
- **Default:** `60000` (1 minute)
- **Example:** `RATE_LIMIT_WINDOW_MS=300000`
- **Notes:**
  - Sliding window for rate limit counter

### RATE_LIMIT_MAX_REQUESTS
- **Purpose:** Maximum requests per rate limit window
- **Type:** Number
- **Default:** `100` (development), `10` (production)
- **Example:** `RATE_LIMIT_MAX_REQUESTS=50`
- **Notes:**
  - Environment-aware default
  - Lower in production for security

### RATE_LIMIT_SKIP_SUCCESSFUL
- **Purpose:** Only count failed requests in rate limit
- **Type:** Boolean
- **Default:** `false`
- **Example:** `RATE_LIMIT_SKIP_SUCCESSFUL=true`
- **Notes:**
  - `true` = only count errors/auth failures
  - `false` = count all requests

### BRUTE_FORCE_MAX_ATTEMPTS
- **Purpose:** Failed login attempts before lockout
- **Type:** Number
- **Default:** `5`
- **Example:** `BRUTE_FORCE_MAX_ATTEMPTS=3`
- **Notes:**
  - Per username+IP combination
  - Recommended: 3-5 attempts

### BRUTE_FORCE_LOCKOUT_DURATION
- **Purpose:** Account lockout duration after max attempts
- **Type:** Number (seconds)
- **Default:** `900` (15 minutes)
- **Example:** `BRUTE_FORCE_LOCKOUT_DURATION=1800`
- **Notes:**
  - How long user is locked out after exceeding attempts

### BRUTE_FORCE_WINDOW_DURATION
- **Purpose:** Time window for counting login attempts
- **Type:** Number (seconds)
- **Default:** `600` (10 minutes)
- **Example:** `BRUTE_FORCE_WINDOW_DURATION=300`
- **Notes:**
  - Failed attempts older than this are not counted

### SYSTEM_SCHEMA_TARGET
- **Purpose:** Routing for JQEL "system" schema queries
- **Type:** String
- **Values:** `backend`, `n8n`
- **Default:** `n8n`
- **Example:** `SYSTEM_SCHEMA_TARGET=backend`
- **Notes:**
  - `backend` = process locally (like backend schema)
  - `n8n` = proxy to Backbone (default)

### CACHE_TTL_AUTH
- **Purpose:** Authorization cache time-to-live
- **Type:** Number (seconds)
- **Default:** `300` (5 minutes)
- **Example:** `CACHE_TTL_AUTH=600`
- **Notes:**
  - How long to cache authorization responses
  - Reduces load on n8n authorize workflow

### CACHE_TTL_JQEL
- **Purpose:** JQEL query cache time-to-live
- **Type:** Number (seconds)
- **Default:** `60` (1 minute)
- **Example:** `CACHE_TTL_JQEL=120`
- **Notes:**
  - How long to cache JQEL query results
  - Reduces database load

## Environment-Specific Recommendations

### Development

```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
N8N_BASE_URL=http://localhost:5678

# Simple secrets acceptable in dev
JWT_SECRET=dev_jwt_secret_min_32_characters_random
N8N_SHARED_SECRET=dev_shared_secret_min_32_characters
PLATFORM_SHARED_SECRET=dev_shared_secret_min_32_characters

# Redis defaults
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Lenient security for testing
RATE_LIMIT_MAX_REQUESTS=100
BRUTE_FORCE_MAX_ATTEMPTS=10

# Verbose logging
LOG_LEVEL=debug
LOG_FORMAT=text
```

### Staging

```bash
NODE_ENV=staging
PORT=3000
FRONTEND_URL=https://staging.example.com
BACKEND_URL=https://api-staging.example.com
N8N_BASE_URL=https://n8n-staging.example.com

# Strong, unique secrets (different from production!)
JWT_SECRET=<generate-strong-secret>
N8N_SHARED_SECRET=<generate-strong-secret>
PLATFORM_SHARED_SECRET=<same-as-n8n-secret>

# Production-like Redis
REDIS_HOST=redis-staging
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
REDIS_DB=0

# Production-like security
RATE_LIMIT_MAX_REQUESTS=20
BRUTE_FORCE_MAX_ATTEMPTS=5

# Moderate logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Production

```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://app.example.com
BACKEND_URL=https://api.example.com
N8N_BASE_URL=https://n8n.example.com

# Strong, unique secrets (NEVER reuse from staging!)
JWT_SECRET=<generate-strong-secret>
N8N_SHARED_SECRET=<generate-strong-secret>
PLATFORM_SHARED_SECRET=<same-as-n8n-secret>

# Production Redis with authentication
REDIS_HOST=redis-prod
REDIS_PORT=6379
REDIS_PASSWORD=<strong-redis-password>
REDIS_DB=0

# Strict security
RATE_LIMIT_MAX_REQUESTS=10
BRUTE_FORCE_MAX_ATTEMPTS=3

# Minimal logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## Security Checklist

Before deploying to any environment, verify:

- [ ] All secrets are minimum 32 characters
- [ ] No secrets committed to version control
- [ ] `.env` file permissions restricted (600 or 400)
- [ ] Secrets are different per environment (dev/staging/prod)
- [ ] HTTPS enabled in staging and production
- [ ] `N8N_SHARED_SECRET` matches `PLATFORM_SHARED_SECRET`
- [ ] Redis password set in production
- [ ] Rate limiting configured appropriately
- [ ] Brute force protection enabled
- [ ] Log level appropriate for environment

## Generating Secure Secrets

### Using OpenSSL (Recommended)

```bash
# Generate 32-character base64 secret
openssl rand -base64 32

# Generate 64-character hex secret
openssl rand -hex 32
```

### Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Using Python

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Troubleshooting

### Backend won't start

**Error: Missing required environment variable**
- Solution: Copy `.env.example` to `.env` and fill in all required values
- Check that `.env` file exists in backend directory

**Error: JWT_SECRET must be at least 32 characters**
- Solution: Generate stronger secret with `openssl rand -base64 32`
- Update both `JWT_SECRET` in `.env`

**Error: Cannot connect to Redis**
- Solution: Ensure Redis is running (`redis-cli ping` should return "PONG")
- Verify `REDIS_HOST` and `REDIS_PORT` are correct
- Check `REDIS_PASSWORD` if Redis has authentication

### SSE not working

**Error: SSE connection failed**
- Solution: Verify `SSE_HEARTBEAT_INTERVAL` is set
- Check backend logs for SSE-related errors
- Ensure Redis Pub/Sub is working

### Rate limiting too strict

**Error: Too many requests**
- Solution: Increase `RATE_LIMIT_MAX_REQUESTS` in development
- Adjust `RATE_LIMIT_WINDOW_MS` for longer windows
- Set `RATE_LIMIT_SKIP_SUCCESSFUL=true` to only count failures

### n8n communication failed

**Error: Cannot reach n8n**
- Solution: Verify `N8N_BASE_URL` is accessible from backend
- Check n8n is running and healthy
- Verify `N8N_SHARED_SECRET` matches n8n configuration

**Error: Authentication failed with n8n**
- Solution: Ensure `N8N_SHARED_SECRET` and `PLATFORM_SHARED_SECRET` are identical
- Check n8n logs for authentication errors

## Additional Resources

- **SPEC-configuration.md**: Full platform configuration specification
- **env.ts**: Environment variable loading and validation code
- **envValidation.ts**: Validation helper utilities
- **.env.example**: Template with all variables and defaults
