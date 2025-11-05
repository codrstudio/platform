// Module Loader - Dynamic module loading with React.lazy
// Based on SPEC-module-loading.md

import { moduleRegistry } from './ModuleRegistry';
import type { ModuleExports } from '../../types/module';

export class ModuleLoader {
  /**
   * Loads a module dynamically using dynamic import
   * Returns module exports or throws error
   */
  static async loadModule(moduleId: string): Promise<ModuleExports> {
    // Check if already loaded
    if (moduleRegistry.has(moduleId)) {
      return moduleRegistry.get(moduleId)!;
    }

    // Check if currently loading
    if (moduleRegistry.isLoading(moduleId)) {
      return moduleRegistry.getLoadingPromise(moduleId)!;
    }

    // Start loading
    const loadingPromise = this.performLoad(moduleId);
    moduleRegistry.setLoading(moduleId, loadingPromise);

    try {
      const exports = await loadingPromise;
      moduleRegistry.register(moduleId, exports);
      moduleRegistry.clearLoading(moduleId);
      return exports;
    } catch (error) {
      moduleRegistry.clearLoading(moduleId);
      throw error;
    }
  }

  private static async performLoad(moduleId: string): Promise<ModuleExports> {
    try {
      // Dynamic import with static path structure (Vite requirement)
      const module = await import(`../../modules/${moduleId}/index.ts`);

      // Validate module exports
      if (!module.default) {
        throw new Error(`Module ${moduleId} does not have default export`);
      }

      return module.default as ModuleExports;
    } catch (error) {
      console.error(`Failed to load module ${moduleId}:`, error);
      throw new Error(`Module ${moduleId} failed to load`);
    }
  }

  /**
   * Loads multiple modules in parallel
   */
  static async loadModules(moduleIds: string[]): Promise<ModuleExports[]> {
    return Promise.all(moduleIds.map(id => this.loadModule(id)));
  }
}
