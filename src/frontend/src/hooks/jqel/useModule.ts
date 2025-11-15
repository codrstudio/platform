// Module JQEL Hooks
// CRUD operations for BackendModule entity

import type { BackendModule } from '@/types/module'
import { useJQELQuery, useJQELList } from '../useJQEL'
import { usePortal } from './usePortal'

/**
 * Get all modules
 */
export function useModules() {
  return useJQELList<BackendModule>('backend', 'module')
}

/**
 * Get single module by ID
 */
export function useModule(moduleId: string) {
  return useJQELQuery<BackendModule[]>({
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
