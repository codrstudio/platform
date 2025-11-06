import { useQueries } from '@tanstack/react-query';
import { jqelQuery } from '../client';
import type { JQELQueryConfig, UseJQELQueryResult } from './types';

/**
 * Generate query key from JQEL query structure
 * (Same implementation as useJQELQuery)
 */
function generateQueryKey(query: any): readonly unknown[] {
  const { schema, select, mutate, where, options } = query;
  const entity = select || mutate;

  if (where) return [schema, entity, 'list', where] as const;
  if (options) return [schema, entity, 'list', options] as const;
  return [schema, entity] as const;
}

/**
 * Execute multiple JQEL queries in parallel
 * Based on SPEC-DA-TQ-014:015 (dependent queries)
 *
 * @example
 * const [portalsResult, modulesResult] = useJQELQueries([
 *   {
 *     query: { schema: 'backend', select: 'portal' },
 *   },
 *   {
 *     query: { schema: 'backend', select: 'module' },
 *   },
 * ]);
 *
 * @param queries - Array of query configurations
 */
export function useJQELQueries<T = any>(
  queries: JQELQueryConfig<T>[]
): UseJQELQueryResult<T>[] {

  // Execute all queries in parallel with useQueries
  const results = useQueries({
    queries: queries.map(({ query, options }) => ({
      queryKey: generateQueryKey(query),
      queryFn: () => jqelQuery<T>(query),
      ...options,
    })),
  });

  // Transform to simplified interface
  return results.map(result => ({
    data: result.data?.[0] ?? null,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error ?? null,
    refetch: result.refetch,
    isSuccess: result.isSuccess,
    isError: result.isError,
    isPending: result.isPending,
  }));
}
