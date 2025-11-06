// File: frontend/src/services/jqel/hooks/useInsert.ts
// Insert record hook

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { insertRecord } from '../mutations';
import { invalidateAfterMutation } from '../invalidation';
import type { InsertVariables, MutationQueryOptions } from '../../../types/jqel';

/**
 * Insert Record Hook
 *
 * SPEC References:
 * - SPEC-DA-MU-001:004: useMutation for INSERT
 * - SPEC-JQEL-MUT-004: INSERT action requirements
 * - SPEC-DA-IN-001:008: Automatic cache invalidation (Task 1.4.9)
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Query options and mutation callbacks
 * @returns TanStack Query mutation result
 *
 * @example
 * ```typescript
 * const createPortal = useInsert<Portal>('backend', 'portal', {
 *   output: ['portalId', 'name', 'path']
 * });
 *
 * createPortal.mutate(
 *   { values: { name: 'New Portal', path: '/new' } },
 *   {
 *     onSuccess: (portal) => console.log('Created:', portal),
 *     onError: (error) => console.error(error)
 *   }
 * );
 * ```
 */
export function useInsert<TData = unknown>(
  schema: string,
  entity: string,
  options?: MutationQueryOptions
): UseMutationResult<TData, Error, InsertVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, InsertVariables>({
    mutationFn: async (variables: InsertVariables) => {
      return insertRecord<TData>(
        schema,
        entity,
        variables.values,
        options
      );
    },
    onSuccess: () => {
      // SPEC-DA-MU-005:008: Invalidate related queries using smart invalidation
      invalidateAfterMutation(
        queryClient,
        {
          schema,
          mutate: entity,
          action: 'insert'
        },
        { scope: 'entity' } // INSERT invalidates all lists
      );
    },
  });
}
