/**
 * useJQELQuery Hook
 *
 * TanStack Query integration for JQEL queries.
 * Provides caching, automatic refetching, and loading/error states.
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-TQ-*, SPEC-DA-ERR-*, SPEC-DA-PERF-*)
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { jqel } from '../services/jqel/jqelClient.js';
import { queryKeys } from '../services/jqel/queryKeys.js';
import type { JQELSelectQuery, JResult, JQELError, JQELQueryKey } from '../types/jqel.js';

// ============================================================================
// HOOK OPTIONS
// ============================================================================

/**
 * Options for useJQELQuery hook
 */
export interface UseJQELQueryOptions<T = any> extends Omit<
  UseQueryOptions<JResult<T>, JQELError, JResult<T>, JQELQueryKey>,
  'queryKey' | 'queryFn'
> {
  /**
   * Custom query key
   * If not provided, will be auto-generated from query
   */
  queryKey?: JQELQueryKey;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Execute a JQEL SELECT query with TanStack Query
 *
 * SPEC-DA-TQ-001: SELECT uses useQuery from TanStack Query
 * SPEC-DA-TQ-002: Query key is structured and unique
 * SPEC-DA-TQ-003: Query function calls jqel.query()
 *
 * Features:
 * - Automatic caching (SPEC-DA-PERF-001)
 * - Loading/error states (SPEC-DA-P-008)
 * - Automatic retry on errors (SPEC-DA-ERR-004)
 * - Refetch on window focus (configurable)
 *
 * @param query - JQEL SELECT query
 * @param options - TanStack Query options
 * @returns Query result with data, loading, error states
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useJQELQuery({
 *   schema: 'backend',
 *   select: 'portal',
 *   where: { portalId: { eq: 'main' } }
 * });
 * ```
 */
export function useJQELQuery<T = any>(
  query: JQELSelectQuery,
  options?: UseJQELQueryOptions<T>
): UseQueryResult<JResult<T>, JQELError> {
  // Generate query key
  // SPEC-DA-TQ-002: Query key is structured and unique
  // SPEC-DA-TQ-006: Format [schema, entity, params?]
  const queryKey = options?.queryKey || generateQueryKey(query);

  return useQuery<JResult<T>, JQELError, JResult<T>, JQELQueryKey>({
    queryKey,

    // SPEC-DA-TQ-003: Query function calls jqel.query()
    queryFn: () => jqel.query<T>(query),

    // Default configuration (SPEC-DA-PERF-003)
    staleTime: 5 * 60 * 1000,       // 5 minutes
    gcTime: 10 * 60 * 1000,          // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,

    // SPEC-DA-ERR-005: Retry logic
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.isClientError()) {
        return false;
      }
      // Retry up to 3 times on server errors (5xx)
      return failureCount < 3;
    },

    // Exponential backoff for retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Merge with user-provided options
    ...options,
  });
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Query for a specific record by ID
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param id - Record ID
 * @param options - Query options
 * @returns Query result
 *
 * @example
 * ```typescript
 * const { data } = useJQELRecord('backend', 'portal', 'main');
 * const portal = data?.data?.[0];
 * ```
 */
export function useJQELRecord<T = any>(
  schema: string,
  entity: string,
  id: string | number,
  options?: UseJQELQueryOptions<T>
): UseQueryResult<JResult<T>, JQELError> {
  return useJQELQuery<T>(
    {
      schema,
      select: entity,
      where: { id: { eq: id } },
    },
    {
      queryKey: queryKeys.record(schema, entity, id),
      ...options,
    }
  );
}

/**
 * Query for a list of records with optional filters
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param filters - Optional WHERE clause
 * @param options - Query options
 * @returns Query result
 *
 * @example
 * ```typescript
 * const { data } = useJQELList('backend', 'portal', {
 *   active: { eq: true }
 * });
 * const portals = data?.data || [];
 * ```
 */
export function useJQELList<T = any>(
  schema: string,
  entity: string,
  filters?: Record<string, any>,
  options?: UseJQELQueryOptions<T>
): UseQueryResult<JResult<T>, JQELError> {
  const query: JQELSelectQuery = {
    schema,
    select: entity,
  };

  if (filters) {
    query.where = filters;
  }

  const queryKey = filters
    ? queryKeys.entityFilter(schema, entity, filters)
    : queryKeys.entity(schema, entity);

  return useJQELQuery<T>(query, {
    queryKey,
    ...options,
  });
}

/**
 * Query with pagination
 *
 * SPEC-DA-PERF-009: Always use pagination for lists
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param page - Page number (0-indexed)
 * @param pageSize - Records per page
 * @param filters - Optional WHERE clause
 * @param orderBy - Optional sorting
 * @param options - Query options
 * @returns Query result
 *
 * @example
 * ```typescript
 * const { data } = useJQELPaginated('backend', 'portal', 0, 10);
 * const portals = data?.data || [];
 * ```
 */
export function useJQELPaginated<T = any>(
  schema: string,
  entity: string,
  page: number,
  pageSize: number,
  filters?: Record<string, any>,
  orderBy?: Array<Record<string, 'asc' | 'desc'>>,
  options?: UseJQELQueryOptions<T>
): UseQueryResult<JResult<T>, JQELError> {
  const query: JQELSelectQuery = {
    schema,
    select: entity,
    options: {
      limit: pageSize,
      offset: page * pageSize,
      orderBy,
    },
  };

  if (filters) {
    query.where = filters;
  }

  const params = {
    ...(filters || {}),
    __page: page,
    __pageSize: pageSize,
  };

  return useJQELQuery<T>(query, {
    queryKey: queryKeys.entityFilter(schema, entity, params),
    ...options,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate query key from JQEL query
 *
 * SPEC-DA-TQ-006: Format [schema, entity, params?]
 *
 * @param query - JQEL SELECT query
 * @returns Query key array
 */
function generateQueryKey(query: JQELSelectQuery): JQELQueryKey {
  const { schema, select, where, action, options } = query;

  // Build params object from query
  const params: Record<string, any> = {};

  if (where) {
    params.where = where;
  }

  if (action) {
    params.__action = action;
  }

  if (options) {
    if (options.limit !== undefined) params.limit = options.limit;
    if (options.offset !== undefined) params.offset = options.offset;
    if (options.orderBy) params.orderBy = options.orderBy;
  }

  // Return key with or without params
  if (Object.keys(params).length > 0) {
    return queryKeys.entityFilter(schema, select, params);
  }

  return queryKeys.entity(schema, select);
}
