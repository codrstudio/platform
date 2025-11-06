/**
 * Module Loader
 *
 * Dynamic module loader with lazy loading and caching.
 * Loads modules on demand using dynamic import() and prevents duplicate loads.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-*, SPEC-MO-PE-005 to SPEC-MO-PE-007)
 * - SPEC-architecture.md (SPEC-A-LL-001 to SPEC-A-LL-005)
 *
 * Story 1.5.3: Load modules dynamically
 */

import type { ModuleExports } from '../../types/module';
import moduleRegistry from './ModuleRegistry';
import dependencyManager from './DependencyManager';

/**
 * Module load state
 */
export type ModuleLoadState =
  | 'pending'
  | 'loading'
  | 'loaded'
  | 'error';

/**
 * Module cache entry
 */
interface ModuleCacheEntry {
  state: ModuleLoadState;
  module?: ModuleExports;
  error?: Error;
  promise?: Promise<ModuleExports>;
}

/**
 * ModuleLoader - Dynamic module loader with caching
 *
 * Design principles:
 * - Lazy loading: Modules loaded only when needed (SPEC-MO-LC-002, SPEC-MO-LC-003)
 * - Caching: Prevent duplicate loads of same module
 * - Error handling: Graceful degradation on load failures (SPEC-MO-LC-004)
 * - Promise deduplication: Multiple simultaneous loads share same promise
 * - Async operations: Non-blocking UI during module load (SPEC-MO-LC-007)
 *
 * SPEC-A-LL-001: Platform implements lazy loading of modules
 * SPEC-A-LL-002: Only active modules are loaded
 * SPEC-A-LL-003: Inactive modules are not downloaded
 * SPEC-A-LL-004: Modules loaded on demand (code splitting)
 * SPEC-MO-PE-005: Heavy components use React.lazy()
 * SPEC-MO-PE-007: Dynamic imports when appropriate
 */
class ModuleLoader {
  /**
   * Module cache
   * Key: moduleId
   * Value: Cache entry with state and loaded module
   */
  private cache: Map<string, ModuleCacheEntry> = new Map();

  /**
   * Module path resolver
   * Maps moduleId to import path
   *
   * SPEC-MO-LC-002: Use dynamic import('./modules/my-module')
   */
  private modulePathResolver = (moduleId: string): string => {
    return `../../modules/${moduleId}/index`;
  };

  /**
   * Load a module dynamically
   *
   * @param moduleId - Unique module identifier
   * @param skipDependencies - Skip dependency loading (used internally)
   * @returns Promise that resolves to ModuleExports
   * @throws Error if module fails to load
   *
   * SPEC-MO-LC-001: Module loaded when portal that activates it is opened
   * SPEC-MO-LC-002: Dynamic import for lazy loading
   * SPEC-MO-LC-003: Asynchronous loading
   * SPEC-MO-LC-004: Errors handled gracefully
   * SPEC-MO-DE-005: Platform validates dependencies when activating module
   * SPEC-MO-DE-007: Auto-activate dependencies if not active
   */
  async loadModule(moduleId: string, skipDependencies = false): Promise<ModuleExports> {
    // Check cache first
    const cached = this.cache.get(moduleId);

    // If already loaded, return cached module
    if (cached?.state === 'loaded' && cached.module) {
      if (import.meta.env.DEV) {
        console.log(`[ModuleLoader] Using cached module: ${moduleId}`);
      }
      return cached.module;
    }

    // If currently loading, return existing promise (deduplication)
    if (cached?.state === 'loading' && cached.promise) {
      if (import.meta.env.DEV) {
        console.log(`[ModuleLoader] Waiting for in-flight load: ${moduleId}`);
      }
      return cached.promise;
    }

    // If previous load failed, re-attempt
    if (cached?.state === 'error') {
      if (import.meta.env.DEV) {
        console.log(`[ModuleLoader] Retrying failed load: ${moduleId}`);
      }
      this.cache.delete(moduleId);
    }

    // Load dependencies first (unless explicitly skipped)
    // SPEC-MO-DE-005: Platform validates dependencies when activating
    // SPEC-MO-DE-007: Auto-activate dependencies if not active
    if (!skipDependencies) {
      try {
        // Pass loadModule as the loader function (bound to this instance)
        await dependencyManager.loadDependencies(
          moduleId,
          this.loadModule.bind(this)
        );
      } catch (error) {
        const depError = error instanceof Error
          ? error
          : new Error(`Failed to load dependencies for module: ${moduleId}`);

        console.error(`[ModuleLoader] Dependency loading failed for "${moduleId}":`, depError);

        // Cache error state
        this.cache.set(moduleId, {
          state: 'error',
          error: depError,
        });

        throw depError;
      }
    }

    // Start new load
    const loadPromise = this.executeLoad(moduleId);

    // Cache the promise for deduplication
    this.cache.set(moduleId, {
      state: 'loading',
      promise: loadPromise,
    });

    return loadPromise;
  }

  /**
   * Execute module load with dynamic import
   *
   * @param moduleId - Module to load
   * @returns Promise resolving to ModuleExports
   */
  private async executeLoad(moduleId: string): Promise<ModuleExports> {
    if (import.meta.env.DEV) {
      console.log(`[ModuleLoader] Loading module: ${moduleId}`);
    }

    try {
      const modulePath = this.modulePathResolver(moduleId);

      // Dynamic import - creates separate chunk (code splitting)
      // SPEC-A-LL-008: Modules divided into separate chunks
      const moduleExports = await import(/* @vite-ignore */ modulePath);

      // Validate module exports
      if (!moduleExports.manifest) {
        throw new Error(
          `Module "${moduleId}" does not export a valid manifest`
        );
      }

      // Get default export or named exports
      const resolvedExports = moduleExports.default || moduleExports;

      // Update cache with loaded module
      this.cache.set(moduleId, {
        state: 'loaded',
        module: resolvedExports,
      });

      // Register module in registry after load
      // SPEC-MO-LC-011: After loading, routes available
      // SPEC-MO-LC-012: Components available
      if (!moduleRegistry.hasModule(moduleId)) {
        moduleRegistry.register(resolvedExports);
      }

      if (import.meta.env.DEV) {
        console.log(
          `[ModuleLoader] Successfully loaded: ${moduleId} v${resolvedExports.manifest.version}`
        );
      }

      return resolvedExports;
    } catch (error) {
      // Log error for debugging
      // SPEC-MO-LC-008: Error in initialization logged
      const loadError = error instanceof Error
        ? error
        : new Error(`Failed to load module: ${moduleId}`);

      console.error(`[ModuleLoader] Failed to load module "${moduleId}":`, loadError);

      // Update cache with error state
      this.cache.set(moduleId, {
        state: 'error',
        error: loadError,
      });

      throw loadError;
    }
  }

  /**
   * Get module load state
   *
   * @param moduleId - Module to check
   * @returns Current load state
   */
  getLoadState(moduleId: string): ModuleLoadState {
    return this.cache.get(moduleId)?.state || 'pending';
  }

  /**
   * Check if module is loaded
   *
   * @param moduleId - Module to check
   * @returns True if module is loaded
   */
  isLoaded(moduleId: string): boolean {
    return this.cache.get(moduleId)?.state === 'loaded';
  }

  /**
   * Check if module is loading
   *
   * @param moduleId - Module to check
   * @returns True if module is currently loading
   */
  isLoading(moduleId: string): boolean {
    return this.cache.get(moduleId)?.state === 'loading';
  }

  /**
   * Get cached module (if loaded)
   *
   * @param moduleId - Module to retrieve
   * @returns ModuleExports or undefined if not loaded
   */
  getCachedModule(moduleId: string): ModuleExports | undefined {
    const cached = this.cache.get(moduleId);
    return cached?.state === 'loaded' ? cached.module : undefined;
  }

  /**
   * Get load error (if failed)
   *
   * @param moduleId - Module to check
   * @returns Error or undefined if not failed
   */
  getLoadError(moduleId: string): Error | undefined {
    const cached = this.cache.get(moduleId);
    return cached?.state === 'error' ? cached.error : undefined;
  }

  /**
   * Preload a module without registering it
   * Useful for eager loading of critical modules
   *
   * @param moduleId - Module to preload
   * @returns Promise resolving when preload completes
   */
  async preloadModule(moduleId: string): Promise<void> {
    try {
      await this.loadModule(moduleId);
    } catch (error) {
      // Silently fail preload - module will be loaded on-demand later
      if (import.meta.env.DEV) {
        console.warn(`[ModuleLoader] Preload failed for ${moduleId}:`, error);
      }
    }
  }

  /**
   * Clear module from cache
   * Forces reload on next access
   *
   * @param moduleId - Module to clear
   * @returns True if module was in cache
   *
   * Warning: Use with caution. Module state might be lost.
   */
  clearCache(moduleId: string): boolean {
    return this.cache.delete(moduleId);
  }

  /**
   * Clear all cached modules
   *
   * Warning: This is primarily for testing purposes.
   * Should not be used in production code.
   */
  clearAllCache(): void {
    this.cache.clear();

    if (import.meta.env.DEV) {
      console.log('[ModuleLoader] Cleared all module cache');
    }
  }

  /**
   * Get loader statistics
   *
   * @returns Statistics about module loading
   */
  getStats() {
    const states = Array.from(this.cache.values()).map((entry) => entry.state);

    return {
      total: this.cache.size,
      pending: states.filter((s) => s === 'pending').length,
      loading: states.filter((s) => s === 'loading').length,
      loaded: states.filter((s) => s === 'loaded').length,
      error: states.filter((s) => s === 'error').length,
    };
  }
}

/**
 * Singleton instance of ModuleLoader
 * Exported as default for global access throughout the application
 *
 * Usage:
 * ```typescript
 * import moduleLoader from '@/core/modules/ModuleLoader';
 *
 * // Load a module
 * const moduleExports = await moduleLoader.loadModule('setup');
 *
 * // Check load state
 * if (moduleLoader.isLoaded('chat')) {
 *   // Module is ready
 * }
 *
 * // Preload a module
 * await moduleLoader.preloadModule('notifications');
 * ```
 */
const moduleLoader = new ModuleLoader();

export default moduleLoader;
