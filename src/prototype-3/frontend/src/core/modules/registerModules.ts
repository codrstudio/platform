/**
 * Module Registration Function
 *
 * Registers all platform modules with the ModuleRegistry.
 * This function should be called once during application initialization.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-ST-006, SPEC-MO-EX-007)
 * - Story 1.5.2: Module Registration System
 */

import moduleRegistry from './ModuleRegistry';

/**
 * Register all platform modules
 *
 * This function imports and registers all available modules in the platform.
 * Each module's manifest and exports are registered with the central ModuleRegistry.
 *
 * Module loading strategy:
 * - Import modules synchronously during app initialization
 * - Modules auto-register themselves when imported
 * - Registry acts as single source of truth for module discovery
 *
 * Adding new modules:
 * 1. Create module in src/modules/[module-name]/
 * 2. Implement manifest.ts and index.ts following SPEC-modules.md
 * 3. Import and register in this function
 *
 * SPEC-MO-ST-006: Entry point (index.ts) exports module metadata
 * SPEC-MO-EX-007: index.ts is the entry point for each module
 */
export function registerModules(): void {
  if (import.meta.env.DEV) {
    console.log('[ModuleRegistry] Starting module registration...');
  }

  try {
    // Register Setup module (SPEC-module-setup.md)
    // Setup is the platform configuration module - always available
    import('../../modules/setup').then((setupModule) => {
      moduleRegistry.register({
        manifest: setupModule.manifest,
        routes: setupModule.routes,
      });
    });

    // Future modules will be registered here:
    // Example:
    // import('../../modules/chat').then((chatModule) => {
    //   moduleRegistry.register({
    //     manifest: chatModule.manifest,
    //     routes: chatModule.routes,
    //     components: chatModule.components,
    //     hooks: chatModule.hooks,
    //   });
    // });
    //
    // import('../../modules/app-components').then((appComponents) => {
    //   moduleRegistry.register({
    //     manifest: appComponents.manifest,
    //     components: appComponents.components,
    //   });
    // });

    if (import.meta.env.DEV) {
      // Wait a bit for async registrations to complete
      setTimeout(() => {
        const stats = moduleRegistry.getStats();
        console.log('[ModuleRegistry] Module registration complete:', stats);
      }, 100);
    }
  } catch (error) {
    console.error('[ModuleRegistry] Failed to register modules:', error);
    throw error;
  }
}

/**
 * Get registry statistics (for debugging/monitoring)
 *
 * @returns Module registry statistics
 */
export function getRegistryStats() {
  return moduleRegistry.getStats();
}
