// useJQEL Hook - TanStack Query integration
// Based on SPEC-data-access.md (SPEC-DA-TQ-*)

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { jqelClient, queryKeys } from '@/services/jqelClient';
import type { JQELSelectQuery, JQELMutateQuery, JResult } from '@/types/jqel';

/**
 * useJQELQuery - SELECT queries
 *
 * SPEC-DA-TQ-001: SELECT uses useQuery
 * SPEC-DA-TQ-002: Query key is structured and unique
 * SPEC-DA-TQ-003: Query function calls jqel.query()
 */
export function useJQELQuery<T = unknown>(
  query: JQELSelectQuery,
  options?: Omit<UseQueryOptions<JResult<T>>, 'queryKey' | 'queryFn'>
) {
  // Generate query key (SPEC-DA-TQ-005 to SPEC-DA-TQ-008)
  const queryKey = queryKeys.select(
    query.schema,
    query.select,
    {
      ...(query.where && { where: query.where }),
      ...(query.options && { options: query.options }),
      ...(query.output && { output: query.output }),
      ...(query.except && { except: query.except }),
    }
  );

  return useQuery<JResult<T>>({
    queryKey,
    queryFn: () => jqelClient.query<T>(query),
    ...options,
  });
}

/**
 * useJQELMutation - INSERT/UPDATE/DELETE queries
 *
 * SPEC-DA-MU-001: MUTATE uses useMutation
 * SPEC-DA-MU-002: Mutation function calls jqel.query()
 */
export function useJQELMutation<T = unknown, TVariables = Partial<JQELMutateQuery>>(
  baseQuery: Omit<JQELMutateQuery, 'values' | 'where'>,
  options?: Omit<UseMutationOptions<JResult<T>, Error, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<JResult<T>, Error, TVariables>({
    mutationFn: (variables) =>
      jqelClient.query<T>({
        ...baseQuery,
        ...variables,
      } as JQELMutateQuery),
    onSuccess: (...args) => {
      // Invalidate related queries (SPEC-DA-MU-003)
      queryClient.invalidateQueries({
        queryKey: [baseQuery.schema, baseQuery.mutate],
      });

      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Convenience hooks for common operations
 */

/**
 * useJQELList - Fetch a list of entities
 */
export function useJQELList<T = unknown>(
  schema: string,
  entity: string,
  where?: JQELSelectQuery['where'],
  options?: Omit<UseQueryOptions<JResult<T[]>>, 'queryKey' | 'queryFn'>
) {
  return useJQELQuery<T[]>(
    {
      schema,
      select: entity,
      ...(where && { where }),
    },
    options
  );
}

/**
 * useJQELDetail - Fetch a single entity by ID
 */
export function useJQELDetail<T = unknown>(
  schema: string,
  entity: string,
  id: string | number,
  options?: Omit<UseQueryOptions<JResult<T>>, 'queryKey' | 'queryFn'>
) {
  return useJQELQuery<T>(
    {
      schema,
      select: entity,
      where: { id: { $eq: id } },
    },
    {
      enabled: !!id,
      ...options,
    }
  );
}

/**
 * useJQELInsert - Insert mutation
 */
export function useJQELInsert<T = unknown>(
  schema: string,
  entity: string,
  options?: UseMutationOptions<JResult<T>, Error, { values: Record<string, unknown> }>
) {
  return useJQELMutation<T, { values: Record<string, unknown> }>(
    {
      schema,
      mutate: entity,
      action: 'insert',
    },
    options
  );
}

/**
 * useJQELUpdate - Update mutation
 */
export function useJQELUpdate<T = unknown>(
  schema: string,
  entity: string,
  options?: UseMutationOptions<
    JResult<T>,
    Error,
    { values: Record<string, unknown>; where: JQELMutateQuery['where'] }
  >
) {
  return useJQELMutation<T, { values: Record<string, unknown>; where: JQELMutateQuery['where'] }>(
    {
      schema,
      mutate: entity,
      action: 'update',
    },
    options
  );
}

/**
 * useJQELDelete - Delete mutation
 */
export function useJQELDelete<T = unknown>(
  schema: string,
  entity: string,
  options?: UseMutationOptions<JResult<T>, Error, { where: JQELMutateQuery['where'] }>
) {
  return useJQELMutation<T, { where: JQELMutateQuery['where'] }>(
    {
      schema,
      mutate: entity,
      action: 'delete',
    },
    options
  );
}
