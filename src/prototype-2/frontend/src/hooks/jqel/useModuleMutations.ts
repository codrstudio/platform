import { useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from './useOptimisticMutation';
import { insertRecord, updateRecord, deleteRecord } from '../../services/jqel/mutations';
import { queryKeys } from '../../services/jqel/queryKeys';
import type { Module } from '../../types/module';

/**
 * Create new module
 *
 * @example
 * const createModule = useCreateModule();
 * createModule.mutate({ moduleId: 'dashboard', name: 'Dashboard', ... });
 */
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<Module, Module>({
    mutationFn: async (module: Module) => {
      return insertRecord<Module>('backend', 'module', module as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.modules(),
      });
    },
  });
}

/**
 * Update existing module
 *
 * @example
 * const updateModule = useUpdateModule();
 * updateModule.mutate({ moduleId: 'setup', values: { name: 'New Name' } });
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<Module, { moduleId: string; values: Partial<Module> }>({
    mutationFn: async ({ moduleId, values }) => {
      return updateRecord<Module>(
        'backend',
        'module',
        { moduleId: { $eq: moduleId } },
        values as Record<string, unknown>
      );
    },
    onSuccess: (_, { moduleId }) => {
      // Invalidate specific module + list
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.module(moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.modules(),
      });
    },
  });
}

/**
 * Delete module
 *
 * @example
 * const deleteModule = useDeleteModule();
 * deleteModule.mutate('dashboard');
 */
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useOptimisticMutation<Module, string>({
    mutationFn: async (moduleId: string) => {
      return deleteRecord<Module>(
        'backend',
        'module',
        { moduleId: { $eq: moduleId } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backend.modules(),
      });
    },
  });
}
