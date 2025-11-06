import { useJQELQuery } from '../../services/jqel/hooks/useJQELQuery';
import { queryKeys } from '../../services/jqel/queryKeys';
import type { Instance } from '../../types/module';
import type { UseJQELQueryOptions } from '../../services/jqel/hooks/types';

/**
 * Fetch all instances from backend schema
 *
 * @param portalId - Optional portal ID to filter by
 * @example
 * const { data: instances, isLoading } = useInstances();
 * const { data: portalInstances } = useInstances('main');
 */
export function useInstances(
  portalId?: string,
  options?: Omit<UseJQELQueryOptions<Instance[]>, 'queryKey'>
) {
  return useJQELQuery<Instance[]>(
    {
      schema: 'backend',
      select: 'instance',
      ...(portalId && { where: { portalId: { $eq: portalId } } }),
    },
    {
      queryKey: portalId ? queryKeys.backend.instances(portalId) : queryKeys.backend.instances(),
      select: (data) => data, // Return all items (not just first)
      ...options,
    }
  );
}

/**
 * Fetch single instance by ID
 *
 * @param instanceId - Instance ID to fetch
 * @example
 * const { data: instance, isLoading } = useInstance('setup-1');
 */
export function useInstance(instanceId: string, options?: Omit<UseJQELQueryOptions<Instance>, 'queryKey'>) {
  return useJQELQuery<Instance>(
    {
      schema: 'backend',
      select: 'instance',
      where: { instanceId: { $eq: instanceId } },
    },
    {
      queryKey: queryKeys.backend.instance(instanceId),
      enabled: !!instanceId, // Don't fetch if ID is empty
      ...options,
    }
  );
}

/**
 * Fetch instances for a specific portal
 *
 * @param portalId - Portal ID to fetch instances for
 * @example
 * const { data: instances } = usePortalInstances('main');
 */
export function usePortalInstances(
  portalId: string,
  options?: Omit<UseJQELQueryOptions<Instance[]>, 'queryKey'>
) {
  return useJQELQuery<Instance[]>(
    {
      schema: 'backend',
      select: 'instance',
      where: { portalId: { $eq: portalId } },
    },
    {
      queryKey: queryKeys.backend.instances(portalId),
      enabled: !!portalId, // Don't fetch if ID is empty
      select: (data) => data, // Return all items
      ...options,
    }
  );
}
