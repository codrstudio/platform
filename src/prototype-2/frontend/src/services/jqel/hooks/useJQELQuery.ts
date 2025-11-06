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
 * Default options for JQEL queries
 * Based on SPEC-DA-PERF-003
 */
const DEFAULT_OPTIONS: Partial<UseJQELQueryOptions<any>> = {
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 10 * 60 * 1000,          // 10 minutes
  refetchOnWindowFocus: false,
  retry: shouldRetry,
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
 * @example
 * // Fetch single portal
 * const { data: portal, isLoading } = useJQELQuery<Portal>({
 *   schema: 'backend',
 *   select: 'portal',
 *   where: { portalId: { $eq: 'main' } },
 * }, {
 *   select: (data) => data[0], // Extract first item
 * });
 *
 * @example
 * // Fetch list of portals
 * const { data: portals, error } = useJQELQuery<Portal>({
 *   schema: 'backend',
 *   select: 'portal',
 *   output: ['portalId', 'name', 'activeModules'],
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
