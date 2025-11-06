import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Snapshot current query data from cache
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key to snapshot
 * @returns Current cache data or undefined
 */
export function snapshotQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey
): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Update query data in cache
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key to update
 * @param updater - Function to transform data
 */
export function updateQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (old: T | undefined) => T
): void {
  queryClient.setQueryData<T>(queryKey, updater);
}

/**
 * Rollback query data to previous snapshot
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key to rollback
 * @param snapshot - Previous data to restore
 */
export function rollbackQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  snapshot: T | undefined
): void {
  queryClient.setQueryData<T>(queryKey, snapshot);
}

/**
 * Add item to list optimistically
 * @param list - Current list or undefined
 * @param item - Item to add
 * @param position - 'start' or 'end' (default: 'end')
 * @returns Updated list
 */
export function addItemToList<T>(
  list: T[] | undefined,
  item: T,
  position: 'start' | 'end' = 'end'
): T[] {
  const currentList = list || [];
  return position === 'start'
    ? [item, ...currentList]
    : [...currentList, item];
}

/**
 * Update item in list by ID
 * @param list - Current list or undefined
 * @param id - ID of item to update
 * @param updates - Partial updates to apply
 * @param idKey - Key name for ID field (default: 'id')
 * @returns Updated list
 */
export function updateItemInList<T extends Record<string, any>>(
  list: T[] | undefined,
  id: string | number,
  updates: Partial<T>,
  idKey: string = 'id'
): T[] {
  const currentList = list || [];
  return currentList.map(item =>
    item[idKey] === id ? { ...item, ...updates } : item
  );
}

/**
 * Remove item from list by ID
 * @param list - Current list or undefined
 * @param id - ID of item to remove
 * @param idKey - Key name for ID field (default: 'id')
 * @returns Updated list
 */
export function removeItemFromList<T extends Record<string, any>>(
  list: T[] | undefined,
  id: string | number,
  idKey: string = 'id'
): T[] {
  const currentList = list || [];
  return currentList.filter(item => item[idKey] !== id);
}

/**
 * Update single item (not in list)
 * @param item - Current item or undefined
 * @param updates - Partial updates to apply
 * @returns Updated item
 */
export function updateSingleItem<T>(
  item: T | undefined,
  updates: Partial<T>
): T {
  if (!item) {
    return updates as T;
  }
  return { ...item, ...updates };
}
