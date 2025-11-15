// Portal JQEL Hooks
// CRUD operations + helpers for Portal entity

import { useMemo } from 'react'
import type { Portal } from '@/types/portal'
import { useJQELQuery, useJQELList, useJQELInsert, useJQELUpdate, useJQELDelete } from '../useJQEL'

/**
 * CRUD Hooks
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
 * Helper Hooks
 */

/**
 * Hook para verificar se um portal existe na plataforma.
 *
 * Usa useJQELQuery para cache automático (5 minutos) e invalidação
 * automática quando portais são modificados.
 *
 * @param portalId - ID do portal a verificar
 * @returns Objeto com estado da query (data, isLoading, error)
 *
 * @example
 * ```tsx
 * const { data: setupExists } = usePortalExists('setup');
 *
 * {setupExists && (
 *   <Link to="/setup">Ir para Setup</Link>
 * )}
 * ```
 */
export function usePortalExists(portalId: string) {
  const query = useJQELQuery<Portal[]>({
    schema: 'backend',
    select: 'portal',
    where: { portalId: { $eq: portalId } },
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos (antigo cacheTime)
    enabled: !!portalId,       // Só executa se portalId estiver definido
  })

  const exists = useMemo(() => {
    return Array.isArray(query.data?.data) && query.data.data.length > 0
  }, [query.data])

  return {
    ...query,
    data: exists
  }
}

/**
 * Hook para gerenciar homepage do portal
 *
 * @param portalId - ID do portal
 * @returns Funções para verificar e configurar homepage
 */
export function usePortalHomepage(portalId: string) {
  const { data: portalResult } = usePortal(portalId)
  const updatePortal = useUpdatePortal()

  const portal = portalResult?.data?.[0]

  const isHomepage = (path: string): boolean => {
    return portal?.homepage?.type === 'subroute' && portal.homepage.value === path
  }

  const setHomepage = async (path: string): Promise<void> => {
    await updatePortal.mutateAsync({
      values: {
        homepage: {
          type: 'subroute',
          value: path
        }
      },
      where: { portalId: { $eq: portalId } }
    })
  }

  const clearHomepage = async (): Promise<void> => {
    await updatePortal.mutateAsync({
      values: {
        homepage: {
          type: 'none'
        }
      },
      where: { portalId: { $eq: portalId } }
    })
  }

  return {
    homepage: portal?.homepage,
    isHomepage,
    setHomepage,
    clearHomepage
  }
}
