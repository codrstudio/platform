import type { QueryClient } from '@tanstack/react-query';
import type { JQELQuery } from '../../types/jqel';
import { queryKeys } from './queryKeys';

/**
 * JQEL Cache Invalidation
 *
 * Automatically invalidates TanStack Query cache after mutations.
 *
 * SPEC References:
 * - SPEC-DA-MU-005:008: Invalidation after successful mutation
 * - SPEC-DA-IN-001:008: Cache invalidation implementation
 * - SPEC-DA-BP-006:008: Intelligent invalidation strategies
 */

/**
 * Invalidation scope strategies
 */
export type InvalidationScope =
  | 'specific'  // Invalidate specific records only (e.g., after UPDATE)
  | 'entity'    // Invalidate entire entity (e.g., after INSERT/DELETE)
  | 'schema';   // Invalidate entire schema (e.g., after bulk operations)

export interface InvalidationStrategy {
  /**
   * Scope of invalidation
   * @default 'entity'
   */
  scope?: InvalidationScope;

  /**
   * Use exact matching for query keys
   * @default false
   */
  exact?: boolean;

  /**
   * Additional query keys to invalidate
   */
  additionalKeys?: unknown[][];
}

/**
 * Default invalidation strategies by mutation action
 */
const DEFAULT_STRATEGIES: Record<string, InvalidationScope> = {
  insert: 'entity',    // Invalidate all lists (new item might appear)
  update: 'specific',  // Invalidate specific record (if ID known) or entity
  delete: 'entity',    // Invalidate all lists (item removed)
  custom: 'entity',    // Conservative: invalidate entity
};

/**
 * Invalidate cache after JQEL mutation
 *
 * SPEC-DA-MU-005: After mutation success, invalidate affected queries
 *
 * @param queryClient - TanStack Query client instance
 * @param mutation - JQEL mutation query
 * @param strategy - Optional invalidation strategy override
 */
export function invalidateAfterMutation(
  queryClient: QueryClient,
  mutation: JQELQuery,
  strategy?: InvalidationStrategy
): void {
  try {
    const scope = strategy?.scope || DEFAULT_STRATEGIES[mutation.action || 'custom'];
    const exact = strategy?.exact ?? false;

    // Extract schema and entity from mutation
    const { schema, mutate: entity } = mutation;

    if (!schema || !entity) {
      console.warn('[Invalidation] Missing schema or entity in mutation:', mutation);
      return;
    }

    // Determine query keys to invalidate based on scope
    const keysToInvalidate = buildInvalidationKeys(schema, entity, mutation, scope);

    // Invalidate each query key
    for (const queryKey of keysToInvalidate) {
      queryClient.invalidateQueries({
        queryKey,
        exact,
      });
    }

    // Invalidate additional keys if provided
    if (strategy?.additionalKeys) {
      for (const additionalKey of strategy.additionalKeys) {
        queryClient.invalidateQueries({
          queryKey: additionalKey,
          exact,
        });
      }
    }

    // Log invalidation in development
    if (import.meta.env.DEV) {
      console.log('[Invalidation] Invalidated queries:', {
        schema,
        entity,
        action: mutation.action,
        scope,
        keys: keysToInvalidate,
      });
    }
  } catch (error) {
    // Invalidation errors should not break mutation success
    console.error('[Invalidation] Error during cache invalidation:', error);
  }
}

/**
 * Build query keys to invalidate based on scope
 */
function buildInvalidationKeys(
  schema: string,
  entity: string,
  mutation: JQELQuery,
  scope: InvalidationScope
): unknown[][] {
  const keys: unknown[][] = [];

  switch (scope) {
    case 'specific':
      // Try to extract ID from mutation for specific invalidation
      const recordId = extractRecordId(mutation);
      if (recordId) {
        // Invalidate specific record detail
        if (schema === 'backend') {
          // Backend schema: try to match entity type
          if (entity === 'portal') {
            keys.push([...queryKeys.backend.portal(recordId as string)] as unknown[]);
          } else if (entity === 'module') {
            keys.push([...queryKeys.backend.module(recordId as string)] as unknown[]);
          } else if (entity === 'instance') {
            keys.push([...queryKeys.backend.instance(recordId as string)] as unknown[]);
          }
        } else {
          keys.push([...queryKeys.schema.detail(schema, entity, recordId)] as unknown[]);
        }
      }
      // Also invalidate entity lists (record might appear in list)
      keys.push(...buildInvalidationKeys(schema, entity, mutation, 'entity'));
      break;

    case 'entity':
      // Invalidate all queries for this entity
      if (schema === 'backend') {
        // Backend schema: portal, module, or instance
        if (entity === 'portal') {
          keys.push([...queryKeys.backend.portals()] as unknown[]);
        } else if (entity === 'module') {
          keys.push([...queryKeys.backend.modules()] as unknown[]);
        } else if (entity === 'instance') {
          keys.push([...queryKeys.backend.instances()] as unknown[]);
        }
      } else {
        // Application schema
        keys.push([...queryKeys.schema.entity(schema, entity)] as unknown[]);
      }
      break;

    case 'schema':
      // Invalidate entire schema
      if (schema === 'backend') {
        keys.push([...queryKeys.backend.all] as unknown[]);
      } else {
        keys.push([...queryKeys.schema.all(schema)] as unknown[]);
      }
      break;
  }

  return keys;
}

/**
 * Extract record ID from mutation where clause or values
 *
 * Attempts to find ID in WHERE (for UPDATE/DELETE) or VALUES (for INSERT returning ID)
 */
function extractRecordId(mutation: JQELQuery): string | number | null {
  // Try WHERE clause (UPDATE/DELETE)
  if (mutation.where) {
    // Common patterns: { id: { $eq: 123 } } or { id: 123 }
    const where = mutation.where as Record<string, any>;

    // Check for id field
    if (where.id) {
      if (typeof where.id === 'object' && where.id.$eq) {
        return where.id.$eq;
      }
      if (typeof where.id === 'string' || typeof where.id === 'number') {
        return where.id;
      }
    }

    // Check for portalId, moduleId, instanceId (backend schema)
    const idFields = ['portalId', 'moduleId', 'instanceId'];
    for (const field of idFields) {
      if (where[field]) {
        if (typeof where[field] === 'object' && where[field].$eq) {
          return where[field].$eq;
        }
        if (typeof where[field] === 'string' || typeof where[field] === 'number') {
          return where[field];
        }
      }
    }
  }

  // No ID found
  return null;
}

/**
 * Invalidate backend schema queries (portal/module/instance)
 *
 * Helper for manual invalidation in components
 */
export function invalidateBackend(
  queryClient: QueryClient,
  options?: {
    portal?: boolean;
    module?: boolean;
    instance?: boolean;
  }
): void {
  try {
    if (!options || Object.keys(options).length === 0) {
      // Invalidate all backend queries
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.all });
      return;
    }

    // Selective invalidation
    if (options.portal) {
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.portals() });
    }
    if (options.module) {
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.modules() });
    }
    if (options.instance) {
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.instances() });
    }
  } catch (error) {
    console.error('[Invalidation] Error invalidating backend queries:', error);
  }
}

/**
 * Invalidate specific schema/entity
 *
 * Helper for manual invalidation in components or SSE events
 */
export function invalidateEntity(
  queryClient: QueryClient,
  schema: string,
  entity: string,
  options?: {
    exact?: boolean;
    recordId?: string | number;
  }
): void {
  try {
    if (options?.recordId) {
      // Invalidate specific record
      const queryKey = queryKeys.schema.detail(schema, entity, options.recordId);
      queryClient.invalidateQueries({ queryKey, exact: options?.exact });
    } else {
      // Invalidate entire entity
      const queryKey = queryKeys.schema.entity(schema, entity);
      queryClient.invalidateQueries({ queryKey, exact: options?.exact });
    }

    if (import.meta.env.DEV) {
      console.log('[Invalidation] Invalidated entity:', {
        schema,
        entity,
        recordId: options?.recordId,
      });
    }
  } catch (error) {
    console.error('[Invalidation] Error invalidating entity:', error);
  }
}
