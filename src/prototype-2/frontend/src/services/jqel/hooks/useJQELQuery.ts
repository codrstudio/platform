import { useQuery } from '@tanstack/react-query';
import type { JQELQuery } from '../../../types/jqel';
import { jqelQuery } from '../client';
import { jqelKeys } from '../queryKeys';
import type { UseJQELQueryOptions, UseJQELQueryResult } from './types';
import type { JQELError } from '../errors';

/**
 * Smart retry function - don't retry client errors
 * Based on SPEC-DA-ERR-004:005
 */
function shouldRetry(failureCount: number, error: JQELError): boolean {
  // Don't retry client errors (4xx) - they won't succeed
  if (error.code >= 400 && error.code < 500) {
    return false;
  }

  // Retry server errors (5xx) up to 3 times
  if (error.code >= 500) {
    return failureCount < 3;
  }

  // Default: retry up to 3 times
  return failureCount < 3;
}

/**
 * Calculate exponential backoff delay for retry attempts
 * Based on SPEC-DA-ERR-005 and AuthProvider pattern
 *
 * Formula: min(baseDelay * 2^attemptIndex, maxDelay)
 *
 * @param attemptIndex - 0-based retry attempt (0 = first retry, 1 = second retry, etc.)
 * @param _error - JQELError from failed query (currently unused, but available for future logic)
 * @returns Delay in milliseconds before next retry
 *
 * @example
 * calculateRetryDelay(0) // 1000ms (1 second)
 * calculateRetryDelay(1) // 2000ms (2 seconds)
 * calculateRetryDelay(2) // 4000ms (4 seconds)
 * calculateRetryDelay(10) // 30000ms (30 seconds - capped)
 */
function calculateRetryDelay(attemptIndex: number, _error: JQELError): number {
  const BASE_DELAY_MS = 1000; // 1 second base
  const MAX_DELAY_MS = 30000; // 30 second cap

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s (capped at 30s)
  const delay = BASE_DELAY_MS * Math.pow(2, attemptIndex);
  const cappedDelay = Math.min(delay, MAX_DELAY_MS);

  // Log retry delay in development
  if (import.meta.env.DEV) {
    console.log(`[JQEL Retry] Attempt ${attemptIndex + 1} will retry in ${cappedDelay}ms`);
  }

  return cappedDelay;
}

/**
 * Default options for JQEL queries
 * Based on SPEC-DA-PERF-003
 */
const DEFAULT_OPTIONS: Partial<UseJQELQueryOptions<any>> = {
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 10 * 60 * 1000,          // 10 minutes
  refetchOnWindowFocus: false,
  retry: shouldRetry,
  retryDelay: calculateRetryDelay, // Add exponential backoff
};

/**
 * Generate query key from JQEL query structure
 * Based on SPEC-DA-TQ-005:009
 */
function generateQueryKey(query: JQELQuery): readonly unknown[] {
  const { schema, select, mutate, where, options: queryOptions } = query;

  const entity = select || mutate;
  const baseKey = jqelKeys.entity(schema, entity!);

  // Add where clause if present (for list queries)
  if (where) {
    return [...baseKey, 'list', where] as const;
  }

  // Add options if present (for pagination/sorting)
  if (queryOptions) {
    return [...baseKey, 'list', queryOptions] as const;
  }

  // Base entity key (all records)
  return baseKey;
}

/**
 * Execute JQEL SELECT query with TanStack Query
 *
 * Based on SPEC-DA-TQ-001:015
 *
 * Automatic retry with exponential backoff (SPEC-DA-ERR-004:005):
 * - Client errors (4xx): No retry (won't succeed)
 * - Server errors (5xx): Retry up to 3 times with backoff (1s, 2s, 4s)
 * - Network errors: Retry up to 3 times with backoff
 * - Max delay capped at 30 seconds
 *
 * @example
 * // Basic usage (automatic retry on server errors)
 * const { data: portal, isLoading } = useJQELQuery<Portal>({
 *   schema: 'backend',
 *   select: 'portal',
 *   where: { portalId: { $eq: 'main' } },
 * }, {
 *   select: (data) => data[0], // Extract first item
 * });
 *
 * @example
 * // Disable retries for specific query
 * const { data, error } = useJQELQuery<User>({
 *   schema: 'platform',
 *   select: 'user',
 * }, {
 *   retry: false, // No retries
 * });
 *
 * @param query - JQEL query object
 * @param options - TanStack Query options (optional)
 */
export function useJQELQuery<T = any>(
  query: JQELQuery,
  options?: UseJQELQueryOptions<T>
): UseJQELQueryResult<T> {

  // Generate query key from query structure
  const queryKey = options?.queryKey || generateQueryKey(query);

  // Execute query with TanStack Query
  const result = useQuery<T[], JQELError>({
    queryKey,
    queryFn: () => jqelQuery<T>(query),
    ...DEFAULT_OPTIONS,
    ...options,
  });

  // Return simplified interface
  return {
    data: result.data?.[0] ?? null, // Extract first item by default
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error ?? null,
    refetch: result.refetch,
    isSuccess: result.isSuccess,
    isError: result.isError,
    isPending: result.isPending,
  };
}
