// Instance JQEL Hooks
// CRUD operations for Instance entity

import type { Instance } from '@/types/instance'
import { useJQELQuery, useJQELInsert, useJQELUpdate, useJQELDelete } from '../useJQEL'

/**
 * Get instances filtered by portalId and/or moduleId
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

/**
 * Get single instance by ID, portalId, and moduleId
 * IMPORTANT: moduleId is required to uniquely identify an instance
 * because multiple modules can have instances with the same instanceId in the same portal
 */
export function useInstance(instanceId: string, portalId: string, moduleId: string) {
  return useJQELQuery<Instance[]>({
    schema: 'backend',
    select: 'instance',
    where: {
      instanceId: { $eq: instanceId },
      portalId: { $eq: portalId },
      moduleId: { $eq: moduleId },  // ← CRÍTICO: identificação única!
    },
  }, {
    enabled: !!instanceId && !!portalId && !!moduleId,
  })
}

/**
 * Create instance mutation
 */
export function useCreateInstance() {
  return useJQELInsert<Instance>('backend', 'instance')
}

/**
 * Update instance mutation
 */
export function useUpdateInstance() {
  return useJQELUpdate<Instance>('backend', 'instance')
}

/**
 * Delete instance mutation
 */
export function useDeleteInstance() {
  return useJQELDelete<null>('backend', 'instance')
}
