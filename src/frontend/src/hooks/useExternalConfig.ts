/**
 * useExternalConfig Hook
 *
 * Manages external configuration files for module instances.
 * Used for hybrid storage where large configs are stored separately.
 *
 * Architecture:
 * - Basic config (route, title, enabled) stored inline in instances.json
 * - Visual config (sections, animations, theme) stored in external file
 * - External files: config/modules/:moduleId/:instanceId.json
 *
 * Backend Routes:
 * - GET /api/storage/config/:moduleId/:instanceId - Load config
 * - POST /api/storage/config/:moduleId/:instanceId - Save config
 * - DELETE /api/storage/config/:moduleId/:instanceId - Delete config
 * - HEAD /api/storage/config/:moduleId/:instanceId - Check exists
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import type { JResult } from '@/types/jqel'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003'

/**
 * Fetch external config from backend
 */
async function fetchExternalConfig(
  moduleId: string,
  instanceId: string
): Promise<Record<string, any> | null> {
  const response = await fetch(`${API_BASE}/api/storage/config/${moduleId}/${instanceId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch external config: ${response.statusText}`)
  }

  const result: JResult<Record<string, any> | null> = await response.json()

  if (result.code !== 200) {
    throw new Error(result.message || 'Failed to fetch external config')
  }

  return result.data ?? null
}

/**
 * Save external config to backend
 */
async function saveExternalConfig(
  moduleId: string,
  instanceId: string,
  config: Record<string, any>
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/storage/config/${moduleId}/${instanceId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ config }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save external config: ${response.statusText}`)
  }

  const result: JResult = await response.json()

  if (result.code !== 200) {
    throw new Error(result.message || 'Failed to save external config')
  }
}

/**
 * Delete external config from backend
 */
async function deleteExternalConfig(
  moduleId: string,
  instanceId: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/storage/config/${moduleId}/${instanceId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete external config: ${response.statusText}`)
  }

  const result: JResult = await response.json()

  if (result.code !== 200) {
    throw new Error(result.message || 'Failed to delete external config')
  }
}

/**
 * Query key factory for external configs
 */
const externalConfigKeys = {
  all: ['externalConfig'] as const,
  config: (moduleId: string, instanceId: string) =>
    [...externalConfigKeys.all, moduleId, instanceId] as const,
}

/**
 * useExternalConfig - Load external config file
 *
 * @param moduleId - Module identifier
 * @param instanceId - Instance identifier
 * @param options - TanStack Query options
 * @returns Query result with config or null
 *
 * @example
 * ```tsx
 * const { data: visualConfig, isLoading } = useExternalConfig('homepage', 'default')
 *
 * if (isLoading) return <div>Loading...</div>
 *
 * const sections = visualConfig?.sections || []
 * ```
 */
export function useExternalConfig<T = Record<string, any>>(
  moduleId: string,
  instanceId: string,
  options?: Omit<UseQueryOptions<T | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T | null, Error>({
    queryKey: externalConfigKeys.config(moduleId, instanceId),
    queryFn: () => fetchExternalConfig(moduleId, instanceId) as Promise<T | null>,
    // Don't retry on 404 (file doesn't exist yet)
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false
      return failureCount < 3
    },
    // Don't refetch when window gains focus (prevents annoying reload in editor)
    refetchOnWindowFocus: false,
    ...options,
  })
}

/**
 * useSaveExternalConfig - Save external config file
 *
 * @param options - TanStack Mutation options
 * @returns Mutation with mutate function
 *
 * @example
 * ```tsx
 * const saveConfig = useSaveExternalConfig()
 *
 * const handleSave = async () => {
 *   await saveConfig.mutateAsync({
 *     moduleId: 'homepage',
 *     instanceId: 'default',
 *     config: { sections: [...], theme: {...} }
 *   })
 * }
 * ```
 */
export function useSaveExternalConfig(
  options?: UseMutationOptions<
    void,
    Error,
    { moduleId: string; instanceId: string; config: Record<string, any> }
  >
) {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { moduleId: string; instanceId: string; config: Record<string, any> }
  >({
    mutationFn: ({ moduleId, instanceId, config }) =>
      saveExternalConfig(moduleId, instanceId, config),
    onSuccess: (data, variables) => {
      // Invalidate the specific config query
      queryClient.invalidateQueries({
        queryKey: externalConfigKeys.config(variables.moduleId, variables.instanceId),
      })

      // Also invalidate instance queries since config might affect them
      queryClient.invalidateQueries({
        queryKey: ['backend', 'instance'],
      })

      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}

/**
 * useDeleteExternalConfig - Delete external config file
 *
 * @param options - TanStack Mutation options
 * @returns Mutation with mutate function
 *
 * @example
 * ```tsx
 * const deleteConfig = useDeleteExternalConfig()
 *
 * const handleDelete = async () => {
 *   await deleteConfig.mutateAsync({
 *     moduleId: 'homepage',
 *     instanceId: 'default'
 *   })
 * }
 * ```
 */
export function useDeleteExternalConfig(
  options?: UseMutationOptions<
    void,
    Error,
    { moduleId: string; instanceId: string }
  >
) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { moduleId: string; instanceId: string }>({
    mutationFn: ({ moduleId, instanceId }) =>
      deleteExternalConfig(moduleId, instanceId),
    onSuccess: (data, variables) => {
      // Invalidate the specific config query
      queryClient.invalidateQueries({
        queryKey: externalConfigKeys.config(variables.moduleId, variables.instanceId),
      })

      // Also invalidate instance queries
      queryClient.invalidateQueries({
        queryKey: ['backend', 'instance'],
      })

      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}

/**
 * Convenience hook for managing external config with save/load in one hook
 *
 * @param moduleId - Module identifier
 * @param instanceId - Instance identifier
 * @returns Object with config data and save/delete mutations
 *
 * @example
 * ```tsx
 * const { config, save, isLoading, isSaving } = useExternalConfigManager('homepage', 'default')
 *
 * const handleUpdate = async (updates: Partial<HomepageConfig>) => {
 *   await save.mutateAsync({
 *     ...config,
 *     ...updates
 *   })
 * }
 * ```
 */
export function useExternalConfigManager<T = Record<string, any>>(
  moduleId: string,
  instanceId: string
) {
  const { data: config, isLoading, error } = useExternalConfig<T>(moduleId, instanceId)
  const saveMutation = useSaveExternalConfig()
  const deleteMutation = useDeleteExternalConfig()

  return {
    config,
    isLoading,
    error,
    save: {
      mutate: (config: Record<string, any>) =>
        saveMutation.mutate({ moduleId, instanceId, config }),
      mutateAsync: (config: Record<string, any>) =>
        saveMutation.mutateAsync({ moduleId, instanceId, config }),
      isPending: saveMutation.isPending,
      isError: saveMutation.isError,
      error: saveMutation.error,
    },
    delete: {
      mutate: () => deleteMutation.mutate({ moduleId, instanceId }),
      mutateAsync: () => deleteMutation.mutateAsync({ moduleId, instanceId }),
      isPending: deleteMutation.isPending,
      isError: deleteMutation.isError,
      error: deleteMutation.error,
    },
  }
}
