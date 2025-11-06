import { useQueryClient } from '@tanstack/react-query';
import { useUpdateModule } from '../../../hooks/jqel/useModuleMutations';
import { useUpdatePortal } from '../../../hooks/jqel/usePortalMutations';
import { useDeleteInstance } from '../../../hooks/jqel/useInstanceMutations';
import { queryKeys } from '../../../services/jqel/queryKeys';
import { toast } from '../../../hooks/use-toast';
import type { Module } from '../../../types/module';
import type { Portal } from '../../../types/portal';
import type { Instance } from '../../../types/module';

export interface UseModuleDeactivationReturn {
  deactivateModule: (moduleId: string, portalId: string) => Promise<void>;
  checkDependents: (moduleId: string, portalId: string) => string[];
  isDeactivating: boolean;
  error: Error | null;
}

/**
 * Hook for deactivating a module from a portal
 *
 * Performs triple update:
 * 1. Removes moduleId from Portal.activeModules array
 * 2. Removes portalId from Module.portals array and updates Module.active flag
 * 3. Deletes all instances of the module in the portal
 *
 * Uses optimistic updates for immediate UI feedback with rollback on error.
 * Validates that no other active modules depend on the module being deactivated.
 *
 * @example
 * ```typescript
 * const { deactivateModule, checkDependents, isDeactivating } = useModuleDeactivation();
 *
 * const dependents = checkDependents('setup', 'main');
 * if (dependents.length > 0) {
 *   // Show blocking message
 * } else {
 *   await deactivateModule('setup', 'main');
 * }
 * ```
 */
export function useModuleDeactivation(): UseModuleDeactivationReturn {
  const queryClient = useQueryClient();
  const updateModule = useUpdateModule();
  const updatePortal = useUpdatePortal();
  const deleteInstance = useDeleteInstance();

  /**
   * Check if any active modules in the portal depend on the given module
   */
  const checkDependents = (moduleId: string, portalId: string): string[] => {
    const portal = queryClient.getQueryData<Portal>(
      queryKeys.backend.portal(portalId)
    );
    const allModules = queryClient.getQueryData<Module[]>(
      queryKeys.backend.modules()
    ) || [];

    if (!portal) return [];

    const dependentModules: string[] = [];

    portal.activeModules.forEach(activeModuleId => {
      if (activeModuleId === moduleId) return; // Skip self

      const activeModule = allModules.find(m => m.moduleId === activeModuleId);
      if (activeModule && activeModule.dependencies?.includes(moduleId)) {
        dependentModules.push(activeModule.name);
      }
    });

    return dependentModules;
  };

  const deactivateModule = async (moduleId: string, portalId: string) => {
    try {
      // 1. Validate no dependents
      const dependents = checkDependents(moduleId, portalId);
      if (dependents.length > 0) {
        toast({
          title: 'Cannot deactivate',
          description: `Other modules depend on this: ${dependents.join(', ')}`,
          variant: 'error',
          duration: 5000,
        });
        throw new Error('Module has dependents');
      }

      // 2. Get current portal data
      const portal = queryClient.getQueryData<Portal>(
        queryKeys.backend.portal(portalId)
      );
      if (!portal) {
        throw new Error('Portal not found');
      }

      // 3. Get current module data
      const module = queryClient.getQueryData<Module>(
        queryKeys.backend.module(moduleId)
      );
      if (!module) {
        throw new Error('Module not found');
      }

      // 4. Get instances to delete
      const allInstances = queryClient.getQueryData<Instance[]>(
        queryKeys.backend.instances(portalId, moduleId)
      ) || [];
      const instancesToDelete = allInstances.filter(
        i => i.portalId === portalId && i.moduleId === moduleId
      );

      // 5. Optimistic update: Portal (remove from activeModules)
      const newActiveModules = portal.activeModules.filter(id => id !== moduleId);
      queryClient.setQueryData<Portal>(
        queryKeys.backend.portal(portalId),
        { ...portal, activeModules: newActiveModules }
      );

      // 6. Optimistic update: Module (remove from portals, update active)
      const newPortals = (module.portals || []).filter(id => id !== portalId);
      const newActive = newPortals.length > 0; // Only active if in other portals
      queryClient.setQueryData<Module>(
        queryKeys.backend.module(moduleId),
        { ...module, portals: newPortals as any, active: newActive }
      );

      // 7. Execute mutations
      await updatePortal.mutateAsync({
        portalId,
        activeModules: newActiveModules,
      });

      await updateModule.mutateAsync({
        moduleId,
        values: {
          portals: newPortals as any,
          active: newActive,
        },
      });

      // 8. Delete instances
      for (const instance of instancesToDelete) {
        await deleteInstance.mutateAsync(instance.instanceId);
      }

      // 9. Success feedback
      toast({
        title: 'Module deactivated',
        description: `${module.name} removed from ${portal.name}. ${instancesToDelete.length} instance(s) deleted.`,
        variant: 'success',
        duration: 3000,
      });

      // 10. Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.portals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.modules() });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.instances(portalId) });

    } catch (error) {
      // Rollback optimistic updates
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.portal(portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.module(moduleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.instances(portalId, moduleId) });

      // Error feedback
      toast({
        title: 'Deactivation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
        duration: 5000,
      });

      throw error;
    }
  };

  return {
    deactivateModule,
    checkDependents,
    isDeactivating: updateModule.isPending || updatePortal.isPending || deleteInstance.isPending,
    error: (updateModule.error || updatePortal.error || deleteInstance.error) as Error | null,
  };
}
