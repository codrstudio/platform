/**
 * Module Registry
 * Central registry for all available modules
 * SPEC-MO-R-* compliance
 */

import type { ModuleLoader } from './types';

/**
 * Module Registry Class
 * Singleton pattern for module registration
 */
class ModuleRegistry {
  private registry: Map<string, ModuleLoader> = new Map();

  /**
   * Register a module
   * @param moduleId - Unique module identifier
   * @param loader - Dynamic import function
   */
  register(moduleId: string, loader: ModuleLoader): void {
    if (this.registry.has(moduleId)) {
      console.warn(`Module "${moduleId}" is already registered. Overwriting.`);
    }
    this.registry.set(moduleId, loader);
  }

  /**
   * Get module loader
   * @param moduleId - Module identifier
   * @returns Module loader function
   */
  get(moduleId: string): ModuleLoader | undefined {
    return this.registry.get(moduleId);
  }

  /**
   * Check if module exists
   * @param moduleId - Module identifier
   * @returns True if module is registered
   */
  has(moduleId: string): boolean {
    return this.registry.has(moduleId);
  }

  /**
   * List all registered module IDs
   * @returns Array of module IDs
   */
  list(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Unregister a module
   * @param moduleId - Module identifier
   * @returns True if module was removed
   */
  unregister(moduleId: string): boolean {
    return this.registry.delete(moduleId);
  }

  /**
   * Clear all registered modules
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Get registry size
   * @returns Number of registered modules
   */
  get size(): number {
    return this.registry.size;
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();

// Also export class for testing
export { ModuleRegistry };
