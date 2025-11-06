/**
 * JQEL Query Key Factory
 *
 * Factory functions for creating consistent query keys for TanStack Query.
 * Enables efficient cache management and invalidation.
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-TQ-005 to SPEC-DA-TQ-009, SPEC-DA-BP-001 to SPEC-DA-BP-003)
 */

import type { JQELQueryKey } from '../../types/jqel.js';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Create query key for a schema
 *
 * SPEC-DA-TQ-006: Format [schema, entity, params?]
 *
 * @param schema - Schema name
 * @returns Query key array
 */
export function schemaKey(schema: string): JQELQueryKey {
  return [schema, '__all__'];
}

/**
 * Create query key for an entity (all records)
 *
 * SPEC-DA-TQ-007: ['sac', 'usuario']
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @returns Query key array
 */
export function entityKey(schema: string, entity: string): JQELQueryKey {
  return [schema, entity];
}

/**
 * Create query key for an entity with filters
 *
 * SPEC-DA-TQ-007: ['sac', 'usuario', { status: 'ativo' }]
 * SPEC-DA-TQ-008: Params must be serializable (JSON)
 * SPEC-DA-TQ-009: Field order in params must be consistent
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param params - Filter parameters
 * @returns Query key array
 */
export function entityFilterKey(
  schema: string,
  entity: string,
  params: Record<string, any>
): JQELQueryKey {
  // Sort params keys for consistency (SPEC-DA-TQ-009)
  const sortedParams = sortParams(params);
  return [schema, entity, sortedParams];
}

/**
 * Create query key for a specific record by ID
 *
 * SPEC-DA-TQ-007: ['sac', 'usuario', { id: 123 }]
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param id - Record ID
 * @returns Query key array
 */
export function recordKey(
  schema: string,
  entity: string,
  id: string | number
): JQELQueryKey {
  return [schema, entity, { id }];
}

/**
 * Create query key for a custom action/view
 *
 * SPEC-DA-TQ-007: ['sac', 'atendimento', 'dashboard']
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param action - Action/view name
 * @param params - Optional parameters
 * @returns Query key array
 */
export function actionKey(
  schema: string,
  entity: string,
  action: string,
  params?: Record<string, any>
): JQELQueryKey {
  if (params) {
    const sortedParams = sortParams({ ...params, __action: action });
    return [schema, entity, sortedParams];
  }
  return [schema, entity, { __action: action }];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sort params object keys for consistent query keys
 *
 * SPEC-DA-TQ-009: Order of fields in params must be consistent
 *
 * @param params - Parameters object
 * @returns Params with sorted keys
 */
function sortParams(params: Record<string, any>): Record<string, any> {
  const sortedKeys = Object.keys(params).sort();
  const sorted: Record<string, any> = {};

  for (const key of sortedKeys) {
    sorted[key] = params[key];
  }

  return sorted;
}

/**
 * Serialize params to a stable string for debugging
 *
 * @param params - Parameters object
 * @returns JSON string
 */
export function serializeParams(params?: Record<string, any>): string {
  if (!params) return '';
  return JSON.stringify(sortParams(params));
}

// ============================================================================
// PREDEFINED KEY FACTORIES (Common Schemas)
// ============================================================================

/**
 * Backend schema query keys
 * Used for portal/module/instance configuration
 */
export const backendKeys = {
  all: () => schemaKey('backend'),
  portals: () => entityKey('backend', 'portal'),
  portal: (portalId: string) => recordKey('backend', 'portal', portalId),
  modules: () => entityKey('backend', 'module'),
  module: (moduleId: string) => recordKey('backend', 'module', moduleId),
  instances: () => entityKey('backend', 'instance'),
  instance: (instanceId: string) => recordKey('backend', 'instance', instanceId),
};

/**
 * Platform schema query keys
 * Used for platform-wide operations processed by Backbone
 */
export const platformKeys = {
  all: () => schemaKey('platform'),
  entity: (entity: string) => entityKey('platform', entity),
  record: (entity: string, id: string | number) => recordKey('platform', entity, id),
  filtered: (entity: string, params: Record<string, any>) =>
    entityFilterKey('platform', entity, params),
};

/**
 * Create app-specific key factory
 *
 * Example usage:
 * ```typescript
 * const sacKeys = createAppKeys('sac');
 * const userKey = sacKeys.record('usuario', 123);
 * ```
 *
 * @param schema - Application schema name
 * @returns App-specific key factory
 */
export function createAppKeys(schema: string) {
  return {
    all: () => schemaKey(schema),
    entity: (entity: string) => entityKey(schema, entity),
    record: (entity: string, id: string | number) => recordKey(schema, entity, id),
    filtered: (entity: string, params: Record<string, any>) =>
      entityFilterKey(schema, entity, params),
    action: (entity: string, action: string, params?: Record<string, any>) =>
      actionKey(schema, entity, action, params),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const queryKeys = {
  // Core factories
  schema: schemaKey,
  entity: entityKey,
  entityFilter: entityFilterKey,
  record: recordKey,
  action: actionKey,

  // Predefined factories
  backend: backendKeys,
  platform: platformKeys,

  // App factory creator
  createApp: createAppKeys,
};
