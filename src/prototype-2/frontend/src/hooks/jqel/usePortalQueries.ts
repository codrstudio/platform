import { useJQELQuery } from '../../services/jqel/hooks/useJQELQuery';
import { queryKeys } from '../../services/jqel/queryKeys';
import type { Portal } from '../../types/portal';
import type { UseJQELQueryOptions } from '../../services/jqel/hooks/types';

/**
 * Fetch all portals from backend schema
 *
 * @example
 * const { data: portals, isLoading } = usePortals();
 */
export function usePortals(options?: Omit<UseJQELQueryOptions<Portal[]>, 'queryKey'>) {
  return useJQELQuery<Portal[]>(
    {
      schema: 'backend',
      select: 'portal',
    },
    {
      queryKey: queryKeys.backend.portals(),
      select: (data) => data, // Return all items (not just first)
      ...options,
    }
  );
}

/**
 * Fetch single portal by ID
 *
 * @param portalId - Portal ID to fetch
 * @example
 * const { data: portal, isLoading } = usePortal('main');
 */
export function usePortal(portalId: string, options?: Omit<UseJQELQueryOptions<Portal>, 'queryKey'>) {
  return useJQELQuery<Portal>(
    {
      schema: 'backend',
      select: 'portal',
      where: { portalId: { $eq: portalId } },
    },
    {
      queryKey: queryKeys.backend.portal(portalId),
      enabled: !!portalId, // Don't fetch if ID is empty
      ...options,
    }
  );
}

/**
 * Fetch only active portals
 *
 * @example
 * const { data: activePortals } = useActivePortals();
 */
export function useActivePortals(options?: Omit<UseJQELQueryOptions<Portal[]>, 'queryKey'>) {
  return useJQELQuery<Portal[]>(
    {
      schema: 'backend',
      select: 'portal',
      where: { active: { $eq: true } },
    },
    {
      queryKey: [...queryKeys.backend.portals(), 'active'] as const,
      select: (data) => data, // Return all items
      ...options,
    }
  );
}
