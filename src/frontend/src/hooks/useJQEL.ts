// useJQEL Hook - TanStack Query integration
// Based on SPEC-data-access.md (SPEC-DA-TQ-*)

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { jqelClient, queryKeys } from '@/services/jqelClient';
import type { JQELSelectQuery, JQELMutateQuery, JResult } from '@/types/jqel';

/**
 * useJQELQuery - SELECT queries
 *
 * SPEC-DA-TQ-001: SELECT uses useQuery
 * SPEC-DA-TQ-002: Query key is structured and unique
 * SPEC-DA-TQ-003: Query function calls jqel.query()
 */
export function useJQELQuery<T = unknown>(
  query: JQELSelectQuery,
  options?: Omit<UseQueryOptions<JResult<T>>, 'queryKey' | 'queryFn'>
) {
  // Generate query key (SPEC-DA-TQ-005 to SPEC-DA-TQ-008)
  const queryKey = queryKeys.select(
    query.schema,
    query.select,
    {
      ...(query.where && { where: query.where }),
      ...(query.options && { options: query.options }),
      ...(query.output && { output: query.output }),
      ...(query.except && { except: query.except }),
    }
  );

  return useQuery<JResult<T>>({
    queryKey,
    queryFn: () => jqelClient.query<T>(query),
    ...options,
  });
}

/**
 * useJQELMutation - INSERT/UPDATE/DELETE queries
 *
 * SPEC-DA-MU-001: MUTATE uses useMutation
 * SPEC-DA-MU-002: Mutation function calls jqel.query()
 */
export function useJQELMutation<T = unknown, TVariables = Partial<JQELMutateQuery>>(
  baseQuery: Omit<JQELMutateQuery, 'values' | 'where'>,
  options?: Omit<UseMutationOptions<JResult<T>, Error, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<JResult<T>, Error, TVariables>({
    mutationFn: (variables) =>
      jqelClient.query<T>({
        ...baseQuery,
        ...variables,
      } as JQELMutateQuery),
    onSuccess: (...args) => {
      // Invalidate related queries (SPEC-DA-MU-003)
      queryClient.invalidateQueries({
        queryKey: [baseQuery.schema, baseQuery.mutate],
      });

      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Convenience hooks for common operations
 */

/**
 * useJQELList - Fetch a list of entities
 */
export function useJQELList<T = unknown>(
  schema: string,
  entity: string,
  where?: JQELSelectQuery['where'],
  options?: Omit<UseQueryOptions<JResult<T[]>>, 'queryKey' | 'queryFn'>
) {
  return useJQELQuery<T[]>(
    {
      schema,
      select: entity,
      ...(where && { where }),
    },
    options
  );
}

/**
 * useJQELDetail - Fetch a single entity by ID
 */
export function useJQELDetail<T = unknown>(
  schema: string,
  entity: string,
  id: string | number,
  options?: Omit<UseQueryOptions<JResult<T>>, 'queryKey' | 'queryFn'>
) {
  return useJQELQuery<T>(
    {
      schema,
      select: entity,
      where: { id: { $eq: id } },
    },
    {
      enabled: !!id,
      ...options,
    }
  );
}

/**
 * useJQELInsert - Insert mutation
 */
export function useJQELInsert<T = unknown>(
  schema: string,
  entity: string,
  options?: UseMutationOptions<JResult<T>, Error, { values: Record<string, unknown> }>
) {
  return useJQELMutation<T, { values: Record<string, unknown> }>(
    {
      schema,
      mutate: entity,
      action: 'insert',
    },
    options
  );
}

/**
 * useJQELUpdate - Update mutation
 */
export function useJQELUpdate<T = unknown>(
  schema: string,
  entity: string,
  options?: UseMutationOptions<
    JResult<T>,
    Error,
    { values: Record<string, unknown>; where: JQELMutateQuery['where'] }
  >
) {
  return useJQELMutation<T, { values: Record<string, unknown>; where: JQELMutateQuery['where'] }>(
    {
      schema,
      mutate: entity,
      action: 'update',
    },
    options
  );
}

/**
 * useJQELDelete - Delete mutation
 */
export function useJQELDelete<T = unknown>(
  schema: string,
  entity: string,
  options?: UseMutationOptions<JResult<T>, Error, { where: JQELMutateQuery['where'] }>
) {
  return useJQELMutation<T, { where: JQELMutateQuery['where'] }>(
    {
      schema,
      mutate: entity,
      action: 'delete',
    },
    options
  );
}

/**
 * Domain-Specific Hooks for Backend Schema
 */

// Realm Types
// Realm System - grouped portals that share configuration
export interface Realm {
  realmId: string
  name: string
  description?: string
  removable: boolean
  config?: {
    theme?: {
      mode?: 'light' | 'dark' | 'system'
      brandColor?: string
      radius?: string
    }
  }
  metadata?: Record<string, unknown>
}

// Portal Types
// BREAKING CHANGE: settingsKey replaced with realmId (Realm System)
export interface Portal {
  portalId: string
  name: string
  description?: string
  realmId: string
  availableModules: string[] // Modules added to portal (may be inactive)
  activeModules: string[]    // Currently active modules (subset of availableModules)
  removable: boolean
  metadata?: Record<string, unknown>
}

// Module Types
export interface Module {
  moduleId: string
  name: string
  description?: string
  type: 'component' | 'functionality'
  category?: 'system' | 'business' | 'productivity' | 'communication'
  dependencies: string[]
  version: string
  enabled: boolean
  metadata?: Record<string, unknown>
}

// Instance Types
export interface Instance {
  instanceId: string
  portalId: string
  moduleId: string
  config: Record<string, unknown>
  active: boolean
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, unknown>
}

/**
 * Portal Hooks
 */
export function usePortals() {
  return useJQELList<Portal>('backend', 'portal')
}

export function usePortal(portalId: string) {
  return useJQELQuery<Portal[]>({
    schema: 'backend',
    select: 'portal',
    where: { portalId: { $eq: portalId } },
  }, {
    enabled: !!portalId,
  })
}

export function useCreatePortal() {
  return useJQELInsert<Portal>('backend', 'portal')
}

export function useUpdatePortal() {
  return useJQELUpdate<Portal>('backend', 'portal')
}

export function useDeletePortal() {
  return useJQELDelete<null>('backend', 'portal')
}

/**
 * Module Hooks
 */
export function useModules() {
  return useJQELList<Module>('backend', 'module')
}

export function useModule(moduleId: string) {
  return useJQELQuery<Module[]>({
    schema: 'backend',
    select: 'module',
    where: { moduleId: { $eq: moduleId } },
  }, {
    enabled: !!moduleId,
  })
}

/**
 * Get modules active in a specific portal
 */
export function usePortalModules(portalId: string) {
  const { data: portalResult, isLoading: isLoadingPortal } = usePortal(portalId)
  const { data: modulesResult, isLoading: isLoadingModules } = useModules()

  const portal = portalResult?.data?.[0]
  const modules = modulesResult?.data || []
  const activeModuleIds = portal?.activeModules || []

  // Filter modules that are active in this portal
  const portalModules = modules.filter(m => activeModuleIds.includes(m.moduleId))

  return {
    data: portalModules,
    isLoading: isLoadingPortal || isLoadingModules,
    portal,
  }
}

/**
 * Instance Hooks
 */
export function useInstances(portalId?: string, moduleId?: string) {
  const where: Record<string, any> = {}

  if (portalId) {
    where.portalId = { $eq: portalId }
  }

  if (moduleId) {
    where.moduleId = { $eq: moduleId }
  }

  return useJQELQuery<Instance[]>({
    schema: 'backend',
    select: 'instance',
    ...(Object.keys(where).length > 0 && { where }),
  }, {
    enabled: !!portalId || !!moduleId,
  })
}

export function useInstance(instanceId: string, portalId: string) {
  return useJQELQuery<Instance[]>({
    schema: 'backend',
    select: 'instance',
    where: {
      instanceId: { $eq: instanceId },
      portalId: { $eq: portalId },
    },
  }, {
    enabled: !!instanceId && !!portalId,
  })
}

export function useCreateInstance() {
  return useJQELInsert<Instance>('backend', 'instance')
}

export function useUpdateInstance() {
  return useJQELUpdate<Instance>('backend', 'instance')
}

export function useDeleteInstance() {
  return useJQELDelete<null>('backend', 'instance')
}

/**
 * Realm Hooks
 * Realm uses REST API (/api/realms), not JQEL
 */

const API_BASE_URL = 'http://localhost:3000'

/**
 * Get all realms
 */
export function useRealms() {
  return useQuery<JResult<Realm[]>>({
    queryKey: ['realms'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/realms`)
      if (!response.ok) {
        throw new Error(`Failed to fetch realms: ${response.statusText}`)
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get realm by ID
 */
export function useRealm(realmId: string) {
  return useQuery<JResult<Realm>>({
    queryKey: ['realms', realmId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/realms/${realmId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch realm: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!realmId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Create realm
 */
export function useCreateRealm() {
  const queryClient = useQueryClient()

  return useMutation<JResult<Realm>, Error, Partial<Realm>>({
    mutationFn: async (realm) => {
      const response = await fetch(`${API_BASE_URL}/api/realms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(realm),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create realm')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realms'] })
    },
  })
}

/**
 * Update realm
 */
export function useUpdateRealm() {
  const queryClient = useQueryClient()

  return useMutation<JResult<Realm>, Error, { realmId: string; updates: Partial<Realm> }>({
    mutationFn: async ({ realmId, updates }) => {
      const response = await fetch(`${API_BASE_URL}/api/realms/${realmId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update realm')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['realms'] })
      queryClient.invalidateQueries({ queryKey: ['realms', variables.realmId] })
    },
  })
}

/**
 * Delete realm
 */
export function useDeleteRealm() {
  const queryClient = useQueryClient()

  return useMutation<JResult<null>, Error, string>({
    mutationFn: async (realmId) => {
      const response = await fetch(`${API_BASE_URL}/api/realms/${realmId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete realm')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realms'] })
      queryClient.invalidateQueries({ queryKey: ['portals'] }) // Portals may have changed
    },
  })
}
