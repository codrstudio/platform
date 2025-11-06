/**
 * usePortalModules Hook
 *
 * Custom hook for managing portal module activation and status.
 * Combines portal data with module registry information to provide
 * a complete view of module activation state.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-FU-006:012)
 * - SPEC-modules.md (SPEC-MO-LC-009:017, SPEC-MO-DE-005:011)
 */

import { useCallback, useMemo } from 'react';
import { useJQELRecord } from '../../../hooks/useJQELQuery.js';
import { useUpdate } from '../../../hooks/useJQELMutation.js';
import type { Portal } from '../../../types/portal.js';
import type { Module } from '../../../types/module.js';
import moduleRegistry from '../../../core/modules/ModuleRegistry.js';
import activationManager from '../../../core/modules/ActivationManager.js';
import dependencyManager from '../../../core/modules/DependencyManager.js';

/**
 * Module with activation status
 */
export interface ModuleWithStatus extends Module {
  /** Whether module is active in the current portal */
  isActive: boolean;

  /** Whether module can be activated (dependencies satisfied) */
  canActivate: boolean;

  /** Modules that this module depends on */
  dependsOn: string[];

  /** Modules that depend on this module */
  dependedBy: string[];

  /** Missing dependencies (if any) */
  missingDependencies: string[];

  /** Active dependents in this portal (prevents deactivation) */
  activeDependents: string[];
}

/**
 * Hook return type
 */
export interface UsePortalModulesReturn {
  /** Portal data */
  portal: Portal | undefined;

  /** All modules with activation status */
  modules: ModuleWithStatus[];

  /** Active modules */
  activeModules: ModuleWithStatus[];

  /** Inactive modules */
  inactiveModules: ModuleWithStatus[];

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Activate a module in this portal */
  activateModule: (moduleId: string) => Promise<void>;

  /** Deactivate a module in this portal */
  deactivateModule: (moduleId: string) => Promise<void>;

  /** Check if module is active */
  isModuleActive: (moduleId: string) => boolean;

  /** Check if module can be activated */
  canModuleBeActivated: (moduleId: string) => boolean;

  /** Get active dependents for a module */
  getActiveDependents: (moduleId: string) => string[];
}

/**
 * usePortalModules Hook
 *
 * Manages module activation for a specific portal.
 *
 * SPEC-MS-FU-006: List modules available
 * SPEC-MS-FU-007: Activate module in portal
 * SPEC-MS-FU-008: Deactivate module from portal
 * SPEC-MS-FU-009: Show dependencies of modules
 * SPEC-MS-FU-010: Auto-activate dependencies
 * SPEC-MS-FU-011: Validate dependencies when deactivating
 * SPEC-MS-FU-012: List dependents when attempting deactivation
 *
 * @param portalId - Portal to manage modules for
 * @returns Portal module management interface
 *
 * @example
 * ```typescript
 * const { modules, activateModule, deactivateModule } = usePortalModules('main');
 *
 * // Activate a module (auto-activates dependencies)
 * await activateModule('chat');
 *
 * // Deactivate a module (checks for dependents)
 * await deactivateModule('app-components');
 * ```
 */
export function usePortalModules(portalId: string): UsePortalModulesReturn {
  // SPEC-MS-PE-009: Load portal configuration via JQEL
  const {
    data: portalResult,
    isLoading,
    error: queryError,
  } = useJQELRecord<Portal>('platform', 'portal', portalId);

  const portal = portalResult?.data?.[0];

  // SPEC-MS-PE-001: Save configurations via JQEL
  // SPEC-MS-PE-002: Use schema="platform" for portal/module/instance config
  const updatePortalMutation = useUpdate<Portal>('platform', 'portal', {
    invalidation: { scope: 'specific', recordId: portalId },
  });

  // Get all modules from registry
  // SPEC-MS-FU-006: List modules available
  const allModules = useMemo(() => moduleRegistry.getAllModules(), []);

  // Combine modules with activation status
  const modules = useMemo<ModuleWithStatus[]>(() => {
    if (!portal) return [];

    return allModules.map((module) => {
      const isActive = portal.activeModules.includes(module.id);
      const dependsOn = module.manifest.dependencies || [];
      const dependedBy = dependencyManager.getDependents(module.id);
      const activeDependents = dependedBy.filter((depId) =>
        portal.activeModules.includes(depId)
      );

      // SPEC-MS-VA-007: Dependencies must be active before activating module
      const validation = activationManager.validateActivation(portalId, module.id);
      const canActivate = validation.canActivate;
      const missingDependencies = validation.missingDependencies || [];

      return {
        ...module,
        isActive,
        canActivate,
        dependsOn,
        dependedBy,
        missingDependencies,
        activeDependents,
      };
    });
  }, [portal, allModules, portalId]);

  // Filter active and inactive modules
  const activeModules = useMemo(
    () => modules.filter((m) => m.isActive),
    [modules]
  );

  const inactiveModules = useMemo(
    () => modules.filter((m) => !m.isActive),
    [modules]
  );

  /**
   * Activate a module in this portal
   *
   * SPEC-MS-FU-007: Activate module in portal
   * SPEC-MS-FU-010: Auto-activate dependencies (with confirmation)
   * SPEC-MO-LC-009: Module activated in runtime downloads immediately
   * SPEC-MO-DE-007: Auto-activate dependencies if not active
   */
  const activateModule = useCallback(
    async (moduleId: string) => {
      if (!portal) {
        throw new Error('Portal not loaded');
      }

      // SPEC-MO-LC-009 to SPEC-MO-LC-013: Runtime activation via ActivationManager
      const result = await activationManager.activateModule(portalId, moduleId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to activate module');
      }

      // Update portal.activeModules array with all activated modules
      // SPEC-MS-FU-010: Dependencies activated automatically
      const newActiveModules = Array.from(
        new Set([...portal.activeModules, ...(result.activated || [])])
      );

      // SPEC-MS-PE-001: Save via JQEL mutation
      // SPEC-MS-PE-003: Mutate with appropriate action
      await updatePortalMutation.mutateAsync({
        id: portalId,
        activeModules: newActiveModules,
      });
    },
    [portal, portalId, updatePortalMutation]
  );

  /**
   * Deactivate a module in this portal
   *
   * SPEC-MS-FU-008: Deactivate module from portal
   * SPEC-MS-FU-011: Validate dependencies when deactivating
   * SPEC-MS-FU-012: List dependents when attempting deactivation
   * SPEC-MO-LC-015: Routes stop working after deactivation
   * SPEC-MO-DE-010: All dependents must be deactivated first
   */
  const deactivateModule = useCallback(
    async (moduleId: string) => {
      if (!portal) {
        throw new Error('Portal not loaded');
      }

      // SPEC-MO-LC-014 to SPEC-MO-LC-017: Runtime deactivation via ActivationManager
      // SPEC-MO-DE-010: Check for dependents before deactivating
      const result = await activationManager.deactivateModule(portalId, moduleId);

      if (!result.success) {
        // SPEC-MS-FU-012: Error includes list of dependents
        const message =
          result.error || 'Failed to deactivate module';
        const error = new Error(message);
        (error as any).dependents = result.dependents || [];
        throw error;
      }

      // Remove module from portal.activeModules array
      const newActiveModules = portal.activeModules.filter((id) => id !== moduleId);

      // SPEC-MS-PE-001: Save via JQEL mutation
      await updatePortalMutation.mutateAsync({
        id: portalId,
        activeModules: newActiveModules,
      });
    },
    [portal, portalId, updatePortalMutation]
  );

  /**
   * Check if module is active
   */
  const isModuleActive = useCallback(
    (moduleId: string): boolean => {
      return portal?.activeModules.includes(moduleId) ?? false;
    },
    [portal]
  );

  /**
   * Check if module can be activated
   *
   * SPEC-MS-VA-007: Dependencies must be active before activating
   */
  const canModuleBeActivated = useCallback(
    (moduleId: string): boolean => {
      const validation = activationManager.validateActivation(portalId, moduleId);
      return validation.canActivate;
    },
    [portalId]
  );

  /**
   * Get active dependents for a module
   *
   * SPEC-MS-FU-012: List dependents when attempting deactivation
   * SPEC-MO-DE-011: Platform lists dependents
   */
  const getActiveDependents = useCallback(
    (moduleId: string): string[] => {
      if (!portal) return [];

      const dependents = dependencyManager.getDependents(moduleId);
      return dependents.filter((depId) => portal.activeModules.includes(depId));
    },
    [portal]
  );

  return {
    portal,
    modules,
    activeModules,
    inactiveModules,
    isLoading,
    error: queryError || null,
    activateModule,
    deactivateModule,
    isModuleActive,
    canModuleBeActivated,
    getActiveDependents,
  };
}
