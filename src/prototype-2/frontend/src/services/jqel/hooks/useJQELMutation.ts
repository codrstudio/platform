// File: frontend/src/services/jqel/hooks/useJQELMutation.ts
// Generic JQEL mutation hook

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { jqelQuery } from '../client';
import type { JQELQuery } from '../../../types/jqel';

/**
 * Generic JQEL Mutation Hook
 *
 * For custom actions beyond insert/update/delete.
 * Use specialized hooks (useInsert, useUpdate, useDelete) for standard operations.
 *
 * SPEC References:
 * - SPEC-DA-MU-001:004: useMutation integration
 * - SPEC-JQEL-MUT-006:007: Custom actions
 *
 * @example
 * ```typescript
 * const activateUser = useJQELMutation<User, { userId: number }>({
 *   buildQuery: (vars) => ({
 *     schema: 'sac',
 *     mutate: 'usuario',
 *     action: 'activate',
 *     where: { id_usuario: { $eq: vars.userId } }
 *   })
 * });
 *
 * activateUser.mutate({ userId: 123 });
 * ```
 */
export function useJQELMutation<TData = unknown, TVariables = void>(
  options: {
    buildQuery: (variables: TVariables) => JQELQuery;
    invalidateKeys?: (data: TData, variables: TVariables) => unknown[][];
  }
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const query = options.buildQuery(variables);
      const data = await jqelQuery<TData>(query);
      return Array.isArray(data) ? data[0] : data;
    },
    onSuccess: (data, variables) => {
      // SPEC-DA-MU-005:008: Invalidate cache after mutation
      if (options.invalidateKeys) {
        const keys = options.invalidateKeys(data, variables);
        keys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}
