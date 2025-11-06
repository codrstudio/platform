# Environment Configuration Guide

## Overview

This project supports three environments:
- **Development:** Local development with lenient settings
- **Staging:** Pre-production testing environment
- **Production:** Live production environment

## Quick Start

### Development

```bash
# Backend
cd backend
cp .env.development .env  # Or let auto-loading handle it
npm run dev

# Frontend
cd frontend
npm run dev               # Automatically uses .env.development
```

### Staging

```bash
# Backend
cd backend
cp .env.staging .env
# Edit .env with staging credentials
npm run dev:staging

# Frontend
cd frontend
npm run build:staging     # Creates staging build
```

### Production

```bash
# Backend
cd backend
cp .env.production .env
# IMPORTANT: Replace all CHANGE_ME values with real secrets
npm run build
npm start

# Frontend
cd frontend
npm run build:production  # Creates production build
```

## Environment Files

### Backend Files

- `.env` - Active configuration (git-ignored)
- `.env.example` - Template with all variables documented
- `.env.development` - Development defaults
- `.env.staging` - Staging template
- `.env.production` - Production template
- `.env.local` - Local overrides (git-ignored, optional)
- `.env.{NODE_ENV}.local` - Environment-specific local overrides (git-ignored, optional)

### Frontend Files

- `.env` - Active configuration (git-ignored)
- `.env.example` - Template with all variables documented
- `.env.development` - Development defaults
- `.env.staging` - Staging configuration
- `.env.production` - Production configuration
- `.env.local` - Local overrides (git-ignored, optional)

### Loading Priority

Backend (highest to lowest):
1. `.env.{NODE_ENV}.local` (local environment overrides)
2. `.env.{NODE_ENV}` (environment-specific)
3. `.env.local` (local overrides)
4. `.env` (base configuration)

Frontend:
Vite automatically loads `.env.{mode}` based on `--mode` flag.

## Environment-Specific Behavior

### Development

**Purpose:** Local development and testing

**Characteristics:**
- HTTP allowed (localhost)
- Verbose logging (LOG_LEVEL=debug)
- Lenient rate limiting (100 requests/min)
- Simple secrets acceptable
- Debug tools enabled (frontend)
- Detailed error messages

**Usage:**
```bash
npm run dev
```

### Staging

**Purpose:** Pre-production testing with production-like settings

**Characteristics:**
- HTTPS required
- Moderate logging (LOG_LEVEL=info)
- Production-like rate limiting (10 requests/min)
- Strong secrets required
- Debug tools disabled
- Production-like error handling
- Test data (not live)

**Usage:**
```bash
# Backend
NODE_ENV=staging npm run dev

# Frontend
npm run build:staging
```

### Production

**Purpose:** Live production environment

**Characteristics:**
- HTTPS mandatory
- Minimal logging (LOG_LEVEL=warn)
- Strict rate limiting (10 requests/min)
- Strong, unique secrets required
- All debug features disabled
- Minimal error details (security)
- Live data

**Usage:**
```bash
# Backend
npm run build
npm start

# Frontend
npm run build:production
```

## Environment Variables

### Required in All Environments

See `.env.example` for complete list. Key variables:

- `NODE_ENV` - Environment name (development|staging|production)
- `PORT` - Server port
- `FRONTEND_URL` - Frontend application URL
- `BACKEND_URL` - Backend API URL
- `N8N_BASE_URL` - n8n Backbone URL
- `N8N_SHARED_SECRET` - Shared secret for n8n authentication
- `REDIS_HOST` - Redis server host
- `JWT_SECRET` - JWT signing secret
- `PLATFORM_SHARED_SECRET` - Platform authentication secret

### Environment-Specific Differences

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| HTTPS | Optional | Required | Required |
| LOG_LEVEL | debug | info | warn |
| RATE_LIMIT_MAX_REQUESTS | 100 | 10 | 10 |
| Secret Strength | Simple OK | Strong | Strong + Validation |
| BRUTE_FORCE_MAX_ATTEMPTS | 10 | 5 | 3 |

## Deployment

### CI/CD Integration

In CI/CD pipelines, set environment variables directly instead of using .env files:

```yaml
# GitHub Actions example
env:
  NODE_ENV: production
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  N8N_SHARED_SECRET: ${{ secrets.N8N_SHARED_SECRET }}
```

### Docker Deployment

```dockerfile
# Use build args for environment
ARG NODE_ENV=production

# Pass environment variables at runtime
ENV NODE_ENV=${NODE_ENV}
```

```bash
# Run with environment variables
docker run -e NODE_ENV=production -e JWT_SECRET=xxx app
```

### Secrets Management

**Development:**
- Secrets in `.env.development` are acceptable (local only)
- Use simple, non-production secrets

**Staging/Production:**
- NEVER commit secrets to version control
- Use environment variables in deployment
- Or use secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly

## Troubleshooting

### Environment not loading

**Problem:** Application doesn't use environment-specific settings

**Solution:**
1. Verify NODE_ENV is set: `echo $NODE_ENV`
2. Check file exists: `ls -la .env.*`
3. Check console logs during startup for loaded files
4. Ensure environment file has correct name

### Secrets validation fails in production

**Problem:** `JWT_SECRET must contain both letters and numbers`

**Solution:**
- Production requires strong secrets (alphanumeric mix)
- Generate secure random secret: `openssl rand -base64 32`
- Update .env file with generated secret

### Frontend not using correct environment

**Problem:** Frontend uses wrong API URL

**Solution:**
1. Frontend builds are environment-specific
2. Rebuild with correct mode: `npm run build:staging`
3. Verify `.env.{mode}` file exists
4. Check build output shows correct VITE_API_URL

### HTTPS required errors in staging/production

**Problem:** `N8N_BASE_URL must use HTTPS in production`

**Solution:**
- Staging and production REQUIRE HTTPS
- Update URLs to use https:// protocol
- Use HTTP only in development

## Security Checklist

Before deploying to staging/production:

- [ ] All secrets are strong (32+ characters, alphanumeric)
- [ ] Secrets are different between environments
- [ ] No secrets committed to version control
- [ ] HTTPS enabled for all URLs
- [ ] LOG_LEVEL set appropriately (not debug)
- [ ] Rate limiting configured
- [ ] Redis password set (production)
- [ ] Environment variables validated at startup

## References

- [.env.example](./backend/.env.example) - Complete variable documentation
- [README-ENV.md](./backend/README-ENV.md) - Detailed environment variable guide
- [SPEC-configuration.md](../../spec/SPEC-configuration.md) - Configuration specification
