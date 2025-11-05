# Service Worker Cache Strategy

**Date**: 2025-11-05
**Status**: ✅ APPROVED
**Approved on**: 2025-11-05
**Related SPEC**: SPEC-architecture.md (PWA section)

> **DECISÃO APROVADA**: Esta proposta foi aprovada e as especificações foram atualizadas conforme descrito abaixo.

---

## Context

The current Service Worker implementation uses **cache-first** strategy for all requests, including HTML navigation requests. This causes problems when portal/module configuration changes:

1. User activates a new module (e.g., "auth") via Setup
2. Configuration is updated in backend (`portals.json`)
3. User navigates to a route from the new module (e.g., `/login`)
4. Service Worker serves **cached HTML** from before the module was activated
5. Stale HTML/JavaScript doesn't know about the new routes
6. User sees "Portal Not Found" error

**Current behavior**:
- Hard refresh (Ctrl+Shift+R) works ✅ (bypasses cache completely)
- Normal refresh (F5) fails ❌ (serves cached HTML)
- Navigation via links fails ❌ (serves cached HTML)

---

## Problem Analysis

**Root Cause**: HTML is precached and served cache-first

**File**: `src/prototype-1/frontend/public/sw.js`

```javascript
// Line 12-19: HTML is precached
const PRECACHE_ASSETS = [
  '/',              // ❌ Cached
  '/index.html',    // ❌ Cached
  '/manifest.json',
  // ...
];

// Line 115: Everything uses cache-first
event.respondWith(cacheFirst(request));
```

---

## Proposed Solution

Implement **industry-standard caching pattern** recommended by Google Workbox, Create React App, Vite PWA, and Next.js PWA:

### **Network-First for HTML + Cache-First for Assets**

This pattern:
- Ensures HTML is always fresh (reflects current configuration)
- Maintains fast asset loading (JS/CSS from cache)
- Provides offline fallback (cache if network fails)
- Requires minimal code changes (~17 lines total)

---

## Implementation Details

### 1. Service Worker Changes

**File**: `src/prototype-1/frontend/public/sw.js`

**Change A**: Remove HTML from precache
```javascript
// BEFORE:
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // ...
];

// AFTER:
const PRECACHE_ASSETS = [
  '/manifest.json',  // Only static assets
  '/icons/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];
```

**Change B**: Use network-first for navigation
```javascript
// BEFORE (line 115):
event.respondWith(cacheFirst(request));

// AFTER:
if (request.mode === 'navigate') {
  event.respondWith(networkFirst(request));  // HTML always fresh
} else {
  event.respondWith(cacheFirst(request));    // Assets from cache
}
```

**Change C**: Bump cache version
```javascript
const CACHE_VERSION = 'v6';  // Force cache invalidation
```

### 2. Backend Cache Headers

**File**: `src/prototype-1/backend/src/index.ts`

**Change**: Add no-cache header for HTML
```typescript
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html' || req.accepts('html')) {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});
```

---

## Expected Behavior After Fix

### Navigation Flow (any method: F5, link, direct URL)

```
1. Browser requests /login
2. Service Worker intercepts
3. Detects: navigation request
4. Uses network-first strategy:
   → Tries network first
   → Gets fresh HTML from server
   → HTML contains updated React code
   → Falls back to cache only if offline
5. React Router processes route
6. PortalLoader detects correct portal
7. Fetches configuration via JQEL (not cached)
8. Configuration returns updated modules
9. Loads module and renders route ✅
```

### Asset Loading (JS/CSS/Images)

```
1. Browser requests /assets/index-abc123.js
2. Service Worker intercepts
3. Detects: NOT a navigation request
4. Uses cache-first strategy:
   → Checks cache first
   → Serves from cache if available (fast!)
   → Fetches from network if cache miss
5. Asset loaded ⚡
```

---

## Benefits

✅ **Fixes the bug**: HTML always reflects current configuration
✅ **Industry standard**: Used by Google, React, Next.js, Vite
✅ **Minimal changes**: ~17 lines of code
✅ **No breaking changes**: Existing functionality preserved
✅ **Performance maintained**: Assets still served from cache
✅ **Offline support**: Network-first has cache fallback
✅ **No manual invalidation**: Browser handles it automatically

---

## Risks

**Low Risk**:
- This is the recommended pattern from Google's Workbox team
- Already used by major frameworks (CRA, Next.js, Vite)
- Does not break existing functionality
- Only changes caching strategy

**Potential Issues**:
- Users on slow networks may notice slightly longer initial load (but this is expected behavior - they get fresh content)
- Offline users will still get cached HTML (this is desired fallback behavior)

---

## Spec Changes Required

This decision requires updates to **SPEC-architecture.md**, PWA section:

### Proposed Additions

**SPEC-A-PWA-023**: HTML MUST use network-first caching strategy
**SPEC-A-PWA-024**: HTML MUST NOT be included in Service Worker precache
**SPEC-A-PWA-025**: Navigation requests MUST fetch from network before falling back to cache
**SPEC-A-PWA-026**: Backend MUST set `Cache-Control: no-cache` header for HTML responses
**SPEC-A-PWA-027**: Static assets (JS/CSS/images) SHOULD use cache-first strategy
**SPEC-A-PWA-028**: Assets with content hash in filename MAY use `Cache-Control: immutable`

### Rationale

This aligns with industry best practices and ensures that:
1. Configuration changes are immediately reflected for users
2. Performance is maintained through asset caching
3. Offline functionality is preserved
4. The platform follows standard PWA patterns

---

## Alternative Considered (Rejected)

**Alternative**: Configuration hash tracking with manual cache invalidation

**Why rejected**:
- Requires ~150 lines of custom code vs ~17 lines for standard pattern
- Adds complexity: hash calculation, version tracking, localStorage management
- Needs backend changes to store/calculate config hashes
- Requires polling or SSE integration for real-time detection
- Custom solution vs industry-standard pattern
- More maintenance burden and potential for bugs

**Conclusion**: Network-first pattern is simpler, standard, and solves the problem with minimal code.

---

## Recommendation

**APPROVE** this caching strategy change and update SPEC-architecture.md accordingly.

**Reasoning**:
- Industry-standard solution
- Minimal code changes
- Low risk
- Solves the reported bug
- Aligns with PWA best practices

---

## Next Steps (if approved)

1. Update `SPEC-architecture.md` with new PWA requirements (SPEC-A-PWA-023 to SPEC-A-PWA-028)
2. Implement Service Worker changes (~10 lines)
3. Add backend cache header middleware (~7 lines)
4. Test navigation scenarios (F5, links, direct URL)
5. Verify offline fallback still works
6. Update documentation if needed
