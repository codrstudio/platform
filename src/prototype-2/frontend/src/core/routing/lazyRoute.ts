import React from 'react';

/**
 * Wraps a component with React.lazy for code splitting
 *
 * @param importFn - Function that returns a dynamic import promise
 * @returns Lazy-loaded component
 *
 * @example
 * const HomePage = lazyRoute(() => import('./pages/HomePage'));
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn);
}

/**
 * Creates a lazy route from a module path
 * Useful for dynamic module loading
 *
 * @param modulePath - Relative path to module
 * @returns Lazy-loaded component
 *
 * @example
 * const SetupHome = lazyRouteFromPath('../../modules/setup/pages/Home');
 */
export function lazyRouteFromPath<T extends React.ComponentType<any>>(
  modulePath: string
): React.LazyExoticComponent<T> {
  return React.lazy(() => import(/* @vite-ignore */ modulePath) as Promise<{ default: T }>);
}

/**
 * Preloads a lazy component
 * Useful for prefetching likely-to-be-visited routes
 *
 * @param lazyComponent - Lazy component to preload
 *
 * @example
 * const HomePage = lazyRoute(() => import('./HomePage'));
 * preloadLazyRoute(HomePage); // Starts downloading immediately
 */
export function preloadLazyRoute(
  lazyComponent: React.LazyExoticComponent<any>
): void {
  // Accessing _ctor triggers the import
  // This is an internal React implementation detail but widely used
  const component = lazyComponent as any;
  if (component._ctor) {
    component._ctor();
  }
}
