/**
 * Instance Manager
 *
 * Manages module instance configurations with CRUD operations.
 * Instances are portal-scoped configurations of activated modules.
 *
 * References:
 * - SPEC-concepts.md (SPEC-C-I-*)
 * - SPEC-modules.md (SPEC-MO-IN-*)
 *
 * Story 1.5.5: Configure module instances
 */

import type { InstanceConfig } from '../../types/module';
import moduleRegistry from './ModuleRegistry';

/**
 * Instance key format: `${portalId}:${moduleId}:${instanceId}`
 * This ensures instance IDs are unique within portal+module scope
 */
type InstanceKey = string;

/**
 * InstanceManager - Manages module instance configurations
 *
 * Design principles:
 * - Singleton pattern for centralized management
 * - Portal-scoped instances (SPEC-C-I-004)
 * - In-memory storage with Map
 * - Type-safe operations
 * - Validation at creation/update
 *
 * SPEC-C-I-001: Instances can only be created from active modules
 * SPEC-C-I-002: Each instance has unique instanceId within portal
 * SPEC-C-I-003: instanceId must be alphanumeric without spaces
 * SPEC-C-I-004: Same instanceId can exist in different portals
 * SPEC-C-I-005: Instances in same portal cannot have duplicate instanceId
 */
class InstanceManager {
  /**
   * Internal storage for instances
   * Key: `${portalId}:${moduleId}:${instanceId}`
   * Value: InstanceConfig
   */
  private instances: Map<InstanceKey, InstanceConfig> = new Map();

  /**
   * Generate instance key for storage
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @param instanceId - Instance ID
   * @returns Composite key for storage
   */
  private getKey(
    portalId: string,
    moduleId: string,
    instanceId: string
  ): InstanceKey {
    return `${portalId}:${moduleId}:${instanceId}`;
  }

  /**
   * Validate instanceId format
   *
   * @param instanceId - Instance ID to validate
   * @throws Error if format is invalid
   *
   * SPEC-C-I-003: instanceId must be alphanumeric without spaces
   */
  private validateInstanceId(instanceId: string): void {
    if (!instanceId || !/^[a-zA-Z0-9_-]+$/.test(instanceId)) {
      throw new Error(
        `Invalid instance ID: "${instanceId}". Must be alphanumeric (hyphens and underscores allowed)`
      );
    }
  }

  /**
   * Validate module exists and is registered
   *
   * @param moduleId - Module ID to validate
   * @throws Error if module doesn't exist
   *
   * SPEC-C-I-001: Instances can only be created from active modules
   * (Note: Registry validation - activation validation happens at portal level)
   */
  private validateModule(moduleId: string): void {
    if (!moduleRegistry.hasModule(moduleId)) {
      throw new Error(
        `Module "${moduleId}" does not exist. Instance can only be created from registered modules.`
      );
    }
  }

  /**
   * Create a new instance
   *
   * @param portalId - Portal ID where instance is created
   * @param moduleId - Module ID this instance belongs to
   * @param instanceId - Unique instance identifier within portal
   * @param config - Instance-specific configuration
   * @returns Created instance configuration
   * @throws Error if validation fails or instance already exists
   *
   * SPEC-C-I-001: Instances only from active modules (validated at registry level)
   * SPEC-C-I-002: Unique instanceId within portal context
   * SPEC-C-I-003: instanceId format validation
   * SPEC-C-I-005: No duplicate instanceId in same portal
   * SPEC-C-I-011: Each instance stores its configuration
   * SPEC-MO-IN-004: Configuration must be JSON-serializable
   */
  createInstance(
    portalId: string,
    moduleId: string,
    instanceId: string,
    config: Record<string, unknown> = {}
  ): InstanceConfig {
    // Validate inputs
    this.validateInstanceId(instanceId);
    this.validateModule(moduleId);

    const key = this.getKey(portalId, moduleId, instanceId);

    // Check for duplicate
    if (this.instances.has(key)) {
      throw new Error(
        `Instance "${instanceId}" already exists for module "${moduleId}" in portal "${portalId}"`
      );
    }

    // Create instance
    const instance: InstanceConfig = {
      instanceId,
      moduleId,
      portalId,
      config,
      meta: {
        createdAt: new Date().toISOString(),
      },
    };

    // Store instance
    this.instances.set(key, instance);

    // Log in development
    if (import.meta.env.DEV) {
      console.log(
        `[InstanceManager] Created instance: ${instanceId} (module: ${moduleId}, portal: ${portalId})`
      );
    }

    return instance;
  }

  /**
   * Get a specific instance
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @param instanceId - Instance ID
   * @returns Instance configuration or undefined if not found
   *
   * SPEC-C-I-015: Configurations accessed via JQEL (this is in-memory access)
   */
  getInstance(
    portalId: string,
    moduleId: string,
    instanceId: string
  ): InstanceConfig | undefined {
    const key = this.getKey(portalId, moduleId, instanceId);
    return this.instances.get(key);
  }

  /**
   * Update an existing instance
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @param instanceId - Instance ID
   * @param config - New configuration (replaces existing)
   * @returns Updated instance configuration
   * @throws Error if instance doesn't exist
   *
   * SPEC-C-I-020: Instances can be edited without deactivating module
   * SPEC-MO-IN-004: Configuration must be JSON-serializable
   */
  updateInstance(
    portalId: string,
    moduleId: string,
    instanceId: string,
    config: Record<string, unknown>
  ): InstanceConfig {
    const key = this.getKey(portalId, moduleId, instanceId);
    const existing = this.instances.get(key);

    if (!existing) {
      throw new Error(
        `Instance "${instanceId}" not found for module "${moduleId}" in portal "${portalId}"`
      );
    }

    // Update configuration
    const updated: InstanceConfig = {
      ...existing,
      config,
      meta: {
        ...existing.meta,
        updatedAt: new Date().toISOString(),
      },
    };

    this.instances.set(key, updated);

    // Log in development
    if (import.meta.env.DEV) {
      console.log(
        `[InstanceManager] Updated instance: ${instanceId} (module: ${moduleId}, portal: ${portalId})`
      );
    }

    return updated;
  }

  /**
   * Delete an instance
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @param instanceId - Instance ID
   * @returns True if instance was deleted, false if not found
   *
   * SPEC-C-I-021: Instances can be removed without deactivating module
   * SPEC-C-R-007: Removal of instance does not affect module or other instances
   */
  deleteInstance(
    portalId: string,
    moduleId: string,
    instanceId: string
  ): boolean {
    const key = this.getKey(portalId, moduleId, instanceId);
    const existed = this.instances.has(key);

    if (existed) {
      this.instances.delete(key);

      // Log in development
      if (import.meta.env.DEV) {
        console.log(
          `[InstanceManager] Deleted instance: ${instanceId} (module: ${moduleId}, portal: ${portalId})`
        );
      }
    }

    return existed;
  }

  /**
   * List all instances for a module in a portal
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @returns Array of instances for the module in the portal
   *
   * SPEC-C-I-006: Module can have zero or more instances
   * SPEC-C-I-007: No limit on number of instances
   */
  listInstances(portalId: string, moduleId: string): InstanceConfig[] {
    const instances: InstanceConfig[] = [];

    // Iterate through all instances and filter by portal and module
    for (const instance of this.instances.values()) {
      if (instance.portalId === portalId && instance.moduleId === moduleId) {
        instances.push(instance);
      }
    }

    return instances;
  }

  /**
   * Delete all instances for a module in a portal
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @returns Number of instances deleted
   *
   * SPEC-C-I-018: Deactivation of module removes all its instances
   */
  deleteModuleInstances(portalId: string, moduleId: string): number {
    const instances = this.listInstances(portalId, moduleId);
    let deleted = 0;

    for (const instance of instances) {
      if (this.deleteInstance(portalId, moduleId, instance.instanceId)) {
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Delete all instances for a portal
   *
   * @param portalId - Portal ID
   * @returns Number of instances deleted
   *
   * SPEC-C-I-019: Removal of portal removes all instances
   * SPEC-C-R-005: Removal of portal deactivates all its modules
   */
  deletePortalInstances(portalId: string): number {
    const instances: InstanceConfig[] = [];

    // Find all instances for this portal
    for (const instance of this.instances.values()) {
      if (instance.portalId === portalId) {
        instances.push(instance);
      }
    }

    // Delete all instances
    let deleted = 0;
    for (const instance of instances) {
      if (
        this.deleteInstance(
          instance.portalId,
          instance.moduleId,
          instance.instanceId
        )
      ) {
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Check if an instance exists
   *
   * @param portalId - Portal ID
   * @param moduleId - Module ID
   * @param instanceId - Instance ID
   * @returns True if instance exists
   */
  hasInstance(
    portalId: string,
    moduleId: string,
    instanceId: string
  ): boolean {
    const key = this.getKey(portalId, moduleId, instanceId);
    return this.instances.has(key);
  }

  /**
   * Get instance statistics
   *
   * @returns Statistics about instances
   */
  getStats() {
    const allInstances = Array.from(this.instances.values());

    // Count instances per portal
    const byPortal: Record<string, number> = {};
    // Count instances per module
    const byModule: Record<string, number> = {};

    for (const instance of allInstances) {
      byPortal[instance.portalId] = (byPortal[instance.portalId] || 0) + 1;
      byModule[instance.moduleId] = (byModule[instance.moduleId] || 0) + 1;
    }

    return {
      total: allInstances.length,
      byPortal,
      byModule,
    };
  }

  /**
   * Clear all instances
   *
   * Warning: This is primarily for testing purposes.
   * Should not be used in production code.
   */
  clear(): void {
    this.instances.clear();

    if (import.meta.env.DEV) {
      console.log('[InstanceManager] Cleared all instances');
    }
  }
}

/**
 * Singleton instance of InstanceManager
 * Exported as default for global access throughout the application
 *
 * Usage:
 * ```typescript
 * import instanceManager from '@/core/modules/InstanceManager';
 *
 * // Create instance
 * const instance = instanceManager.createInstance(
 *   'main',
 *   'chat',
 *   'support-chat',
 *   { theme: 'dark', maxMessages: 100 }
 * );
 *
 * // Get instance
 * const config = instanceManager.getInstance('main', 'chat', 'support-chat');
 *
 * // Update instance
 * instanceManager.updateInstance('main', 'chat', 'support-chat', {
 *   theme: 'light',
 *   maxMessages: 200
 * });
 *
 * // List instances
 * const instances = instanceManager.listInstances('main', 'chat');
 *
 * // Delete instance
 * instanceManager.deleteInstance('main', 'chat', 'support-chat');
 * ```
 */
const instanceManager = new InstanceManager();

export default instanceManager;
