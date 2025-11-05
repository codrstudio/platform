# Module Loading and Code Splitting

## How Modules Are Split

Each module in `src/modules/{moduleId}/` automatically becomes a separate chunk when:
1. Module uses default export from index.tsx
2. Module is loaded via dynamic import: `import('./modules/{moduleId}/index.tsx')`
3. Vite detects the import and generates: `assets/modules-{moduleId}-[hash].js`

## Module Structure for Optimal Splitting

### Good: Lazy Loading
```typescript
// Module loader (in core/modules/loader.ts)
const moduleExports = await import(`./modules/${moduleId}/index.tsx`);
```

This creates a separate chunk that loads on-demand.

### Bad: Static Import
```typescript
// DON'T do this - bundles all modules upfront
import ChatModule from './modules/chat/index.tsx';
import DashboardModule from './modules/dashboard/index.tsx';
```

Static imports defeat the purpose of lazy loading and increase initial bundle size.

## Shared Dependencies

The following libraries are already extracted to vendor chunks and won't be duplicated in module bundles:

- **react-vendor**: react, react-dom, react-router-dom (~140KB)
- **query-vendor**: @tanstack/react-query, @tanstack/react-query-devtools (~50KB)
- **ui-vendor**: @radix-ui/* (shadcn/ui components) (~150KB)
- **form-vendor**: react-hook-form, zod, @hookform/resolvers (~30KB)

When writing modules, freely use these libraries - they won't increase module size because they're shared across all modules.

## Code Splitting Best Practices

### 1. Use Dynamic Imports for Routes
```typescript
// In module's route configuration
import React from 'react';

const routes = [
  {
    path: '/dashboard',
    element: React.lazy(() => import('./pages/DashboardPage'))
  },
  {
    path: '/settings',
    element: React.lazy(() => import('./pages/SettingsPage'))
  }
];
```

### 2. Wrap Lazy Components in Suspense
```typescript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* lazy-loaded routes */}
      </Routes>
    </Suspense>
  );
}
```

### 3. Avoid Heavy Dependencies in Modules
If a module needs a large library (e.g., a charting library), consider:
- Lazy loading that specific component
- Using a lighter alternative
- Requesting the library be added to a vendor chunk (if used by multiple modules)

```typescript
// Good: Lazy load heavy component
const ChartComponent = React.lazy(() => import('./components/HeavyChart'));

// In render:
<Suspense fallback={<Skeleton />}>
  <ChartComponent data={data} />
</Suspense>
```

## Checking Bundle Sizes

After building, check chunk sizes:

```bash
npm run build

# Output shows chunk sizes:
dist/assets/index-a7f3b2c.js                52.34 kB │ gzip: 18.21 kB
dist/assets/react-vendor-9d4e1f0.js        142.18 kB │ gzip: 45.32 kB
dist/assets/query-vendor-1a2b3c4.js         50.23 kB │ gzip: 16.78 kB
dist/assets/ui-vendor-5d6e7f8.js           150.45 kB │ gzip: 52.13 kB
dist/assets/form-vendor-9g0h1i2.js          30.12 kB │ gzip: 10.45 kB
dist/assets/modules-chat-f3e9a12.js        198.45 kB │ gzip: 67.89 kB
```

### Performance Targets (SPEC-A-LL-006 to 009)
- **Initial bundle** (index.js): < 200KB gzipped
- **Each module chunk**: < 500KB gzipped
- **Landing page load**: < 1s on 3G
- **Vendor chunks**: Cached aggressively (30 days)
- **Module chunks**: Cached with revalidation (7 days)

## Cache Strategies

Different chunk types use different service worker caching strategies:

1. **Vendor Chunks** (`*-vendor-*.js`): CacheFirst
   - Rarely change
   - Cached for 30 days
   - Browser downloads once and reuses

2. **Module Chunks** (`modules-*.js`): StaleWhileRevalidate
   - May receive updates
   - Cached for 7 days
   - Serves from cache but checks for updates

3. **Main Bundle** (`index-*.js`): CacheFirst
   - Core application logic
   - Cached for 30 days
   - Updates on service worker update

## Debugging Code Splitting

### Check What's Loading
Open browser DevTools → Network tab → Filter by JS → Refresh page

**Expected behavior**:
1. Initial load: index.js + vendor chunks (~5-7 requests)
2. Navigate to portal: module chunks load on-demand
3. Subsequent navigation: chunks loaded from cache

### Common Issues

**Issue**: Module chunk fails to load
- **Cause**: Network error, file missing, CDN issue
- **Solution**: Check Network tab for failed requests, verify build output

**Issue**: Chunk loads but throws error
- **Cause**: JavaScript parse error, version mismatch
- **Solution**: Clear browser cache, rebuild application

**Issue**: Initial bundle too large
- **Cause**: Static imports instead of dynamic imports
- **Solution**: Convert to `React.lazy()` or `import()` where possible

**Issue**: Module chunk includes duplicate code
- **Cause**: Library not in vendor chunks
- **Solution**: Add library to appropriate vendor chunk in vite.config.ts

## Measuring Performance

### Lighthouse Audit (Chrome DevTools)
1. Open site in Chrome
2. DevTools → Lighthouse
3. Select "Performance" category
4. Generate report

**Target scores**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- PWA: Installable

### Bundle Analysis (Optional)
For detailed bundle visualization:

```bash
# Install visualizer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts plugins:
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  // ... other plugins
  visualizer({ open: true })
]

# Build
npm run build
# Opens stats.html with interactive treemap
```

Use this to:
- Identify largest dependencies
- Find duplicate code
- Verify vendor chunks contain expected libraries
- Spot opportunities for optimization

## Module Development Checklist

When creating a new module, ensure:

- [ ] Module uses dynamic import for loading
- [ ] Heavy components use React.lazy()
- [ ] Routes wrapped in Suspense with fallback
- [ ] Shared dependencies (React, UI libs) imported normally (not bundled)
- [ ] Module chunk < 500KB gzipped
- [ ] No static imports of other modules
- [ ] Error boundaries handle chunk load failures
- [ ] Module exports follow standard interface (routes, components, etc.)

## References

- **SPEC-architecture.md** - SPEC-A-LL-001:010 (Lazy Loading requirements)
- **SPEC-module-loading.md** - SPEC-LOAD-CS-001:005 (Code Splitting strategy)
- [Vite - Code Splitting](https://vite.dev/guide/features.html#code-splitting)
- [React.lazy Documentation](https://react.dev/reference/react/lazy)
- [Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
