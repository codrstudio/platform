/**
 * Module Registry
 *
 * Central registry for managing platform modules.
 * Provides thread-safe registration, retrieval, and management of modules.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-ST-*, SPEC-MO-MA-*)
 * - SPEC-concepts.md (SPEC-C-M-*)
 *
 * Story 1.5.2: Module Registration System
 */

import type { Module, ModuleExports } from '../../types/module';

/**
 * ModuleRegistry - Singleton registry for platform modules
 *
 * Design principles:
 * - Singleton pattern ensures single source of truth
 * - Type-safe storage with TypeScript
 * - Thread-safe operations (Map is synchronous)
 * - Defensive programming with validation
 *
 * SPEC-MO-ST-001: Modules are JavaScript/TypeScript packages
 * SPEC-MO-ST-002: Each module has unique moduleId
 * SPEC-MO-ST-006: Entry point exports module metadata
 */
class ModuleRegistry {
  /**
   * Internal storage for registered modules
   * Key: moduleId (unique identifier)
   * Value: Module object with manifest and exports
   */
  private modules: Map<string, Module> = new Map();

  /**
   * Register a module in the registry
   *
   * @param moduleExports - Module exports containing manifest and optional routes/components/hooks
   * @throws Error if module ID is invalid or already registered
   *
   * SPEC-MO-MA-001: Manifest must include unique id
   * SPEC-MO-MA-005: ID must be alphanumeric without spaces
   * SPEC-MO-MA-006: ID must be unique in the platform
   */
  register(moduleExports: ModuleExports): void {
    const { manifest } = moduleExports;

    // Validate module ID format (alphanumeric, hyphens, underscores allowed)
    if (!manifest.id || !/^[a-zA-Z0-9_-]+$/.test(manifest.id)) {
      throw new Error(
        `Invalid module ID: "${manifest.id}". Must be alphanumeric (hyphens and underscores allowed)`
      );
    }

    // Check for duplicate registration
    // In development (StrictMode), React may call effects twice
    // Also during hot-reload, modules may re-register
    // Make register() idempotent - skip if already registered
    if (this.modules.has(manifest.id)) {
      if (import.meta.env.DEV) {
        console.warn(
          `[ModuleRegistry] Module "${manifest.id}" is already registered, skipping duplicate registration`
        );
      }
      return; // Silently skip duplicate registration
    }

    // Create Module object by spreading manifest properties
    const module: Module = {
      ...moduleExports,
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      type: manifest.type,
    };

    // Store in registry
    this.modules.set(manifest.id, module);

    // Log registration in development mode
    if (import.meta.env.DEV) {
      console.log(
        `[ModuleRegistry] Registered module: ${manifest.id} v${manifest.version} (${manifest.type})`
      );
    }
  }

  /**
   * Retrieve a module by ID
   *
   * @param moduleId - Unique module identifier
   * @returns Module object or undefined if not found
   *
   * SPEC-MO-ST-002: Module lookup by unique moduleId
   */
  getModule(moduleId: string): Module | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   *
   * @returns Array of all registered modules
   *
   * Useful for:
   * - Displaying available modules in Setup UI
   * - Validating dependencies
   * - Module discovery
   */
  getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Check if a module is registered
   *
   * @param moduleId - Unique module identifier
   * @returns True if module exists in registry
   *
   * SPEC-MO-DE-005: Platform validates dependencies when activating modules
   * SPEC-MO-DE-009: Dependency on non-existent module must prevent activation
   */
  hasModule(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  /**
   * Unregister a module from the registry
   *
   * @param moduleId - Unique module identifier
   * @returns True if module was removed, false if not found
   *
   * Warning: Unregistering modules at runtime should be done carefully.
   * Consider checking for dependencies before unregistering.
   */
  unregister(moduleId: string): boolean {
    const existed = this.modules.has(moduleId);

    if (existed) {
      this.modules.delete(moduleId);

      if (import.meta.env.DEV) {
        console.log(`[ModuleRegistry] Unregistered module: ${moduleId}`);
      }
    }

    return existed;
  }

  /**
   * Get modules filtered by type
   *
   * @param type - Module type ('components' or 'functionality')
   * @returns Array of modules matching the type
   *
   * SPEC-MO-MA-004: Module type is either "components" or "functionality"
   * SPEC-MO-MC-002: Component modules have type="components"
   * SPEC-MO-MF-002: Functionality modules have type="functionality"
   */
  getModulesByType(type: 'components' | 'functionality'): Module[] {
    return this.getAllModules().filter((module) => module.type === type);
  }

  /**
   * Get modules by category
   *
   * @param category - Module category string
   * @returns Array of modules in the category
   *
   * SPEC-MO-MA-011: Modules can have optional category for organization
   */
  getModulesByCategory(category: string): Module[] {
    return this.getAllModules().filter(
      (module) => module.manifest.category === category
    );
  }

  /**
   * Validate module dependencies
   *
   * @param moduleId - Module to validate
   * @returns Object with validation result and missing dependencies
   *
   * SPEC-MO-DE-001: Dependencies declared in manifest
   * SPEC-MO-DE-004: Dependencies reference exact moduleIds
   * SPEC-MO-DE-009: Missing dependencies prevent activation
   */
  validateDependencies(moduleId: string): {
    valid: boolean;
    missingDependencies: string[];
  } {
    const module = this.getModule(moduleId);

    if (!module) {
      return {
        valid: false,
        missingDependencies: [],
      };
    }

    const dependencies = module.manifest.dependencies || [];
    const missingDependencies = dependencies.filter(
      (depId) => !this.hasModule(depId)
    );

    return {
      valid: missingDependencies.length === 0,
      missingDependencies,
    };
  }

  /**
   * Get registry statistics
   *
   * @returns Statistics about registered modules
   */
  getStats() {
    const allModules = this.getAllModules();

    return {
      total: allModules.length,
      components: this.getModulesByType('components').length,
      functionality: this.getModulesByType('functionality').length,
      withRoutes: allModules.filter((m) => m.routes && m.routes.length > 0)
        .length,
      withDependencies: allModules.filter(
        (m) => m.manifest.dependencies && m.manifest.dependencies.length > 0
      ).length,
    };
  }

  /**
   * Clear all registered modules
   *
   * Warning: This is primarily for testing purposes.
   * Should not be used in production code.
   */
  clear(): void {
    this.modules.clear();

    if (import.meta.env.DEV) {
      console.log('[ModuleRegistry] Cleared all modules');
    }
  }
}

/**
 * Singleton instance of ModuleRegistry
 * Exported as default for global access throughout the application
 *
 * Usage:
 * ```typescript
 * import moduleRegistry from '@/core/modules/ModuleRegistry';
 *
 * // Register a module
 * moduleRegistry.register(myModuleExports);
 *
 * // Retrieve a module
 * const module = moduleRegistry.getModule('setup');
 *
 * // Check if module exists
 * if (moduleRegistry.hasModule('chat')) {
 *   // ...
 * }
 * ```
 */
const moduleRegistry = new ModuleRegistry();

export default moduleRegistry;
