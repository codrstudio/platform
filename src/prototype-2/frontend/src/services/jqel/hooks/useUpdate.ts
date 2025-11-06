// File: frontend/src/services/jqel/hooks/useUpdate.ts
// Update record hook

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { updateRecord } from '../mutations';
import { invalidateAfterMutation } from '../invalidation';
import type { UpdateVariables, MutationQueryOptions } from '../../../types/jqel';

/**
 * Update Record Hook
 *
 * SPEC References:
 * - SPEC-DA-MU-001:004: useMutation for UPDATE
 * - SPEC-JQEL-MUT-004: UPDATE action requires WHERE
 * - SPEC-DA-IN-001:008: Automatic cache invalidation (Task 1.4.9)
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Query options and mutation callbacks
 * @returns TanStack Query mutation result
 *
 * @example
 * ```typescript
 * const updatePortal = useUpdate<Portal>('backend', 'portal');
 *
 * updatePortal.mutate(
 *   {
 *     where: { portalId: { $eq: 'main' } },
 *     values: { name: 'Updated Name' }
 *   },
 *   {
 *     onSuccess: (portal) => console.log('Updated:', portal)
 *   }
 * );
 * ```
 */
export function useUpdate<TData = unknown>(
  schema: string,
  entity: string,
  options?: MutationQueryOptions
): UseMutationResult<TData, Error, UpdateVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, UpdateVariables>({
    mutationFn: async (variables: UpdateVariables) => {
      return updateRecord<TData>(
        schema,
        entity,
        variables.where,
        variables.values,
        options
      );
    },
    onSuccess: (_data, variables) => {
      // SPEC-DA-MU-005:008: Invalidate related queries using smart invalidation
      invalidateAfterMutation(
        queryClient,
        {
          schema,
          mutate: entity,
          action: 'update',
          where: variables.where
        },
        { scope: 'specific' } // UPDATE tries to invalidate specific record + entity
      );
    },
  });
}
