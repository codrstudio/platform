import { useQueryClient } from '@tanstack/react-query';
import { useUpdateModule } from '../../../hooks/jqel/useModuleMutations';
import { useUpdatePortal } from '../../../hooks/jqel/usePortalMutations';
import { queryKeys } from '../../../services/jqel/queryKeys';
import { toast } from '../../../hooks/use-toast';
import type { Module } from '../../../types/module';
import type { Portal } from '../../../types/portal';

export interface UseModuleActivationReturn {
  activateModule: (moduleId: string, portalId: string) => Promise<void>;
  isActivating: boolean;
  error: Error | null;
}

/**
 * Hook for activating a module in a portal
 *
 * Performs dual update:
 * 1. Adds moduleId to Portal.activeModules array
 * 2. Adds portalId to Module.portals array and sets Module.active = true
 *
 * Uses optimistic updates for immediate UI feedback with rollback on error.
 *
 * @example
 * ```typescript
 * const { activateModule, isActivating } = useModuleActivation();
 *
 * await activateModule('setup', 'main');
 * ```
 */
export function useModuleActivation(): UseModuleActivationReturn {
  const queryClient = useQueryClient();
  const updateModule = useUpdateModule();
  const updatePortal = useUpdatePortal();

  const activateModule = async (moduleId: string, portalId: string) => {
    try {
      // 1. Get current portal data
      const portal = queryClient.getQueryData<Portal>(
        queryKeys.backend.portal(portalId)
      );
      if (!portal) {
        throw new Error('Portal not found');
      }

      // 2. Check if already active
      if (portal.activeModules.includes(moduleId)) {
        toast({
          title: 'Already active',
          description: 'This module is already active in the selected portal',
          variant: 'warning',
        });
        return;
      }

      // 3. Get current module data
      const module = queryClient.getQueryData<Module>(
        queryKeys.backend.module(moduleId)
      );
      if (!module) {
        throw new Error('Module not found');
      }

      // 4. Optimistic update: Portal
      const newActiveModules = [...portal.activeModules, moduleId];
      queryClient.setQueryData<Portal>(
        queryKeys.backend.portal(portalId),
        { ...portal, activeModules: newActiveModules }
      );

      // 5. Optimistic update: Module
      const currentPortals = Array.isArray(module.portals) ? module.portals : [];
      const newPortals = currentPortals.includes(portalId)
        ? currentPortals
        : [...currentPortals, portalId];

      queryClient.setQueryData<Module>(
        queryKeys.backend.module(moduleId),
        { ...module, portals: newPortals as any, active: true }
      );

      // 6. Execute mutations
      await updatePortal.mutateAsync({
        portalId,
        activeModules: newActiveModules,
      });

      await updateModule.mutateAsync({
        moduleId,
        values: {
          active: true,
        },
      });

      // 7. Success feedback
      toast({
        title: 'Module activated',
        description: `${module.name} is now active in ${portal.name}`,
        variant: 'success',
        duration: 3000,
      });

      // 8. Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.portals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.modules() });

    } catch (error) {
      // Rollback optimistic updates
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.portal(portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.module(moduleId) });

      // Error feedback
      toast({
        title: 'Activation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
        duration: 5000,
      });

      throw error;
    }
  };

  return {
    activateModule,
    isActivating: updateModule.isPending || updatePortal.isPending,
    error: (updateModule.error || updatePortal.error) as Error | null,
  };
}
