/**
 * JQEL React Hooks
 * Wrappers around TanStack Query for JQEL queries
 * SPEC-DA-TQ-* and SPEC-DA-MU-* compliance
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { jqel } from './jqel';
import { jqelKeys } from './jqelKeys';
import type { JQELQuery, JResult } from './types';
import { JQELError } from './jqelError';

/**
 * useJQEL Hook
 * Wrapper around useQuery for JQEL SELECT queries
 * SPEC-DA-TQ-001 to SPEC-DA-TQ-015
 *
 * @example
 * const { data, isLoading } = useJQEL({
 *   schema: 'backend',
 *   select: 'portal',
 *   where: { portalId: { eq: 'main' } }
 * });
 */
export function useJQEL<T = any>(
  queryObject: JQELQuery,
  options?: Omit<
    UseQueryOptions<JResult<T>, JQELError, JResult<T>>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<JResult<T>, JQELError> {
  // Generate query key from query object
  const queryKey = jqelKeys.fromQuery(queryObject);

  return useQuery<JResult<T>, JQELError>({
    queryKey,
    queryFn: () => jqel.query<T>(queryObject),
    ...options,
  });
}

/**
 * useJQELMutation Hook
 * Wrapper around useMutation for JQEL MUTATE queries
 * SPEC-DA-MU-001 to SPEC-DA-MU-010
 *
 * @example
 * const mutation = useJQELMutation();
 * mutation.mutate({
 *   schema: 'backend',
 *   mutate: 'portal',
 *   action: 'insert',
 *   values: { portalId: 'new', name: 'New Portal' }
 * });
 */
export function useJQELMutation<T = any, TVariables = JQELQuery>(
  options?: UseMutationOptions<JResult<T>, JQELError, TVariables>
): UseMutationResult<JResult<T>, JQELError, TVariables> {
  return useMutation<JResult<T>, JQELError, TVariables>({
    mutationFn: (variables: any) => jqel.query<T>(variables),
    ...options,
  });
}

/**
 * useJQELInvalidate Hook
 * Provides functions to invalidate JQEL queries
 *
 * @example
 * const invalidate = useJQELInvalidate();
 * invalidate.schema('backend');
 * invalidate.entity('backend', 'portal');
 */
export function useJQELInvalidate() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate all JQEL queries
     */
    all: () => {
      queryClient.invalidateQueries({ queryKey: jqelKeys.all() });
    },

    /**
     * Invalidate all queries for a schema
     */
    schema: (schema: string) => {
      queryClient.invalidateQueries({ queryKey: jqelKeys.schema(schema) });
    },

    /**
     * Invalidate all queries for an entity
     */
    entity: (schema: string, entity: string) => {
      queryClient.invalidateQueries({
        queryKey: jqelKeys.entity(schema, entity),
      });
    },

    /**
     * Invalidate specific query
     */
    query: (queryKey: readonly unknown[]) => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * useJQELPrefetch Hook
 * Prefetch JQEL queries
 *
 * @example
 * const prefetch = useJQELPrefetch();
 * prefetch({
 *   schema: 'backend',
 *   select: 'portal'
 * });
 */
export function useJQELPrefetch() {
  const queryClient = useQueryClient();

  return async <T = any>(queryObject: JQELQuery) => {
    const queryKey = jqelKeys.fromQuery(queryObject);

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => jqel.query<T>(queryObject),
    });
  };
}
