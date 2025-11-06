import { useOptimisticMutation } from './useOptimisticMutation';
import { updatePortal, createPortal, deletePortal } from '../../services/jqel/portalQueries';
import type { UpdatePortalVariables, CreatePortalVariables } from '../../services/jqel/portalQueries';
import type { Portal } from '../../types/portal';
import { addItemToList, updateItemInList, removeItemFromList } from './optimisticHelpers';

/**
 * Hook for updating portal with optimistic updates
 *
 * @example
 * ```typescript
 * const updatePortalMutation = useUpdatePortal();
 *
 * updatePortalMutation.mutate({
 *   portalId: 'main',
 *   name: 'New Name'
 * });
 * ```
 */
export function useUpdatePortal() {
  return useOptimisticMutation<Portal, UpdatePortalVariables, Error, Portal[]>({
    mutationFn: updatePortal,
    optimistic: {
      queryKeys: [
        ['backend', 'portal'],  // Invalidate list
        ['backend', 'portal', { portalId: undefined }]  // Will match specific queries
      ],
      updater: (portals: Portal[] | undefined, variables) => {
        if (!portals) return [] as Portal[];

        return updateItemInList(
          portals,
          variables.portalId,
          variables as Partial<Portal>,
          'portalId'
        );
      },
      invalidateOnSettled: true
    },
    onSuccess: (data) => {
      console.log('Portal updated:', data);
    },
    onError: (error) => {
      console.error('Failed to update portal:', error);
    }
  });
}

/**
 * Hook for creating portal with optimistic updates
 */
export function useCreatePortal() {
  return useOptimisticMutation<Portal, CreatePortalVariables, Error, Portal[]>({
    mutationFn: createPortal,
    optimistic: {
      queryKeys: ['backend', 'portal'],
      updater: (portals: Portal[] | undefined, variables) => {
        // Add temporary portal to list (server will provide final data)
        const tempPortal: Portal = {
          portalId: variables.portalId,
          name: variables.name,
          description: variables.description || '',
          path: variables.path,
          activeModules: variables.activeModules || [],
          settings: variables.settings || {},
          removable: variables.removable ?? true
        };

        return addItemToList(portals, tempPortal, 'end');
      },
      invalidateOnSettled: true
    }
  });
}

/**
 * Hook for deleting portal with optimistic updates
 */
export function useDeletePortal() {
  return useOptimisticMutation<void, string, Error, Portal[]>({
    mutationFn: deletePortal,
    optimistic: {
      queryKeys: ['backend', 'portal'],
      updater: (portals: Portal[] | undefined, portalId) => {
        if (!portals) return [] as Portal[];

        return removeItemFromList(portals, portalId, 'portalId');
      },
      invalidateOnSettled: true
    }
  });
}
