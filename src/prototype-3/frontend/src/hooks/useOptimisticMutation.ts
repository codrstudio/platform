/**
 * Optimistic Mutation Helpers
 *
 * Utilities for implementing optimistic updates with automatic rollback on errors.
 * Provides snapshot-based state management for mutations.
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-MU-009 to SPEC-DA-MU-012)
 */

import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { JResult } from '../types/jqel.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Snapshot of query data for rollback
 */
export interface QuerySnapshot {
  queryKey: QueryKey;
  data: any;
}

/**
 * Options for optimistic updates
 */
export interface OptimisticUpdateOptions {
  /**
   * Query key(s) to update optimistically
   */
  queryKeys: QueryKey | QueryKey[];

  /**
   * Function to generate new optimistic data
   */
  updater: (oldData: any) => any;

  /**
   * Whether to cancel in-flight queries before updating
   * Default: true
   * SPEC-DA-MU-012: Cancel queries in progress
   */
  cancelQueries?: boolean;
}

/**
 * Result of applying optimistic update
 */
export interface OptimisticUpdateResult {
  /**
   * Snapshots for rollback
   */
  snapshots: QuerySnapshot[];

  /**
   * Rollback function to restore previous state
   */
  rollback: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing optimistic updates with automatic rollback
 *
 * Provides utilities for:
 * - Taking snapshots of current data (SPEC-DA-MU-012)
 * - Applying optimistic updates (SPEC-DA-MU-010)
 * - Rolling back on errors (SPEC-DA-MU-011)
 *
 * @returns Optimistic update utilities
 *
 * @example
 * ```typescript
 * const { applyOptimisticUpdate } = useOptimisticMutation();
 *
 * const mutation = useMutation({
 *   mutationFn: createPortal,
 *   onMutate: async (newPortal) => {
 *     const { rollback } = await applyOptimisticUpdate({
 *       queryKeys: ['backend', 'portal'],
 *       updater: (old) => ({
 *         ...old,
 *         data: [...(old?.data || []), newPortal]
 *       })
 *     });
 *     return { rollback };
 *   },
 *   onError: (err, vars, context) => {
 *     context?.rollback();
 *   }
 * });
 * ```
 */
export function useOptimisticMutation() {
  const queryClient = useQueryClient();

  /**
   * Apply optimistic update to query cache
   *
   * SPEC-DA-MU-010: Update UI before response
   * SPEC-DA-MU-012: Take snapshot for rollback
   *
   * @param options - Optimistic update options
   * @returns Result with snapshots and rollback function
   */
  const applyOptimisticUpdate = async (
    options: OptimisticUpdateOptions
  ): Promise<OptimisticUpdateResult> => {
    const { queryKeys, updater, cancelQueries = true } = options;
    const keys = Array.isArray(queryKeys) ? queryKeys : [queryKeys];
    const snapshots: QuerySnapshot[] = [];

    for (const queryKey of keys) {
      // SPEC-DA-MU-012: Cancel outgoing queries
      if (cancelQueries) {
        await queryClient.cancelQueries({ queryKey });
      }

      // SPEC-DA-MU-012: Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);
      snapshots.push({
        queryKey,
        data: previousData,
      });

      // SPEC-DA-MU-010: Apply optimistic update
      queryClient.setQueryData(queryKey, updater);
    }

    // SPEC-DA-MU-011: Return rollback function
    const rollback = () => {
      for (const snapshot of snapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    };

    return { snapshots, rollback };
  };

  /**
   * Create optimistic insert updater
   *
   * Adds new item to a JResult data array
   *
   * @param newItem - Item to insert
   * @returns Updater function
   */
  const insertUpdater = <T>(newItem: T) => {
    return (old: JResult<T> | undefined): JResult<T> | undefined => {
      if (!old) return old;

      return {
        ...old,
        data: [...(old.data || []), newItem],
      };
    };
  };

  /**
   * Create optimistic update updater
   *
   * Updates existing item in JResult data array by matching ID
   *
   * @param updatedItem - Item with updated values (must include id)
   * @param idField - Name of ID field (default: 'id')
   * @returns Updater function
   */
  const updateUpdater = <T extends Record<string, any>>(
    updatedItem: T,
    idField: string = 'id'
  ) => {
    return (old: JResult<T> | undefined): JResult<T> | undefined => {
      if (!old?.data) return old;

      return {
        ...old,
        data: old.data.map((item) =>
          item[idField] === updatedItem[idField]
            ? { ...item, ...updatedItem }
            : item
        ),
      };
    };
  };

  /**
   * Create optimistic delete updater
   *
   * Removes item from JResult data array by ID
   *
   * @param id - ID of item to delete
   * @param idField - Name of ID field (default: 'id')
   * @returns Updater function
   */
  const deleteUpdater = <T extends Record<string, any>>(
    id: string | number,
    idField: string = 'id'
  ) => {
    return (old: JResult<T> | undefined): JResult<T> | undefined => {
      if (!old?.data) return old;

      return {
        ...old,
        data: old.data.filter((item) => item[idField] !== id),
      };
    };
  };

  return {
    applyOptimisticUpdate,
    insertUpdater,
    updateUpdater,
    deleteUpdater,
  };
}

// ============================================================================
// STANDALONE HELPERS
// ============================================================================

/**
 * Create a snapshot of current query data
 *
 * SPEC-DA-MU-012: Snapshot for rollback
 *
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key to snapshot
 * @returns Snapshot object
 */
export function createSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: QueryKey
): QuerySnapshot {
  return {
    queryKey,
    data: queryClient.getQueryData(queryKey),
  };
}

/**
 * Restore query data from snapshot
 *
 * SPEC-DA-MU-011: Rollback on error
 *
 * @param queryClient - TanStack Query client
 * @param snapshot - Snapshot to restore
 */
export function restoreSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: QuerySnapshot
): void {
  queryClient.setQueryData(snapshot.queryKey, snapshot.data);
}

/**
 * Restore multiple snapshots
 *
 * @param queryClient - TanStack Query client
 * @param snapshots - Array of snapshots to restore
 */
export function restoreSnapshots(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: QuerySnapshot[]
): void {
  for (const snapshot of snapshots) {
    restoreSnapshot(queryClient, snapshot);
  }
}
