import type { QueryKey } from '@tanstack/react-query';

/**
 * Context object returned from onMutate callback
 * Contains snapshot of data before optimistic update
 */
export interface OptimisticContext<T = unknown> {
  previous: T | undefined;
  queryKey: QueryKey;
}

/**
 * Updater function type for cache updates
 * Takes old data and returns new data
 */
export type UpdaterFunction<T> = (old: T | undefined) => T;

/**
 * Configuration for optimistic updates
 */
export interface OptimisticConfig<TCacheData = unknown, TVariables = unknown> {
  /**
   * Query key(s) to update optimistically
   * Can be single key or array of keys
   */
  queryKeys: QueryKey | QueryKey[];

  /**
   * Function to apply optimistic update to cache
   * Receives current cache data and mutation variables
   */
  updater: (currentData: TCacheData | undefined, variables: TVariables) => TCacheData;

  /**
   * Whether to automatically invalidate queries after mutation settles
   * @default true
   */
  invalidateOnSettled?: boolean;
}

/**
 * Extended mutation options with optimistic update support
 * TData = mutation return type
 * TCacheData = cache data type (can be different, e.g., Portal vs Portal[])
 */
export interface OptimisticMutationOptions<TData, TVariables, TError = Error, TCacheData = unknown> {
  /**
   * Mutation function (required)
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Optimistic update configuration
   */
  optimistic?: OptimisticConfig<TCacheData, TVariables>;

  /**
   * Success callback (runs after successful mutation)
   */
  onSuccess?: (data: TData, variables: TVariables) => void;

  /**
   * Error callback (runs after failed mutation, after rollback)
   */
  onError?: (error: TError, variables: TVariables) => void;
}
