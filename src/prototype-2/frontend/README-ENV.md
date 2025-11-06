# Frontend Environment Configuration Guide

## Overview

This document explains environment variables for Platform Frontend. These variables configure infrastructure-level settings and require rebuild/restart to apply.

**Important**: All frontend environment variables **MUST** have the `VITE_` prefix to be exposed to the client code. This is a Vite requirement for security.

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in actual values
3. Rebuild application

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env  # or your preferred editor

# Rebuild
npm run build
```

## Required Variables

### VITE_API_URL ⚠️
- **Purpose:** Backend API base URL
- **Type:** Valid URL
- **Example:** `VITE_API_URL=http://localhost:3000`
- **Notes:**
  - Must match where backend is running
  - HTTP allowed in development, HTTPS required in production
  - No trailing slash

## Application Identity Variables

### VITE_APP_NAME
- **Purpose:** Full application name for PWA manifest and page titles
- **Type:** String
- **Default:** `Platform Application`
- **Example:** `VITE_APP_NAME=My Company Platform`
- **Notes:**
  - Shown in browser tabs and PWA install prompt
  - Used in manifest.json

### VITE_APP_SHORT_NAME
- **Purpose:** Short application name for PWA homescreen
- **Type:** String
- **Default:** `Platform`
- **Example:** `VITE_APP_SHORT_NAME=MyApp`
- **Notes:**
  - Maximum 12 characters recommended
  - Displayed under PWA icon on mobile

### VITE_APP_DESCRIPTION
- **Purpose:** Application description for PWA manifest
- **Type:** String
- **Default:** `Modular application platform for building scalable web applications`
- **Example:** `VITE_APP_DESCRIPTION=Enterprise task management platform`
- **Notes:**
  - Shown in PWA install dialogs
  - Used for SEO meta tags

## PWA Theme Variables

### VITE_THEME_COLOR
- **Purpose:** Default theme color for PWA
- **Type:** Hex color code
- **Default:** `#000000`
- **Example:** `VITE_THEME_COLOR=#1976d2`
- **Notes:**
  - Used for browser chrome/status bar on mobile
  - Can be overridden by portal settings

### VITE_BACKGROUND_COLOR
- **Purpose:** Default background color for PWA splash screen
- **Type:** Hex color code
- **Default:** `#ffffff`
- **Example:** `VITE_BACKGROUND_COLOR=#f5f5f5`
- **Notes:**
  - Shown during PWA launch
  - Should contrast with VITE_THEME_COLOR

## Optional Variables

### VITE_PORT
- **Purpose:** Development server port
- **Type:** Number (1-65535)
- **Default:** `5173`
- **Example:** `VITE_PORT=3001`
- **Notes:**
  - Only used during `npm run dev`
  - Not needed in production build

### VITE_DEV_MODE
- **Purpose:** Enable development mode features
- **Type:** Boolean
- **Default:** `false`
- **Example:** `VITE_DEV_MODE=true`
- **Notes:**
  - Enables additional debugging tools
  - Should be `false` in production

### VITE_ENABLE_DEBUG_TOOLS
- **Purpose:** Enable debug UI components
- **Type:** Boolean
- **Default:** `false`
- **Example:** `VITE_ENABLE_DEBUG_TOOLS=true`
- **Notes:**
  - Shows debug panels, state inspectors, etc.
  - Should be `false` in production

### VITE_API_TIMEOUT
- **Purpose:** API request timeout in milliseconds
- **Type:** Number
- **Default:** `30000` (30 seconds)
- **Example:** `VITE_API_TIMEOUT=60000`
- **Notes:**
  - How long to wait for API responses
  - Increase for slow connections or large data transfers

### VITE_SSE_RECONNECT_INTERVAL
- **Purpose:** SSE reconnection interval in milliseconds
- **Type:** Number
- **Default:** `3000` (3 seconds)
- **Example:** `VITE_SSE_RECONNECT_INTERVAL=5000`
- **Notes:**
  - Initial delay before reconnecting SSE after disconnect
  - Uses exponential backoff

### VITE_SSE_MAX_RECONNECT_ATTEMPTS
- **Purpose:** Maximum SSE reconnection attempts
- **Type:** Number
- **Default:** `10`
- **Example:** `VITE_SSE_MAX_RECONNECT_ATTEMPTS=20`
- **Notes:**
  - After this many failed attempts, stops trying
  - User must manually reload

## Environment-Specific Examples

### Development

```bash
# Backend connection
VITE_API_URL=http://localhost:3000

# PWA settings
VITE_APP_NAME=Platform Application [DEV]
VITE_APP_SHORT_NAME=Platform
VITE_APP_DESCRIPTION=Development environment

# Debug features enabled
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG_TOOLS=true

# Generous timeouts
VITE_API_TIMEOUT=60000
VITE_SSE_RECONNECT_INTERVAL=1000
VITE_SSE_MAX_RECONNECT_ATTEMPTS=50
```

### Staging

```bash
# Backend connection
VITE_API_URL=https://api-staging.example.com

# PWA settings
VITE_APP_NAME=Platform Application [STAGING]
VITE_APP_SHORT_NAME=Platform
VITE_APP_DESCRIPTION=Staging environment

# Debug features disabled
VITE_DEV_MODE=false
VITE_ENABLE_DEBUG_TOOLS=false

# Production-like settings
VITE_API_TIMEOUT=30000
VITE_SSE_RECONNECT_INTERVAL=3000
VITE_SSE_MAX_RECONNECT_ATTEMPTS=10
```

### Production

```bash
# Backend connection
VITE_API_URL=https://api.example.com

# PWA settings
VITE_APP_NAME=Enterprise Platform
VITE_APP_SHORT_NAME=Platform
VITE_APP_DESCRIPTION=Enterprise task management and workflow automation

# Theme
VITE_THEME_COLOR=#1976d2
VITE_BACKGROUND_COLOR=#ffffff

# Debug features disabled
VITE_DEV_MODE=false
VITE_ENABLE_DEBUG_TOOLS=false

# Standard settings
VITE_API_TIMEOUT=30000
VITE_SSE_RECONNECT_INTERVAL=3000
VITE_SSE_MAX_RECONNECT_ATTEMPTS=10
```

## Important: Vite Environment Variable Rules

### MUST use VITE_ prefix

Only environment variables prefixed with `VITE_` are exposed to client code:

```typescript
// ✅ Correct - will work
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ Wrong - will be undefined
const apiUrl = import.meta.env.API_URL;
```

### Cannot use process.env

Frontend code runs in browser, not Node.js:

```typescript
// ❌ Wrong - process.env doesn't exist in browser
const apiUrl = process.env.VITE_API_URL;

// ✅ Correct - use import.meta.env
const apiUrl = import.meta.env.VITE_API_URL;
```

### Build-time only

Environment variables are injected at **build time**, not runtime:

```typescript
// Variables are replaced with values during build
// This means you MUST rebuild after changing .env
```

### Never commit secrets

Even though variables must be prefixed with `VITE_`, they should never contain secrets:

- ❌ API keys, passwords, tokens
- ❌ Private configuration
- ✅ Public URLs, feature flags, UI settings

**Why?** All `VITE_` variables are embedded in the built JavaScript bundle and visible to anyone who views the source.

## Accessing Environment Variables

### In TypeScript/JavaScript

```typescript
// Get variable with fallback
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Type-safe access (add to vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  // ... other variables
}
```

### In Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  // Environment variables available here
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Use in config
    server: {
      port: Number(env.VITE_PORT) || 5173,
    },
  };
});
```

## Troubleshooting

### Variable is undefined

**Symptom:** `import.meta.env.VITE_MY_VAR` is undefined

**Solutions:**
1. Check variable has `VITE_` prefix
2. Rebuild application (`npm run build` or restart `npm run dev`)
3. Verify variable exists in `.env` file
4. Check for typos in variable name

### Changes not taking effect

**Symptom:** Updated `.env` but nothing changed

**Solutions:**
1. Rebuild application - changes require rebuild
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear browser cache
4. Verify `.env` file is in frontend directory (not backend)

### Port already in use

**Symptom:** `Error: Port 5173 is already in use`

**Solutions:**
1. Change `VITE_PORT` to different port
2. Kill process using port: `lsof -ti:5173 | xargs kill` (Mac/Linux)
3. Kill process using port: `netstat -ano | findstr :5173` then `taskkill /PID <pid> /F` (Windows)

### Can't connect to backend

**Symptom:** API requests fail, CORS errors

**Solutions:**
1. Verify `VITE_API_URL` matches backend URL
2. Ensure backend is running
3. Check backend CORS configuration allows frontend origin
4. Verify no typos in URL (no trailing slash)

## Additional Resources

- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **SPEC-configuration.md**: Full configuration specification
- **.env.example**: Template with all variables
- **vite.config.ts**: Vite configuration file
