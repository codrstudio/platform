/**
 * Query Key Factories for JQEL
 *
 * Provides consistent, hierarchical query keys for TanStack Query cache.
 *
 * SPEC References:
 * - SPEC-DA-TQ-005:009: Hierarchical query key structure
 * - SPEC-DA-BP-001:003: Query key factory pattern
 */

/**
 * Backend schema query keys (portal, module, instance)
 */
export const backendKeys = {
  /**
   * All backend queries
   * Invalidates: Every backend entity
   */
  all: ['backend'] as const,

  /**
   * Portal query keys
   */
  portals: () => [...backendKeys.all, 'portal'] as const,
  portal: (id: string) => [...backendKeys.portals(), { id }] as const,

  /**
   * Module query keys
   */
  modules: (portalId?: string) =>
    portalId
      ? [...backendKeys.all, 'module', { portalId }] as const
      : [...backendKeys.all, 'module'] as const,

  module: (moduleId: string, portalId?: string) =>
    portalId
      ? [...backendKeys.all, 'module', { moduleId, portalId }] as const
      : [...backendKeys.all, 'module', { moduleId }] as const,

  /**
   * Instance query keys
   */
  instances: (portalId?: string, moduleId?: string) => {
    const base = [...backendKeys.all, 'instance'] as const;
    if (portalId && moduleId) {
      return [...base, { portalId, moduleId }] as const;
    }
    if (portalId) {
      return [...base, { portalId }] as const;
    }
    if (moduleId) {
      return [...base, { moduleId }] as const;
    }
    return base;
  },

  instance: (instanceId: string) =>
    [...backendKeys.all, 'instance', { id: instanceId }] as const,
};

/**
 * Application schema query keys (dynamic schemas like 'sac', 'crm', etc.)
 */
export const schemaKeys = {
  /**
   * All queries for a specific schema
   */
  all: (schema: string) => [schema] as const,

  /**
   * All queries for a specific entity in a schema
   */
  entity: (schema: string, entity: string) =>
    [schema, entity] as const,

  /**
   * List query with optional filters
   */
  list: (schema: string, entity: string, filters?: Record<string, unknown>) =>
    filters
      ? [schema, entity, 'list', filters] as const
      : [schema, entity, 'list'] as const,

  /**
   * Detail query for specific record
   */
  detail: (schema: string, entity: string, id: string | number) =>
    [schema, entity, 'detail', { id }] as const,

  /**
   * Custom query with params
   */
  custom: (schema: string, entity: string, key: string, params?: Record<string, unknown>) =>
    params
      ? [schema, entity, key, params] as const
      : [schema, entity, key] as const,
};

/**
 * Query keys object for export
 */
export const queryKeys = {
  backend: backendKeys,
  schema: schemaKeys,
};

/**
 * Type helper to extract query key from factory function
 */
export type QueryKey = ReturnType<
  typeof backendKeys[keyof typeof backendKeys] |
  typeof schemaKeys[keyof typeof schemaKeys]
>;

// Legacy exports for backward compatibility (from Task 1.4.7)
export const jqelKeys = schemaKeys;
export const portalKeys = {
  all: () => backendKeys.portals(),
  list: (filters?: any) => backendKeys.portals(),
  detail: (portalId: string) => backendKeys.portal(portalId),
};
export const moduleKeys = {
  all: () => backendKeys.modules(),
  list: (filters?: any) => backendKeys.modules(),
  detail: (moduleId: string) => backendKeys.module(moduleId),
};
export const instanceKeys = {
  all: () => backendKeys.instances(),
  list: (filters?: any) => backendKeys.instances(),
  detail: (instanceId: string) => backendKeys.instance(instanceId),
};
