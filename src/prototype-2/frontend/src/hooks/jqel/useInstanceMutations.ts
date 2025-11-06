import { useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from './useOptimisticMutation';
import { insertRecord, updateRecord, deleteRecord } from '../../services/jqel/mutations';
import { queryKeys } from '../../services/jqel/queryKeys';
import type { Instance } from '../../types/module';

/**
 * Create new instance
 *
 * @example
 * const createInstance = useCreateInstance();
 * createInstance.mutate({ instanceId: 'setup-2', portalId: 'main', moduleId: 'setup', ... });
 */
export function useCreateInstance() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<Instance, Instance>({
    mutationFn: async (instance: Instance) => {
      return insertRecord<Instance>('backend', 'instance', instance as unknown as Record<string, unknown>);
    },
    onSuccess: (data) => {
      // Invalidate instance list + portal instances
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.instances(),
      });
      if (data?.portalId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.backend.instances(data.portalId),
        });
        // Also invalidate portal (since activeModules might change)
        queryClient.invalidateQueries({
          queryKey: queryKeys.backend.portal(data.portalId),
        });
      }
    },
  });
}

/**
 * Update existing instance
 *
 * @example
 * const updateInstance = useUpdateInstance();
 * updateInstance.mutate({ instanceId: 'setup-1', values: { config: { theme: 'dark' } } });
 */
export function useUpdateInstance() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<Instance, { instanceId: string; values: Partial<Instance> }>({
    mutationFn: async ({ instanceId, values }) => {
      return updateRecord<Instance>(
        'backend',
        'instance',
        { instanceId: { $eq: instanceId } },
        values as Record<string, unknown>
      );
    },
    onSuccess: (data, { instanceId }) => {
      // Invalidate specific instance + lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.instance(instanceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.instances(),
      });
      if (data?.portalId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.backend.instances(data.portalId),
        });
      }
    },
  });
}

/**
 * Delete instance
 *
 * @example
 * const deleteInstance = useDeleteInstance();
 * deleteInstance.mutate('setup-2');
 */
export function useDeleteInstance() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<Instance, string>({
    mutationFn: async (instanceId: string) => {
      return deleteRecord<Instance>(
        'backend',
        'instance',
        { instanceId: { $eq: instanceId } }
      );
    },
    onSuccess: () => {
      // Invalidate all instance queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.instances(),
      });
    },
  });
}
