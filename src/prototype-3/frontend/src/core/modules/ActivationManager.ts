/**
 * Activation Manager
 *
 * Manages module activation and deactivation in portals with dependency validation.
 * Provides runtime activation/deactivation capabilities with dependency checking.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-009 to SPEC-MO-LC-017)
 * - SPEC-module-loading.md (SPEC-LOAD-D-*)
 *
 * Story: Activate and deactivate modules
 */

import type { ModuleActivation } from '../../types/module';
import moduleRegistry from './ModuleRegistry';
import dependencyManager from './DependencyManager';
import moduleLoader from './ModuleLoader';

/**
 * Activation result
 */
export interface ActivationResult {
  /** Whether activation was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Modules that were activated (including dependencies) */
  activated?: string[];
}

/**
 * Deactivation result
 */
export interface DeactivationResult {
  /** Whether deactivation was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Dependent modules that need to be deactivated first */
  dependents?: string[];
}

/**
 * ActivationManager - Manages module activation state per portal
 *
 * Design principles:
 * - SPEC-MO-LC-009: Module activated in runtime downloads immediately
 * - SPEC-MO-LC-010: Download happens in background (non-blocking)
 * - SPEC-MO-LC-011: After loading, routes available
 * - SPEC-MO-LC-012: Components available
 * - SPEC-MO-LC-013: No page reload needed
 * - SPEC-MO-LC-014: Deactivated module not removed from memory until refresh
 * - SPEC-MO-LC-015: Routes stop working after deactivation
 * - SPEC-MO-LC-016: Instances deactivated
 * - SPEC-MO-LC-017: After refresh, module not loaded
 * - SPEC-MO-DE-005: Platform validates dependencies when activating
 * - SPEC-MO-DE-006: Dependencies must be active in same portal
 * - SPEC-MO-DE-007: Auto-activate dependencies if not active
 * - SPEC-MO-DE-010: To deactivate, all dependents must be deactivated first
 * - SPEC-MO-DE-011: Platform lists dependents when attempting deactivation
 *
 * Portal-scoped activation: Same module can be active in one portal and inactive in another
 */
class ActivationManager {
  /**
   * Activation state storage
   * Key: `${portalId}:${moduleId}`
   * Value: ModuleActivation
   */
  private activationState: Map<string, ModuleActivation> = new Map();

  /**
   * Generate cache key for portal-module pair
   */
  private getCacheKey(portalId: string, moduleId: string): string {
    return `${portalId}:${moduleId}`;
  }

  /**
   * Activate a module in a portal
   *
   * Loads the module and its dependencies, then marks as active.
   * If module is already active, does nothing.
   *
   * @param portalId - Portal to activate module in
   * @param moduleId - Module to activate
   * @returns ActivationResult with success status and activated modules
   *
   * SPEC-MO-LC-009: Module activated in runtime downloads immediately
   * SPEC-MO-LC-010: Download in background (non-blocking)
   * SPEC-MO-LC-011: Routes available after loading
   * SPEC-MO-LC-012: Components available after loading
   * SPEC-MO-LC-013: No page reload needed
   * SPEC-MO-DE-005: Validates dependencies when activating
   * SPEC-MO-DE-006: Dependencies must be active in same portal
   * SPEC-MO-DE-007: Auto-activates dependencies
   */
  async activateModule(portalId: string, moduleId: string): Promise<ActivationResult> {
    if (import.meta.env.DEV) {
      console.log(`[ActivationManager] Activating module "${moduleId}" in portal "${portalId}"`);
    }

    // Check if already active
    if (this.isActive(portalId, moduleId)) {
      if (import.meta.env.DEV) {
        console.log(`[ActivationManager] Module "${moduleId}" already active in portal "${portalId}"`);
      }
      return {
        success: true,
        activated: [moduleId],
      };
    }

    // Validate dependencies
    const validation = this.validateActivation(portalId, moduleId);
    if (!validation.canActivate) {
      return {
        success: false,
        error: validation.error || 'Cannot activate module: validation failed',
      };
    }

    try {
      // Track which modules we're activating
      const activatedModules: string[] = [];

      // Load module (this also loads dependencies via ModuleLoader)
      // SPEC-MO-DE-007: Auto-activate dependencies if not active
      const moduleExports = await moduleLoader.loadModule(moduleId);

      // Get dependencies that were loaded
      const deps = moduleExports.manifest.dependencies || [];

      // Mark dependencies as active in this portal
      // SPEC-MO-DE-006: Dependencies must be active in same portal
      for (const depId of deps) {
        if (!this.isActive(portalId, depId)) {
          const key = this.getCacheKey(portalId, depId);
          this.activationState.set(key, {
            moduleId: depId,
            portalId,
            active: true,
            activatedAt: new Date().toISOString(),
          });
          activatedModules.push(depId);

          if (import.meta.env.DEV) {
            console.log(`[ActivationManager] Auto-activated dependency "${depId}" in portal "${portalId}"`);
          }
        }
      }

      // Mark target module as active
      const key = this.getCacheKey(portalId, moduleId);
      this.activationState.set(key, {
        moduleId,
        portalId,
        active: true,
        activatedAt: new Date().toISOString(),
      });
      activatedModules.push(moduleId);

      if (import.meta.env.DEV) {
        console.log(
          `[ActivationManager] Successfully activated "${moduleId}" in portal "${portalId}"`,
          { activated: activatedModules }
        );
      }

      // SPEC-MO-LC-011: Routes now available
      // SPEC-MO-LC-012: Components now available
      // SPEC-MO-LC-013: No page reload needed

      return {
        success: true,
        activated: activatedModules,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      console.error(`[ActivationManager] Failed to activate "${moduleId}":`, errorMsg);

      return {
        success: false,
        error: `Failed to activate module: ${errorMsg}`,
      };
    }
  }

  /**
   * Deactivate a module in a portal
   *
   * Marks module as inactive. Module code stays in memory until page refresh.
   * Checks for dependent modules that need to be deactivated first.
   *
   * @param portalId - Portal to deactivate module in
   * @param moduleId - Module to deactivate
   * @param force - Force deactivation even if dependents exist
   * @returns DeactivationResult with success status
   *
   * SPEC-MO-LC-014: Module not removed from memory until refresh
   * SPEC-MO-LC-015: Routes stop working after deactivation
   * SPEC-MO-LC-016: Instances deactivated
   * SPEC-MO-LC-017: After refresh, module not loaded
   * SPEC-MO-DE-010: To deactivate, all dependents must be deactivated first
   * SPEC-MO-DE-011: Lists dependents when attempting deactivation
   */
  async deactivateModule(
    portalId: string,
    moduleId: string,
    force = false
  ): Promise<DeactivationResult> {
    if (import.meta.env.DEV) {
      console.log(`[ActivationManager] Deactivating module "${moduleId}" in portal "${portalId}"`);
    }

    // Check if already inactive
    if (!this.isActive(portalId, moduleId)) {
      if (import.meta.env.DEV) {
        console.log(`[ActivationManager] Module "${moduleId}" already inactive in portal "${portalId}"`);
      }
      return { success: true };
    }

    // Check for active dependents in this portal
    // SPEC-MO-DE-010: All dependents must be deactivated first
    // SPEC-MO-DE-011: List dependents when attempting deactivation
    const activeDependents = this.getActiveDependents(portalId, moduleId);

    if (activeDependents.length > 0 && !force) {
      if (import.meta.env.DEV) {
        console.log(
          `[ActivationManager] Cannot deactivate "${moduleId}": active dependents exist`,
          activeDependents
        );
      }
      return {
        success: false,
        error: `Cannot deactivate: ${activeDependents.length} module(s) depend on this module`,
        dependents: activeDependents,
      };
    }

    // Mark as inactive
    const key = this.getCacheKey(portalId, moduleId);
    const activation = this.activationState.get(key);

    if (activation) {
      activation.active = false;
      this.activationState.set(key, activation);
    }

    if (import.meta.env.DEV) {
      console.log(`[ActivationManager] Successfully deactivated "${moduleId}" in portal "${portalId}"`);
      console.log(`[ActivationManager] Note: Module remains in memory until page refresh`);
    }

    // SPEC-MO-LC-014: Module not removed from memory until refresh
    // SPEC-MO-LC-015: Routes stop working (handled by router)
    // SPEC-MO-LC-016: Instances deactivated (handled by instance manager)
    // SPEC-MO-LC-017: After refresh, module not loaded

    return { success: true };
  }

  /**
   * Check if a module is active in a portal
   *
   * @param portalId - Portal to check
   * @param moduleId - Module to check
   * @returns True if module is active in portal
   */
  isActive(portalId: string, moduleId: string): boolean {
    const key = this.getCacheKey(portalId, moduleId);
    const activation = this.activationState.get(key);
    return activation?.active === true;
  }

  /**
   * Get all active modules in a portal
   *
   * @param portalId - Portal to query
   * @returns Array of active module IDs
   */
  getActiveModules(portalId: string): string[] {
    const activeModules: string[] = [];

    for (const activation of this.activationState.values()) {
      if (activation.portalId === portalId && activation.active) {
        activeModules.push(activation.moduleId);
      }
    }

    return activeModules;
  }

  /**
   * Get active dependents of a module in a portal
   *
   * Returns modules that are active in the portal and depend on the given module.
   *
   * @param portalId - Portal to check
   * @param moduleId - Module to find dependents for
   * @returns Array of active dependent module IDs
   *
   * SPEC-MO-DE-011: Platform lists dependents when attempting deactivation
   */
  getActiveDependents(portalId: string, moduleId: string): string[] {
    // Get all possible dependents (from registry)
    const allDependents = dependencyManager.getDependents(moduleId);

    // Filter to only those active in this portal
    return allDependents.filter((depId) => this.isActive(portalId, depId));
  }

  /**
   * Validate whether a module can be activated in a portal
   *
   * Checks:
   * - Module exists in registry
   * - Dependencies are satisfied
   * - No circular dependencies
   *
   * @param portalId - Portal to activate in
   * @param moduleId - Module to activate
   * @returns Validation result with canActivate boolean and error message
   *
   * SPEC-MO-DE-005: Platform validates dependencies when activating
   * SPEC-MO-DE-008: Circular dependencies detected and rejected
   * SPEC-MO-DE-009: Missing dependencies prevent activation
   */
  validateActivation(
    _portalId: string,
    moduleId: string
  ): {
    canActivate: boolean;
    error?: string;
    missingDependencies?: string[];
    circularDependencies?: string[][];
  } {
    // Check if module exists
    if (!moduleRegistry.hasModule(moduleId)) {
      return {
        canActivate: false,
        error: `Module "${moduleId}" not found in registry`,
      };
    }

    // Validate dependencies
    if (!dependencyManager.validateDependencies(moduleId)) {
      const resolution = dependencyManager.resolveDependencies(moduleId);

      if (resolution.missing.length > 0) {
        // SPEC-MO-DE-009: Missing dependencies prevent activation
        return {
          canActivate: false,
          error: `Missing dependencies: ${resolution.missing.join(', ')}`,
          missingDependencies: resolution.missing,
        };
      }

      if (resolution.cycles.length > 0) {
        // SPEC-MO-DE-008: Circular dependencies rejected
        const cycleDesc = resolution.cycles.map((cycle) => cycle.join(' -> ')).join('; ');
        return {
          canActivate: false,
          error: `Circular dependencies detected: ${cycleDesc}`,
          circularDependencies: resolution.cycles,
        };
      }

      return {
        canActivate: false,
        error: 'Dependency validation failed',
      };
    }

    return { canActivate: true };
  }

  /**
   * Get activation state for a module in a portal
   *
   * @param portalId - Portal to check
   * @param moduleId - Module to check
   * @returns ModuleActivation or undefined if not tracked
   */
  getActivation(portalId: string, moduleId: string): ModuleActivation | undefined {
    const key = this.getCacheKey(portalId, moduleId);
    return this.activationState.get(key);
  }

  /**
   * Set activation state (for loading initial portal configuration)
   *
   * This is used when loading a portal's configuration from backend.
   * It sets the activation state without actually loading the modules.
   *
   * @param portalId - Portal ID
   * @param moduleIds - Array of module IDs to mark as active
   */
  setActiveModules(portalId: string, moduleIds: string[]): void {
    // Deactivate all modules in this portal first
    for (const [key, activation] of this.activationState) {
      if (activation.portalId === portalId) {
        activation.active = false;
        this.activationState.set(key, activation);
      }
    }

    // Activate specified modules
    for (const moduleId of moduleIds) {
      const key = this.getCacheKey(portalId, moduleId);
      this.activationState.set(key, {
        moduleId,
        portalId,
        active: true,
        activatedAt: new Date().toISOString(),
      });
    }

    if (import.meta.env.DEV) {
      console.log(`[ActivationManager] Set active modules for portal "${portalId}":`, moduleIds);
    }
  }

  /**
   * Get statistics about activation state
   *
   * @returns Stats object with counts
   */
  getStats() {
    let totalActive = 0;
    let totalInactive = 0;
    const portalCounts = new Map<string, { active: number; inactive: number }>();

    for (const activation of this.activationState.values()) {
      if (activation.active) {
        totalActive++;
      } else {
        totalInactive++;
      }

      const portalCount = portalCounts.get(activation.portalId) || {
        active: 0,
        inactive: 0,
      };

      if (activation.active) {
        portalCount.active++;
      } else {
        portalCount.inactive++;
      }

      portalCounts.set(activation.portalId, portalCount);
    }

    return {
      totalActive,
      totalInactive,
      total: this.activationState.size,
      byPortal: Object.fromEntries(portalCounts),
    };
  }

  /**
   * Clear activation state (primarily for testing)
   */
  clear(): void {
    this.activationState.clear();

    if (import.meta.env.DEV) {
      console.log('[ActivationManager] Cleared all activation state');
    }
  }
}

/**
 * Singleton instance of ActivationManager
 * Exported as default for global access throughout the application
 *
 * Usage:
 * ```typescript
 * import activationManager from '@/core/modules/ActivationManager';
 *
 * // Activate a module
 * const result = await activationManager.activateModule('main', 'chat');
 * if (result.success) {
 *   console.log('Activated:', result.activated);
 * }
 *
 * // Deactivate a module
 * const deactivated = await activationManager.deactivateModule('main', 'chat');
 * if (!deactivated.success) {
 *   console.log('Dependents:', deactivated.dependents);
 * }
 *
 * // Check if active
 * if (activationManager.isActive('main', 'chat')) {
 *   // Module is active
 * }
 * ```
 */
const activationManager = new ActivationManager();

export default activationManager;
