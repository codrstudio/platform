/**
 * Instance Management Hooks
 *
 * React hooks for managing module instances.
 *
 * References:
 * - SPEC-concepts.md (SPEC-C-I-*)
 * - SPEC-modules.md (SPEC-MO-IN-*)
 *
 * Story 1.5.5: Configure module instances
 */

import { useState, useEffect, useCallback } from 'react';
import type { InstanceConfig } from '../types/module';
import instanceManager from '../core/modules/InstanceManager';

/**
 * Hook to get a specific instance
 *
 * @param portalId - Portal ID
 * @param moduleId - Module ID
 * @param instanceId - Instance ID
 * @returns Instance configuration or undefined
 *
 * SPEC-C-I-015: Configurations accessed via JQEL (this is in-memory)
 * SPEC-MO-IN-010: Module provides hook for instance config access
 */
export function useInstance(
  portalId: string,
  moduleId: string,
  instanceId: string
): InstanceConfig | undefined {
  const [instance, setInstance] = useState<InstanceConfig | undefined>(() =>
    instanceManager.getInstance(portalId, moduleId, instanceId)
  );

  useEffect(() => {
    // Update instance when dependencies change
    const updated = instanceManager.getInstance(portalId, moduleId, instanceId);
    setInstance(updated);
  }, [portalId, moduleId, instanceId]);

  return instance;
}

/**
 * Hook to get all instances for a module in a portal
 *
 * @param portalId - Portal ID
 * @param moduleId - Module ID
 * @returns Array of instances
 *
 * SPEC-C-I-006: Module can have zero or more instances
 * SPEC-C-I-007: No limit on number of instances
 */
export function useInstances(
  portalId: string,
  moduleId: string
): InstanceConfig[] {
  const [instances, setInstances] = useState<InstanceConfig[]>(() =>
    instanceManager.listInstances(portalId, moduleId)
  );

  useEffect(() => {
    // Update instances when dependencies change
    const updated = instanceManager.listInstances(portalId, moduleId);
    setInstances(updated);
  }, [portalId, moduleId]);

  return instances;
}

/**
 * Hook for creating instances with state management
 *
 * @returns Object with createInstance function and state
 *
 * SPEC-C-I-001: Instances only from active modules
 * SPEC-C-I-002: Unique instanceId within portal
 */
export function useCreateInstance() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInstance = useCallback(
    async (
      portalId: string,
      moduleId: string,
      instanceId: string,
      config: Record<string, unknown> = {}
    ): Promise<InstanceConfig | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const instance = instanceManager.createInstance(
          portalId,
          moduleId,
          instanceId,
          config
        );
        setIsCreating(false);
        return instance;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsCreating(false);
        return null;
      }
    },
    []
  );

  return {
    createInstance,
    isCreating,
    error,
  };
}

/**
 * Hook for updating instances with state management
 *
 * @returns Object with updateInstance function and state
 *
 * SPEC-C-I-020: Instances can be edited without deactivating module
 */
export function useUpdateInstance() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateInstance = useCallback(
    async (
      portalId: string,
      moduleId: string,
      instanceId: string,
      config: Record<string, unknown>
    ): Promise<InstanceConfig | null> => {
      setIsUpdating(true);
      setError(null);

      try {
        const instance = instanceManager.updateInstance(
          portalId,
          moduleId,
          instanceId,
          config
        );
        setIsUpdating(false);
        return instance;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsUpdating(false);
        return null;
      }
    },
    []
  );

  return {
    updateInstance,
    isUpdating,
    error,
  };
}

/**
 * Hook for deleting instances with state management
 *
 * @returns Object with deleteInstance function and state
 *
 * SPEC-C-I-021: Instances can be removed without deactivating module
 * SPEC-C-R-007: Removal of instance does not affect module
 */
export function useDeleteInstance() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteInstance = useCallback(
    async (
      portalId: string,
      moduleId: string,
      instanceId: string
    ): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        const success = instanceManager.deleteInstance(
          portalId,
          moduleId,
          instanceId
        );
        setIsDeleting(false);
        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsDeleting(false);
        return false;
      }
    },
    []
  );

  return {
    deleteInstance,
    isDeleting,
    error,
  };
}

/**
 * Combined hook for full instance management
 *
 * Provides all CRUD operations in a single hook
 *
 * @param portalId - Portal ID
 * @param moduleId - Module ID
 * @returns Object with instances and CRUD operations
 */
export function useInstanceManager(portalId: string, moduleId: string) {
  const instances = useInstances(portalId, moduleId);
  const { createInstance, isCreating, error: createError } = useCreateInstance();
  const { updateInstance, isUpdating, error: updateError } = useUpdateInstance();
  const { deleteInstance, isDeleting, error: deleteError } = useDeleteInstance();

  return {
    instances,
    createInstance,
    updateInstance,
    deleteInstance,
    isCreating,
    isUpdating,
    isDeleting,
    error: createError || updateError || deleteError,
  };
}
