// Module Registry - Singleton pattern for tracking loaded modules
// Based on SPEC-module-loading.md

import type { ModuleExports } from '../../types/module';

class ModuleRegistry {
  private modules: Map<string, ModuleExports>;
  private loading: Map<string, Promise<ModuleExports>>;

  constructor() {
    this.modules = new Map();
    this.loading = new Map();
  }

  has(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  get(moduleId: string): ModuleExports | undefined {
    return this.modules.get(moduleId);
  }

  register(moduleId: string, exports: ModuleExports): void {
    this.modules.set(moduleId, exports);
  }

  isLoading(moduleId: string): boolean {
    return this.loading.has(moduleId);
  }

  getLoadingPromise(moduleId: string): Promise<ModuleExports> | undefined {
    return this.loading.get(moduleId);
  }

  setLoading(moduleId: string, promise: Promise<ModuleExports>): void {
    this.loading.set(moduleId, promise);
  }

  clearLoading(moduleId: string): void {
    this.loading.delete(moduleId);
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();
