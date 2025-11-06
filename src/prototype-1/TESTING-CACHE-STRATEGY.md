# Testing Guide: Cache Strategy Implementation

**Date**: 2025-11-06
**Prototype**: prototype-1
**Purpose**: Verify Cache Strategy implementation and SPEC compliance

---

## Quick Start

### Prerequisites
- Node.js installed
- Redis installed and running
- npm dependencies installed in both frontend and backend

### Start Services

```bash
# Terminal 1 - Start Redis
redis-server

# Terminal 2 - Start Backend
cd src/prototype-1/backend
npm run dev

# Terminal 3 - Start Frontend
cd src/prototype-1/frontend
npm run dev
```

**Access**: http://localhost:3200

---

## Test 1: Service Worker Registration

**Objective**: Verify service worker registers successfully

**Steps**:
1. Open http://localhost:3200 in Chrome/Edge
2. Open DevTools (F12)
3. Check Console tab

**Expected Results**:
- ✅ Console shows: `✅ [PWA] Service Worker registered: http://localhost:3200/`
- ✅ Console shows: `[SW] Service worker script loaded (v1)`

**Verify in DevTools**:
1. Go to **Application** → **Service Workers**
2. Should show service worker as "activated and running"
3. Status: ● green circle

**Screenshot Location**: Console and Application tabs

---

## Test 2: Network-First for HTML (SPEC-R-LD-018)

**Objective**: Verify HTML uses network-first strategy

**Steps**:
1. Open DevTools → **Network** tab
2. Clear network log
3. Refresh page (F5)
4. Find request for `/` (Type: document)

**Expected Results**:
- ✅ Request goes to network first
- ✅ Size shows actual bytes (not "Service Worker")
- ✅ Status: 200
- ✅ Type: document

**Verify Cache Headers** (in Network tab):
- Click on `/` request
- Go to **Headers** tab
- Response Headers should show: `Cache-Control: no-cache`

---

## Test 3: Cache-First for Assets (SPEC-A-PWA-028)

**Objective**: Verify static assets use cache-first strategy

**Steps**:
1. DevTools → **Network** tab still open
2. Refresh page again (2nd time)
3. Look at JS/CSS asset requests

**Expected Results**:
- ✅ JS/CSS files show "Service Worker" as Size
- ✅ Load time is very fast (<10ms)
- ✅ Served from cache immediately

**Verify**:
- First load: Assets fetched from network
- Second load: Assets served from Service Worker cache

---

## Test 4: Module Activation Without Hard Refresh (SPEC-LOAD-D-018)

**Objective**: Verify module activation works with normal navigation

**This is the PRIMARY test for the cache strategy update!**

### Setup
1. Ensure you have a test module that can be activated/deactivated
2. Module should have a route you can navigate to

### Test Steps

#### Scenario A: Activate Module
1. Go to Setup portal (if available)
2. Activate a module (e.g., "auth", "dashboard", etc.)
3. Save configuration
4. Navigate to module's route:
   - Option 1: Click a link
   - Option 2: Press F5 to refresh
   - Option 3: Enter URL directly in address bar

**Expected Results**:
- ✅ Module route WORKS immediately
- ✅ NO "Module not found" error
- ✅ NO "Portal not found" error
- ✅ NO hard refresh needed (Ctrl+Shift+R)

**Before Cache Strategy** (OLD behavior):
- ❌ Would show error
- ❌ Required hard refresh (Ctrl+Shift+R)

**After Cache Strategy** (NEW behavior):
- ✅ Works with normal navigation

#### Scenario B: Deactivate Module
1. Go to Setup portal
2. Deactivate a module
3. Save configuration
4. Try to navigate to module's route (F5)

**Expected Results**:
- ✅ Module route no longer works
- ✅ Shows appropriate error (404 or "Module disabled")
- ✅ Works immediately without hard refresh

---

## Test 5: Offline Fallback (SPEC-R-LD-019)

**Objective**: Verify cached HTML used only when offline

**Steps**:
1. Navigate to main page with DevTools open
2. Go to **Application** → **Service Workers**
3. Check the **Offline** checkbox
4. Refresh page (F5)

**Expected Results**:
- ✅ Page still loads (from cache)
- ✅ Shows cached version of HTML
- ✅ Console shows: "📡 [PWA] You are offline"

**Test Offline Fallback Page**:
1. While still offline, navigate to a NEW route never visited
2. Should see beautiful offline fallback page:
   - Gradient purple background
   - "Você está offline" message
   - "Tentar Novamente" button
   - Status indicator

**Return Online**:
1. Uncheck **Offline** checkbox
2. Page should auto-reload (within 1 second)
3. Fresh content loaded from network

---

## Test 6: Configuration Changes Reflected (SPEC-CF-AS-015)

**Objective**: Verify configuration mutations trigger fresh HTML fetch

**Steps**:
1. Make a configuration change (e.g., change portal theme, activate module)
2. Save the change (JQEL mutation executed)
3. Navigate anywhere (F5, link, or direct URL)

**Expected Results**:
- ✅ Service Worker fetches FRESH HTML from network
- ✅ Configuration change is visible immediately
- ✅ NO hard refresh needed
- ✅ NO cache clearing needed

**Verify in Network Tab**:
- After configuration change, next navigation should show:
- `/` request goes to network (not served from SW cache)
- Status: 200
- Fresh HTML contains updated configuration

---

## Test 7: PWA Installation

**Objective**: Verify app is installable as PWA

### Desktop (Chrome/Edge)
1. Look for install icon in address bar (⊕)
2. Click to install
3. App opens in standalone window

**Expected Results**:
- ✅ Install prompt appears
- ✅ App installs successfully
- ✅ Standalone window opens
- ✅ No browser chrome visible

### Mobile (Android Chrome)
1. Visit site on mobile device
2. Tap menu (⋮) → "Add to Home Screen"
3. Icon appears on home screen
4. Tap icon to open

**Expected Results**:
- ✅ Add to home screen option available
- ✅ Icon added to home screen
- ✅ Opens in standalone mode
- ✅ Full screen experience

---

## Test 8: Manifest Validation

**Objective**: Verify Web App Manifest is correct

**Steps**:
1. DevTools → **Application** tab
2. Select **Manifest** in left sidebar

**Expected Results**:
- ✅ Name: "Platform - Modular Web Application"
- ✅ Short name: "Platform"
- ✅ Start URL: "/"
- ✅ Display: "standalone"
- ✅ Theme color: "#000000"
- ✅ Background color: "#ffffff"
- ✅ Icons: 3 icons listed
  - 192x192 PNG
  - 512x512 PNG
  - SVG (any size)
- ✅ Shortcuts: 1 shortcut to "/setup"

**Check for Errors**:
- No manifest errors shown
- All icons load (may be placeholders)

---

## Test 9: Cache Headers Validation

**Objective**: Verify backend sends correct Cache-Control headers

### Test HTML Response
```bash
curl -I http://localhost:3223/
# Or if backend serves frontend in production:
curl -I http://localhost:3223/index.html
```

**Expected Headers**:
```
Cache-Control: no-cache
```

### Test Hashed Asset Response
```bash
# Use actual hash from your build
curl -I http://localhost:3223/assets/index-abc123.js
```

**Expected Headers**:
```
Cache-Control: public, max-age=31536000, immutable
```

### Test API Response
```bash
curl -I http://localhost:3223/api/jqel
```

**Expected Headers**:
```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
```

---

## Test 10: Performance Validation

**Objective**: Verify performance targets met

### Lighthouse Audit
1. DevTools → **Lighthouse** tab
2. Select categories:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Accessibility
3. Device: Mobile
4. Click "Analyze page load"

**Expected Scores**:
- PWA: ~100% (or close)
- Performance: >90%
- Accessibility: >90%

**PWA Checks Should Pass**:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Sets theme color
- ✅ Content sized correctly for viewport
- ✅ Has maskable icon

### Bundle Size Check
```bash
cd src/prototype-1/frontend/dist
du -sh *
```

**Expected Sizes**:
- Total: ~220 KB
- index.html: <2 KB
- manifest.json: <2 KB
- sw.js: ~12 KB
- assets/: ~206 KB

**Within Targets**: ✅ <210 KB gzipped

---

## Test 11: Service Worker Update Flow

**Objective**: Verify service worker updates correctly

**Steps**:
1. Make a small change to `public/sw.js`:
   ```javascript
   const CACHE_VERSION = 'v2';  // Changed from v1
   ```
2. Save file
3. Wait a few seconds
4. Check console

**Expected Results**:
- ✅ Console shows: `🔄 [PWA] New version available! Refresh to update.`
- ✅ Confirmation dialog appears
- ✅ Click OK to reload
- ✅ Page reloads with new service worker
- ✅ Console shows: `♻️ [PWA] Service Worker updated, reloading page...`

**Manual Update**:
If automatic doesn't work:
1. DevTools → Application → Service Workers
2. Click "Update" button
3. New service worker should install
4. Click "skipWaiting" to activate

---

## Regression Tests

### Verify Existing Features Still Work

**Test Suite**:
1. ✅ Authentication (login/logout)
2. ✅ JQEL queries work
3. ✅ SSE real-time events work
4. ✅ Module loading works
5. ✅ Portal routing works
6. ✅ TanStack Query caching works
7. ✅ Error boundaries work
8. ✅ Theme switching works

**Critical**: NO existing functionality should be broken!

---

## Common Issues & Solutions

### Issue: Service Worker Not Registering
**Symptoms**: No console message about SW registration

**Solutions**:
1. Ensure using localhost or HTTPS
2. Clear browser cache (Ctrl+Shift+Delete)
3. Unregister old SW (Application → Service Workers → Unregister)
4. Hard reload (Ctrl+Shift+R)

### Issue: Module Activation Still Requires Hard Refresh
**Symptoms**: Normal F5 doesn't work, need Ctrl+Shift+R

**Debug**:
1. Check Network tab - is HTML fetched from network?
2. Check Service Worker cache - is HTML in precache?
3. Verify Cache-Control header on HTML response
4. Check sw.js - is network-first strategy applied?

**Expected Behavior**: F5 should work!

### Issue: Offline Mode Not Working
**Symptoms**: Blank page when offline

**Solutions**:
1. Go online, visit site, wait for caching
2. Check Application → Cache Storage → static-v1
3. Verify assets are cached
4. Try offline again

### Issue: PWA Not Installable
**Symptoms**: No install icon in address bar

**Check**:
1. Manifest is valid (Application → Manifest)
2. Service worker is active
3. Site is served over HTTPS or localhost
4. No manifest errors in console

---

## Test Report Template

Use this template to document test results:

```markdown
# Cache Strategy Test Report

**Date**: [DATE]
**Tester**: [NAME]
**Prototype**: prototype-1
**Browser**: [Chrome/Edge/Firefox] [VERSION]

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Service Worker Registration | ✅/❌ | |
| 2. Network-First for HTML | ✅/❌ | |
| 3. Cache-First for Assets | ✅/❌ | |
| 4. Module Activation | ✅/❌ | |
| 5. Offline Fallback | ✅/❌ | |
| 6. Configuration Changes | ✅/❌ | |
| 7. PWA Installation | ✅/❌ | |
| 8. Manifest Validation | ✅/❌ | |
| 9. Cache Headers | ✅/❌ | |
| 10. Performance | ✅/❌ | |
| 11. SW Update Flow | ✅/❌ | |

## Issues Found

[List any issues discovered]

## Overall Assessment

- [ ] All critical tests pass
- [ ] Ready for production
- [ ] Requires fixes

**Recommendation**: [APPROVE / REJECT / NEEDS WORK]
```

---

## Success Criteria

**Minimum Requirements** (must pass):
- ✅ Test 1: Service Worker registers
- ✅ Test 2: HTML uses network-first
- ✅ Test 4: Module activation works with F5
- ✅ Test 5: Offline fallback works
- ✅ Test 9: Cache headers correct

**Full Compliance** (all must pass):
- ✅ All 11 tests pass
- ✅ No regressions
- ✅ Performance targets met
- ✅ Lighthouse PWA score >95%

---

## Next Steps After Testing

1. **If all tests pass**: Ready for staging/production
2. **If minor issues**: Fix and retest
3. **If major issues**: Review implementation and specs

**Before Production**:
- Replace placeholder icons with branded icons
- Test on real devices (Android, iOS, Desktop)
- Run full Lighthouse audit on production build
- Monitor service worker errors

---

**Testing Guide Version**: 1.0
**Last Updated**: 2025-11-06
**Status**: Ready for Use
