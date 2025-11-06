/**
 * Module Activation Hooks
 *
 * React hooks for module activation state and operations.
 * Provides reactive access to activation state with loading and error handling.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-009 to SPEC-MO-LC-017)
 * - SPEC-module-loading.md (SPEC-LOAD-D-*)
 *
 * Story: Activate and deactivate modules
 */

import { useState, useCallback, useMemo } from 'react';
import activationManager from '../core/modules/ActivationManager';
import dependencyManager from '../core/modules/DependencyManager';

/**
 * Module activation state
 */
export interface ModuleActivationState {
  /** Whether module is active */
  isActive: boolean;

  /** Whether module can be activated (dependencies satisfied) */
  canActivate: boolean;

  /** Whether module can be deactivated (no active dependents) */
  canDeactivate: boolean;

  /** Active modules that depend on this module */
  dependents: string[];

  /** Missing dependencies preventing activation */
  missingDependencies: string[];

  /** Circular dependencies preventing activation */
  circularDependencies: string[][];

  /** Validation error message */
  validationError?: string;
}

/**
 * Hook for module activation state
 *
 * Provides reactive access to module activation status and validation.
 * Does not trigger re-renders automatically - use with other state management.
 *
 * @param portalId - Portal to check
 * @param moduleId - Module to check
 * @returns ModuleActivationState
 *
 * Example:
 * ```tsx
 * const state = useModuleActivation('main', 'chat');
 *
 * if (!state.canActivate) {
 *   return <div>Cannot activate: {state.validationError}</div>;
 * }
 *
 * if (state.dependents.length > 0) {
 *   return <div>Dependents: {state.dependents.join(', ')}</div>;
 * }
 * ```
 */
export function useModuleActivation(
  portalId: string,
  moduleId: string
): ModuleActivationState {
  // Check activation status
  const isActive = activationManager.isActive(portalId, moduleId);

  // Get active dependents
  const dependents = useMemo(
    () => activationManager.getActiveDependents(portalId, moduleId),
    [portalId, moduleId]
  );

  // Validate activation
  const validation = useMemo(
    () => activationManager.validateActivation(portalId, moduleId),
    [portalId, moduleId]
  );

  return {
    isActive,
    canActivate: validation.canActivate,
    canDeactivate: dependents.length === 0,
    dependents,
    missingDependencies: validation.missingDependencies || [],
    circularDependencies: validation.circularDependencies || [],
    validationError: validation.error,
  };
}

/**
 * Hook for getting all active modules in a portal
 *
 * @param portalId - Portal to query
 * @returns Array of active module IDs
 *
 * Example:
 * ```tsx
 * const activeModules = useActiveModules('main');
 *
 * return (
 *   <ul>
 *     {activeModules.map(moduleId => (
 *       <li key={moduleId}>{moduleId}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useActiveModules(portalId: string): string[] {
  return useMemo(
    () => activationManager.getActiveModules(portalId),
    [portalId]
  );
}

/**
 * Activate module mutation result
 */
export interface ActivateModuleMutation {
  /** Activate a module */
  activate: (portalId: string, moduleId: string) => Promise<void>;

  /** Whether activation is in progress */
  loading: boolean;

  /** Error from last activation attempt */
  error: string | null;

  /** Modules that were activated (including dependencies) */
  activated: string[];
}

/**
 * Hook for activating modules
 *
 * Provides mutation function with loading and error states.
 *
 * @returns ActivateModuleMutation
 *
 * Example:
 * ```tsx
 * const { activate, loading, error, activated } = useActivateModule();
 *
 * const handleActivate = async () => {
 *   await activate('main', 'chat');
 *   console.log('Activated:', activated);
 * };
 *
 * return (
 *   <button onClick={handleActivate} disabled={loading}>
 *     {loading ? 'Activating...' : 'Activate Chat'}
 *   </button>
 * );
 * ```
 */
export function useActivateModule(): ActivateModuleMutation {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activated, setActivated] = useState<string[]>([]);

  const activate = useCallback(async (portalId: string, moduleId: string) => {
    setLoading(true);
    setError(null);
    setActivated([]);

    try {
      // SPEC-MO-LC-010: Download happens in background (non-blocking UI)
      const result = await activationManager.activateModule(portalId, moduleId);

      if (result.success) {
        setActivated(result.activated || []);
      } else {
        setError(result.error || 'Failed to activate module');
        throw new Error(result.error || 'Failed to activate module');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activate,
    loading,
    error,
    activated,
  };
}

/**
 * Deactivate module mutation result
 */
export interface DeactivateModuleMutation {
  /** Deactivate a module */
  deactivate: (portalId: string, moduleId: string, force?: boolean) => Promise<void>;

  /** Whether deactivation is in progress */
  loading: boolean;

  /** Error from last deactivation attempt */
  error: string | null;

  /** Dependent modules that need deactivation first */
  dependents: string[];
}

/**
 * Hook for deactivating modules
 *
 * Provides mutation function with loading and error states.
 * Handles dependent module validation.
 *
 * @returns DeactivateModuleMutation
 *
 * Example:
 * ```tsx
 * const { deactivate, loading, error, dependents } = useDeactivateModule();
 *
 * const handleDeactivate = async () => {
 *   try {
 *     await deactivate('main', 'media-components');
 *   } catch (err) {
 *     if (dependents.length > 0) {
 *       console.log('Cannot deactivate: dependents exist', dependents);
 *     }
 *   }
 * };
 * ```
 */
export function useDeactivateModule(): DeactivateModuleMutation {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependents, setDependents] = useState<string[]>([]);

  const deactivate = useCallback(
    async (portalId: string, moduleId: string, force = false) => {
      setLoading(true);
      setError(null);
      setDependents([]);

      try {
        const result = await activationManager.deactivateModule(
          portalId,
          moduleId,
          force
        );

        if (result.success) {
          // Success
        } else {
          setError(result.error || 'Failed to deactivate module');
          setDependents(result.dependents || []);
          throw new Error(result.error || 'Failed to deactivate module');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    deactivate,
    loading,
    error,
    dependents,
  };
}

/**
 * Hook for module dependency information
 *
 * Returns dependency tree and dependent modules.
 *
 * @param moduleId - Module to analyze
 * @returns Dependency information
 *
 * Example:
 * ```tsx
 * const { dependencies, dependents, tree } = useModuleDependencies('chat');
 *
 * return (
 *   <div>
 *     <h3>Dependencies</h3>
 *     <ul>
 *       {dependencies.map(dep => <li key={dep}>{dep}</li>)}
 *     </ul>
 *
 *     <h3>Dependents</h3>
 *     <ul>
 *       {dependents.map(dep => <li key={dep}>{dep}</li>)}
 *     </ul>
 *   </div>
 * );
 * ```
 */
export function useModuleDependencies(moduleId: string) {
  const tree = useMemo(
    () => dependencyManager.getDependencyTree(moduleId),
    [moduleId]
  );

  const dependencies = useMemo(() => {
    if (!tree) return [];
    return tree.dependencies.map((dep) => dep.module);
  }, [tree]);

  const dependents = useMemo(
    () => dependencyManager.getDependents(moduleId),
    [moduleId]
  );

  return {
    dependencies,
    dependents,
    tree,
  };
}
