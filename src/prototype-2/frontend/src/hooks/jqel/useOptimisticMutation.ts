import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, QueryKey } from '@tanstack/react-query';
import type { OptimisticMutationOptions, OptimisticContext } from '../../types/optimistic';
import { snapshotQueryData, updateQueryData, rollbackQueryData } from './optimisticHelpers';

/**
 * Hook for mutations with optimistic updates
 *
 * Automatically handles:
 * - Canceling in-flight queries to prevent race conditions
 * - Snapshotting current cache data before update
 * - Applying optimistic update to cache
 * - Rolling back on error
 * - Invalidating queries after mutation settles
 *
 * @example
 * ```typescript
 * const updatePortal = useOptimisticMutation({
 *   mutationFn: (data) => jqelQuery({
 *     schema: 'backend',
 *     mutate: 'portal',
 *     action: 'update',
 *     values: data
 *   }),
 *   optimistic: {
 *     queryKeys: ['backend', 'portal'],
 *     updater: (portals, newData) =>
 *       portals.map(p => p.portalId === newData.portalId
 *         ? { ...p, ...newData }
 *         : p
 *       )
 *   }
 * });
 * ```
 */
export function useOptimisticMutation<
  TData = unknown,
  TVariables = void,
  TError = Error,
  TCacheData = unknown
>(
  options: OptimisticMutationOptions<TData, TVariables, TError, TCacheData>
): UseMutationResult<TData, TError, TVariables, OptimisticContext<TCacheData>> {
  const queryClient = useQueryClient();

  const {
    mutationFn,
    optimistic,
    onSuccess,
    onError,
  } = options;

  return useMutation<TData, TError, TVariables, OptimisticContext<TCacheData>>({
    mutationFn,

    onMutate: async (variables: TVariables): Promise<OptimisticContext<TCacheData>> => {
      if (!optimistic) {
        return { previous: undefined, queryKey: [] };
      }

      const { queryKeys, updater } = optimistic;
      const keys = Array.isArray(queryKeys[0]) ? queryKeys : [queryKeys];

      // Cancel outgoing queries to prevent race conditions
      await Promise.all(
        keys.map(key => queryClient.cancelQueries({ queryKey: key as QueryKey }))
      );

      // Snapshot current data for rollback
      const snapshots = keys.map(key => ({
        key: key as QueryKey,
        data: snapshotQueryData<TCacheData>(queryClient, key as QueryKey)
      }));

      // Apply optimistic update to each query key
      keys.forEach(key => {
        updateQueryData<TCacheData>(
          queryClient,
          key as QueryKey,
          (old) => updater(old, variables)
        );
      });

      // Return context with first snapshot (for backward compatibility)
      return {
        previous: snapshots[0]?.data,
        queryKey: snapshots[0]?.key || [],
        // Store all snapshots for multiple keys
        _snapshots: snapshots
      } as OptimisticContext<TCacheData>;
    },

    onError: (error: TError, variables: TVariables, context?: OptimisticContext<TCacheData>) => {
      // Rollback optimistic updates
      if (context && optimistic) {
        // Rollback all updated queries
        if ('_snapshots' in context) {
          const snapshots = (context as any)._snapshots as Array<{
            key: QueryKey;
            data: TCacheData | undefined;
          }>;
          snapshots.forEach(({ key, data }) => {
            rollbackQueryData(queryClient, key, data);
          });
        } else {
          // Fallback to single rollback
          rollbackQueryData(queryClient, context.queryKey, context.previous);
        }
      }

      // Call user-provided error handler
      onError?.(error, variables);
    },

    onSuccess: (data: TData, variables: TVariables) => {
      // Call user-provided success handler
      onSuccess?.(data, variables);
    },

    onSettled: () => {
      // Invalidate and refetch to sync with server
      if (optimistic && optimistic.invalidateOnSettled !== false) {
        const { queryKeys } = optimistic;
        const keys = Array.isArray(queryKeys[0]) ? queryKeys : [queryKeys];

        keys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key as QueryKey });
        });
      }
    }
  });
}
