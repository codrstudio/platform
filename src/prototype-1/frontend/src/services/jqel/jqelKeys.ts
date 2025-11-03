/**
 * JQEL Query Keys Factory
 * Consistent query keys for TanStack Query
 * SPEC-DA-TQ-005 to SPEC-DA-TQ-009
 */

import type { JQELQueryKey } from './types';

/**
 * Query key factory for JQEL queries
 * Provides hierarchical and consistent keys
 */
export const jqelKeys = {
  /**
   * All JQEL queries
   */
  all: (): JQELQueryKey => ['jqel'] as const,

  /**
   * All queries for a schema
   */
  schema: (schema: string): JQELQueryKey => ['jqel', schema] as const,

  /**
   * All queries for an entity
   */
  entity: (schema: string, entity: string): JQELQueryKey =>
    ['jqel', schema, entity] as const,

  /**
   * Specific entity detail by ID
   */
  detail: (schema: string, entity: string, id: any): JQELQueryKey =>
    ['jqel', schema, entity, 'detail', id] as const,

  /**
   * Entity list with optional filters
   */
  list: (schema: string, entity: string, filters?: any): JQELQueryKey => {
    const key: any[] = ['jqel', schema, entity, 'list'];
    if (filters) {
      key.push(filters);
    }
    return key as unknown as JQELQueryKey;
  },

  /**
   * Custom query key for dashboard or aggregations
   */
  custom: (schema: string, entity: string, type: string, params?: any): JQELQueryKey => {
    const key: any[] = ['jqel', schema, entity, type];
    if (params) {
      key.push(params);
    }
    return key as unknown as JQELQueryKey;
  },

  /**
   * Generate key from JQEL query object
   * Useful for automatic key generation
   */
  fromQuery: (query: {
    schema: string;
    select?: string;
    mutate?: string;
    where?: any;
    options?: any;
  }): JQELQueryKey => {
    const entity = query.select || query.mutate || 'unknown';
    const key: any[] = ['jqel', query.schema, entity];

    // Add filters if present
    if (query.where) {
      key.push('filtered', query.where);
    }

    // Add options if present
    if (query.options) {
      key.push('options', query.options);
    }

    return key as unknown as JQELQueryKey;
  },
};
