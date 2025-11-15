// Realm JQEL Hooks
// CRUD operations for Realm entity

import { useQueryClient } from '@tanstack/react-query'
import type { Realm } from '@/types/realm'
import type { JQELMutateQuery } from '@/types/jqel'
import { useJQELQuery, useJQELList, useJQELInsert, useJQELUpdate, useJQELMutation } from '../useJQEL'

/**
 * Get all realms
 */
export function useRealms() {
  return useJQELList<Realm>('backend', 'realm')
}

/**
 * Get realm by ID
 * NOTE: Returns Realm[] (array) because JQEL always returns arrays
 * Access single realm with: realm.data?.[0]
 */
export function useRealm(realmId: string) {
  return useJQELQuery<Realm[]>({
    schema: 'backend',
    select: 'realm',
    where: { realmId: { $eq: realmId } },
  }, {
    enabled: !!realmId,
  })
}

/**
 * Create realm mutation
 */
export function useCreateRealm() {
  return useJQELInsert<Realm>('backend', 'realm')
}

/**
 * Update realm mutation
 */
export function useUpdateRealm() {
  return useJQELUpdate<Realm>('backend', 'realm')
}

/**
 * Delete realm mutation
 * Invalidates both realms and portals cache since portals reference realms
 */
export function useDeleteRealm() {
  const queryClient = useQueryClient()

  return useJQELMutation<null, { where: JQELMutateQuery['where'] }>(
    {
      schema: 'backend',
      mutate: 'realm',
      action: 'delete',
    },
    {
      onSuccess: () => {
        // Invalidate both realms and portals since portals reference realms
        queryClient.invalidateQueries({ queryKey: ['backend', 'realm'] })
        queryClient.invalidateQueries({ queryKey: ['backend', 'portal'] })
      },
    }
  )
}
