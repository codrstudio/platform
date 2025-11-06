/**
 * useModuleLoader Hook
 *
 * React hook for loading modules dynamically with loading and error states.
 * Integrates ModuleLoader with React lifecycle.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-*, SPEC-MO-PE-*)
 * - SPEC-architecture.md (SPEC-A-LL-*)
 *
 * Story 1.5.3: Load modules dynamically
 */

import { useState, useEffect, useCallback } from 'react';
import moduleLoader from '../core/modules/ModuleLoader';
import type { ModuleExports } from '../types/module';
import type { ModuleLoadState } from '../core/modules/ModuleLoader';

/**
 * Hook return type
 */
export interface UseModuleLoaderResult {
  /** Loaded module exports (undefined until loaded) */
  module: ModuleExports | undefined;

  /** Current load state */
  state: ModuleLoadState;

  /** Loading indicator */
  isLoading: boolean;

  /** Error object if load failed */
  error: Error | undefined;

  /** Function to trigger module load */
  loadModule: () => Promise<void>;

  /** Function to retry failed load */
  retry: () => Promise<void>;
}

/**
 * useModuleLoader - React hook for dynamic module loading
 *
 * Features:
 * - Automatic loading on mount (optional)
 * - Loading and error states
 * - Retry mechanism
 * - Cleanup on unmount
 * - Integration with ModuleLoader cache
 *
 * @param moduleId - Unique module identifier
 * @param options - Hook options
 * @returns Hook result with module, state, and control functions
 *
 * SPEC-MO-LC-001: Module loaded when portal activates it
 * SPEC-MO-LC-003: Asynchronous loading
 * SPEC-MO-LC-004: Error handling
 * SPEC-MO-LC-007: Fast initialization (non-blocking)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { module, isLoading, error, retry } = useModuleLoader('setup');
 *
 *   if (isLoading) return <LoadingSkeleton />;
 *   if (error) return <ErrorFallback error={error} onRetry={retry} />;
 *   if (!module) return null;
 *
 *   return <ModuleContent module={module} />;
 * }
 * ```
 */
export function useModuleLoader(
  moduleId: string,
  options: {
    /** Load module automatically on mount (default: true) */
    autoLoad?: boolean;
  } = {}
): UseModuleLoaderResult {
  const { autoLoad = true } = options;

  // State management
  const [module, setModule] = useState<ModuleExports | undefined>(
    () => moduleLoader.getCachedModule(moduleId)
  );
  const [state, setState] = useState<ModuleLoadState>(
    () => moduleLoader.getLoadState(moduleId)
  );
  const [error, setError] = useState<Error | undefined>(
    () => moduleLoader.getLoadError(moduleId)
  );

  /**
   * Load module function
   * Memoized to prevent unnecessary re-creation
   */
  const loadModule = useCallback(async () => {
    // If already loaded, return early
    if (moduleLoader.isLoaded(moduleId)) {
      const cached = moduleLoader.getCachedModule(moduleId);
      if (cached) {
        setModule(cached);
        setState('loaded');
        setError(undefined);
        return;
      }
    }

    // Set loading state
    setState('loading');
    setError(undefined);

    try {
      // Load module via ModuleLoader
      const loadedModule = await moduleLoader.loadModule(moduleId);

      // Update state on success
      setModule(loadedModule);
      setState('loaded');
      setError(undefined);
    } catch (err) {
      // Update state on error
      const loadError = err instanceof Error
        ? err
        : new Error(`Failed to load module: ${moduleId}`);

      setModule(undefined);
      setState('error');
      setError(loadError);
    }
  }, [moduleId]);

  /**
   * Retry function
   * Clears error state and retries load
   */
  const retry = useCallback(async () => {
    // Clear cache to force fresh load
    moduleLoader.clearCache(moduleId);

    // Retry load
    await loadModule();
  }, [moduleId, loadModule]);

  /**
   * Auto-load on mount
   * SPEC-MO-LC-001: Module loaded when portal opens
   */
  useEffect(() => {
    if (autoLoad && state === 'pending') {
      loadModule();
    }
  }, [autoLoad, state, loadModule]);

  /**
   * Sync with ModuleLoader cache on moduleId change
   */
  useEffect(() => {
    // Update state from cache when moduleId changes
    const cachedModule = moduleLoader.getCachedModule(moduleId);
    const loadState = moduleLoader.getLoadState(moduleId);
    const loadError = moduleLoader.getLoadError(moduleId);

    setModule(cachedModule);
    setState(loadState);
    setError(loadError);
  }, [moduleId]);

  return {
    module,
    state,
    isLoading: state === 'loading',
    error,
    loadModule,
    retry,
  };
}

/**
 * useModulePreloader Hook
 *
 * Hook for preloading modules without rendering them.
 * Useful for eager loading critical modules.
 *
 * @param moduleIds - Array of module IDs to preload
 *
 * @example
 * ```tsx
 * function App() {
 *   // Preload critical modules on app mount
 *   useModulePreloader(['setup', 'auth', 'notifications']);
 *
 *   return <AppContent />;
 * }
 * ```
 */
export function useModulePreloader(moduleIds: string[]): void {
  useEffect(() => {
    // Preload all modules in parallel
    const preloadPromises = moduleIds.map((id) =>
      moduleLoader.preloadModule(id)
    );

    // Wait for all preloads (but don't block render)
    Promise.all(preloadPromises).catch((error) => {
      if (import.meta.env.DEV) {
        console.warn('[useModulePreloader] Preload failed:', error);
      }
    });
  }, [moduleIds]);
}
