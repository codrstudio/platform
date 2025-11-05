// Core routing public API
// Barrel exports for clean imports

export { default as PortalLoader } from './PortalLoader';
export { MainPortalRouter } from './MainPortalRouter';
export { default as PortalRouter } from './PortalRouter';
export { default as ProtectedRoute } from './ProtectedRoute';

// Route registration system
export * from './types';
export { registerRoutes, unregisterRoutes } from './registerRoutes';
export { prefixRoutes } from './prefixRoutes';
export {
  getPortalRoutes,
  setPortalRoutes,
  addPortalRoutes,
  clearPortalRoutes,
  getRegisteredPortals,
  debugRegistry,
} from './routeRegistry';

// Lazy loading utilities
export { lazyRoute, lazyRouteFromPath, preloadLazyRoute } from './lazyRoute';
export { default as RouteSuspense } from './RouteSuspense';

// Hooks
export { usePortalRoutes } from './hooks';
