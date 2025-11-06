/**
 * useJQELMutation Hook
 *
 * TanStack Query integration for JQEL mutations (insert, update, delete).
 * Provides optimistic updates, automatic cache invalidation, and error handling.
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-MU-*, SPEC-DA-TQ-016 to SPEC-DA-TQ-033)
 * - SPEC-jqel-syntax.md (SPEC-JQEL-MUT-*)
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { jqel } from '../services/jqel/jqelClient.js';
import type {
  JQELMutateQuery,
  JResult,
  JQELError,
  JQELQueryKey,
} from '../types/jqel.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Cache invalidation scope
 * SPEC-DA-MU-006: Invalidation can be specific or broad
 */
export type InvalidationScope = 'specific' | 'entity' | 'schema';

/**
 * Options for cache invalidation after successful mutation
 */
export interface InvalidationOptions {
  /**
   * Scope of cache invalidation
   * - 'specific': Invalidate only the specific record (requires recordId)
   * - 'entity': Invalidate all queries for the entity
   * - 'schema': Invalidate all queries for the schema
   *
   * Default: 'entity'
   */
  scope?: InvalidationScope;

  /**
   * Record ID for specific invalidation
   * Required if scope is 'specific'
   */
  recordId?: string | number;

  /**
   * Additional query keys to invalidate
   */
  additionalKeys?: JQELQueryKey[];
}

/**
 * Context for optimistic updates
 * SPEC-DA-MU-012: Context for snapshot and rollback
 */
export interface OptimisticContext {
  /**
   * Previous data snapshot for rollback on error
   */
  previousData?: Map<string, any>;
}

/**
 * Options for useJQELMutation hook
 */
export interface UseJQELMutationOptions<TVariables = any, TData = any>
  extends Omit<
    UseMutationOptions<
      JResult<TData>,
      JQELError,
      TVariables,
      OptimisticContext
    >,
    'mutationFn'
  > {
  /**
   * Cache invalidation options
   * SPEC-DA-MU-005: Invalidate affected queries after success
   */
  invalidation?: InvalidationOptions;

  /**
   * Enable optimistic updates
   * SPEC-DA-MU-009: Mutations can use optimistic updates
   * Default: false
   */
  optimistic?: boolean;

  /**
   * Function to build JQEL mutation query from variables
   */
  buildQuery: (variables: TVariables) => JQELMutateQuery;

  /**
   * Function to generate optimistic data for UI update
   * Required if optimistic is true
   */
  optimisticData?: (variables: TVariables) => any;

  /**
   * Query key(s) to update optimistically
   * Required if optimistic is true
   */
  optimisticKeys?: JQELQueryKey | JQELQueryKey[];
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Execute a JQEL MUTATE query with TanStack Query
 *
 * SPEC-DA-MU-001: MUTATE uses useMutation from TanStack Query
 * SPEC-DA-MU-002: Mutation function calls jqel.query()
 * SPEC-DA-MU-003: onSuccess invalidates related queries
 *
 * Features:
 * - Automatic cache invalidation (SPEC-DA-MU-005 to SPEC-DA-MU-008)
 * - Optimistic updates (SPEC-DA-MU-009 to SPEC-DA-MU-012)
 * - Error handling and rollback (SPEC-DA-MU-011)
 * - Flexible invalidation strategies
 *
 * @param options - Mutation options
 * @returns Mutation result with mutate function and states
 *
 * @example
 * ```typescript
 * const createPortal = useJQELMutation({
 *   buildQuery: (data) => ({
 *     schema: 'backend',
 *     mutate: 'portal',
 *     action: 'insert',
 *     values: data
 *   }),
 *   invalidation: { scope: 'entity' }
 * });
 *
 * createPortal.mutate({
 *   portalId: 'new-portal',
 *   displayName: 'New Portal'
 * });
 * ```
 */
export function useJQELMutation<TVariables = any, TData = any>(
  options: UseJQELMutationOptions<TVariables, TData>
): UseMutationResult<JResult<TData>, JQELError, TVariables, OptimisticContext> {
  const queryClient = useQueryClient();
  const {
    buildQuery,
    invalidation,
    optimistic = false,
    optimisticData,
    optimisticKeys,
    onMutate,
    onError,
    onSuccess,
    onSettled,
    ...mutationOptions
  } = options;

  return useMutation<
    JResult<TData>,
    JQELError,
    TVariables,
    OptimisticContext
  >({
    // SPEC-DA-MU-002: Mutation function calls jqel.query()
    mutationFn: async (variables) => {
      const query = buildQuery(variables);
      return jqel.query<TData>(query);
    },

    // SPEC-DA-MU-012: Optimistic update before mutation
    onMutate: async (variables) => {
      const context: OptimisticContext = {
        previousData: new Map(),
      };

      // Execute optimistic updates if enabled
      if (optimistic && optimisticData && optimisticKeys) {
        const keys = Array.isArray(optimisticKeys)
          ? optimisticKeys
          : [optimisticKeys];

        for (const queryKey of keys) {
          // SPEC-DA-MU-012: Cancel outgoing queries
          await queryClient.cancelQueries({ queryKey: queryKey as readonly unknown[] });

          // SPEC-DA-MU-012: Snapshot previous value
          const previous = queryClient.getQueryData(queryKey as readonly unknown[]);
          context.previousData!.set(JSON.stringify(queryKey), previous);

          // SPEC-DA-MU-010: Update UI optimistically
          const newData = optimisticData(variables);
          queryClient.setQueryData(queryKey as readonly unknown[], (old: any) => {
            if (!old) return old;

            // If old is JResult with data array, update the array
            if (old.data && Array.isArray(old.data)) {
              return {
                ...old,
                data: [...old.data, newData],
              };
            }

            return old;
          });
        }
      }

      // Call user's onMutate if provided
      // Note: We pass our context as the default, user can extend it
      const userOnMutate = onMutate as any;
      if (userOnMutate) {
        const userContext = await userOnMutate(variables);
        // Merge user context with our context
        if (userContext) {
          Object.assign(context, userContext);
        }
      }

      return context;
    },

    // SPEC-DA-MU-011: Rollback on error
    onError: (error, variables, context) => {
      // Rollback optimistic updates if they were applied
      if (context?.previousData && context.previousData.size > 0) {
        for (const [keyStr, previousValue] of context.previousData.entries()) {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, previousValue);
        }
      }

      // Call user's onError if provided
      const userOnError = onError as any;
      if (userOnError) {
        userOnError(error, variables, context);
      }
    },

    // SPEC-DA-MU-003: Invalidate queries on success
    onSuccess: (data, variables, context) => {
      // Perform cache invalidation based on configured scope
      if (invalidation) {
        const query = buildQuery(variables);
        const { schema, mutate: entity } = query;

        performInvalidation(queryClient, schema, entity, invalidation);
      }

      // Call user's onSuccess if provided
      const userOnSuccess = onSuccess as any;
      if (userOnSuccess) {
        userOnSuccess(data, variables, context);
      }
    },

    // SPEC-DA-MU-013: Always executed (success or error)
    onSettled: (data, error, variables, context) => {
      // Call user's onSettled if provided
      const userOnSettled = onSettled as any;
      if (userOnSettled) {
        userOnSettled(data, error, variables, context);
      }
    },

    ...mutationOptions,
  });
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Insert (create) mutation hook
 *
 * SPEC-JQEL-MUT-004: INSERT action creates new record
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Additional mutation options
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const createPortal = useInsert('backend', 'portal', {
 *   invalidation: { scope: 'entity' }
 * });
 *
 * createPortal.mutate({
 *   portalId: 'new-portal',
 *   displayName: 'New Portal'
 * });
 * ```
 */
export function useInsert<TData = any>(
  schema: string,
  entity: string,
  options?: Omit<UseJQELMutationOptions<Record<string, any>, TData>, 'buildQuery'>
) {
  return useJQELMutation<Record<string, any>, TData>({
    buildQuery: (values) => ({
      schema,
      mutate: entity,
      action: 'insert',
      values,
    }),
    invalidation: {
      scope: 'entity',
      ...options?.invalidation,
    },
    ...options,
  });
}

/**
 * Update mutation hook
 *
 * SPEC-JQEL-MUT-004: UPDATE action modifies existing record
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Additional mutation options
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const updatePortal = useUpdate('backend', 'portal', {
 *   invalidation: { scope: 'specific' }
 * });
 *
 * updatePortal.mutate({
 *   id: 'main',
 *   displayName: 'Main Portal Updated'
 * });
 * ```
 */
export function useUpdate<TData = any>(
  schema: string,
  entity: string,
  options?: Omit<
    UseJQELMutationOptions<
      { id: string | number; [key: string]: any },
      TData
    >,
    'buildQuery'
  >
) {
  return useJQELMutation<{ id: string | number; [key: string]: any }, TData>({
    buildQuery: ({ id, ...values }) => ({
      schema,
      mutate: entity,
      action: 'update',
      where: { id: { eq: id } },
      values,
    }),
    invalidation: {
      scope: 'specific',
      recordId: undefined, // Will be set from variables
      ...options?.invalidation,
    },
    ...options,
  });
}

/**
 * Delete mutation hook
 *
 * SPEC-JQEL-MUT-004: DELETE action removes record
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Additional mutation options
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const deletePortal = useDelete('backend', 'portal', {
 *   invalidation: { scope: 'entity' }
 * });
 *
 * deletePortal.mutate('portal-to-delete');
 * ```
 */
export function useDelete<TData = any>(
  schema: string,
  entity: string,
  options?: Omit<
    UseJQELMutationOptions<string | number, TData>,
    'buildQuery'
  >
) {
  return useJQELMutation<string | number, TData>({
    buildQuery: (id) => ({
      schema,
      mutate: entity,
      action: 'delete',
      where: { id: { eq: id } },
    }),
    invalidation: {
      scope: 'entity',
      ...options?.invalidation,
    },
    ...options,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Perform cache invalidation based on configured scope
 *
 * SPEC-DA-MU-005 to SPEC-DA-MU-008: Cache invalidation strategies
 *
 * @param queryClient - TanStack Query client
 * @param schema - Schema name
 * @param entity - Entity name
 * @param options - Invalidation options
 */
function performInvalidation(
  queryClient: ReturnType<typeof useQueryClient>,
  schema: string,
  entity: string,
  options: InvalidationOptions
): void {
  const { scope = 'entity', recordId, additionalKeys = [] } = options;

  // SPEC-DA-MU-007: Invalidation strategies
  switch (scope) {
    case 'specific':
      // Invalidate specific record only
      if (recordId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: [schema, entity, { id: recordId }],
        });
      }
      // Also invalidate entity list (record might appear there)
      queryClient.invalidateQueries({
        queryKey: [schema, entity],
        exact: false,
      });
      break;

    case 'entity':
      // SPEC-DA-MU-007: Invalidate all queries for the entity
      queryClient.invalidateQueries({
        queryKey: [schema, entity],
      });
      break;

    case 'schema':
      // SPEC-DA-MU-007: Invalidate all queries for the schema
      queryClient.invalidateQueries({
        queryKey: [schema],
      });
      break;
  }

  // Invalidate additional keys if provided
  for (const key of additionalKeys) {
    queryClient.invalidateQueries({ queryKey: key });
  }

  // SPEC-DA-MU-008: Invalidation triggers automatic refetch of active queries
}
