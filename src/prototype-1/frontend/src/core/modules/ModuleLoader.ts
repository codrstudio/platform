/**
 * Module Loader
 * Loads modules dynamically with dependency resolution
 * SPEC-MO-L-* compliance
 */

import { moduleRegistry } from './ModuleRegistry';
import type { ModuleManifest } from './types';

/**
 * Module Loader Class
 * Handles dynamic module loading with dependency resolution
 */
class ModuleLoader {
  private loadedModules: Map<string, ModuleManifest> = new Map();
  private loadingPromises: Map<string, Promise<ModuleManifest>> = new Map();

  /**
   * Load a single module
   * @param moduleId - Module identifier
   * @returns Module manifest
   */
  async loadModule(moduleId: string): Promise<ModuleManifest> {
    // Return cached module if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)!;
    }

    // Start loading
    const loadingPromise = this.performLoad(moduleId);
    this.loadingPromises.set(moduleId, loadingPromise);

    try {
      const manifest = await loadingPromise;
      this.loadedModules.set(moduleId, manifest);
      return manifest;
    } finally {
      this.loadingPromises.delete(moduleId);
    }
  }

  /**
   * Perform actual module load
   */
  private async performLoad(moduleId: string): Promise<ModuleManifest> {
    // Get loader from registry
    const loader = moduleRegistry.get(moduleId);

    if (!loader) {
      throw new Error(`Module "${moduleId}" is not registered`);
    }

    try {
      // Dynamic import
      const module = await loader();
      const manifest = module.default;

      // Validate manifest
      this.validateManifest(manifest);

      // Load dependencies first
      if (manifest.dependencies && manifest.dependencies.length > 0) {
        await this.loadDependencies(manifest.dependencies);
      }

      return manifest;
    } catch (error: any) {
      throw new Error(`Failed to load module "${moduleId}": ${error.message}`);
    }
  }

  /**
   * Load multiple modules in parallel
   * @param moduleIds - Array of module identifiers
   * @returns Array of module manifests
   */
  async loadModules(moduleIds: string[]): Promise<ModuleManifest[]> {
    const promises = moduleIds.map((id) => this.loadModule(id));
    return Promise.all(promises);
  }

  /**
   * Load module dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    const missingDeps: string[] = [];

    // Check if all dependencies are registered
    for (const depId of dependencies) {
      if (!moduleRegistry.has(depId)) {
        missingDeps.push(depId);
      }
    }

    if (missingDeps.length > 0) {
      throw new Error(
        `Missing dependencies: ${missingDeps.join(', ')}. Please register these modules first.`
      );
    }

    // Load all dependencies
    await this.loadModules(dependencies);
  }

  /**
   * Validate module manifest
   */
  private validateManifest(manifest: ModuleManifest): void {
    if (!manifest.moduleId || typeof manifest.moduleId !== 'string') {
      throw new Error('Module manifest must have a valid moduleId');
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      throw new Error('Module manifest must have a valid name');
    }

    if (!manifest.type || !['component', 'functionality'].includes(manifest.type)) {
      throw new Error('Module manifest must have a valid type (component or functionality)');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      throw new Error('Module manifest must have a valid version');
    }

    if (!manifest.exports || typeof manifest.exports !== 'object') {
      throw new Error('Module manifest must have an exports object');
    }
  }

  /**
   * Get loaded module
   * @param moduleId - Module identifier
   * @returns Module manifest or undefined
   */
  getLoaded(moduleId: string): ModuleManifest | undefined {
    return this.loadedModules.get(moduleId);
  }

  /**
   * Check if module is loaded
   * @param moduleId - Module identifier
   * @returns True if module is loaded
   */
  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  /**
   * Clear loaded modules cache
   */
  clearCache(): void {
    this.loadedModules.clear();
    this.loadingPromises.clear();
  }
}

// Export singleton instance
export const moduleLoader = new ModuleLoader();

// Also export class for testing
export { ModuleLoader };
