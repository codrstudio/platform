// File: frontend/src/services/jqel/hooks/useDelete.ts
// Delete record hook

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { deleteRecord } from '../mutations';
import { invalidateAfterMutation } from '../invalidation';
import type { DeleteVariables, MutationQueryOptions } from '../../../types/jqel';

/**
 * Delete Record Hook
 *
 * SPEC References:
 * - SPEC-DA-MU-001:004: useMutation for DELETE
 * - SPEC-JQEL-MUT-004: DELETE action requires WHERE
 * - SPEC-DA-IN-001:008: Automatic cache invalidation (Task 1.4.9)
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Query options and mutation callbacks
 * @returns TanStack Query mutation result
 *
 * @example
 * ```typescript
 * const deletePortal = useDelete<Portal>('backend', 'portal');
 *
 * deletePortal.mutate(
 *   { where: { portalId: { $eq: 'temp-portal' } } },
 *   {
 *     onSuccess: () => console.log('Deleted')
 *   }
 * );
 * ```
 */
export function useDelete<TData = unknown>(
  schema: string,
  entity: string,
  options?: MutationQueryOptions
): UseMutationResult<TData, Error, DeleteVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, DeleteVariables>({
    mutationFn: async (variables: DeleteVariables) => {
      return deleteRecord<TData>(
        schema,
        entity,
        variables.where,
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
          action: 'delete',
          where: variables.where
        },
        { scope: 'entity' } // DELETE invalidates all lists
      );
    },
  });
}
