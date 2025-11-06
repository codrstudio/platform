import { useJQELQuery } from '../../services/jqel/hooks/useJQELQuery';
import { queryKeys } from '../../services/jqel/queryKeys';
import type { Module } from '../../types/module';
import type { UseJQELQueryOptions } from '../../services/jqel/hooks/types';

/**
 * Fetch all modules from backend schema
 *
 * @example
 * const { data: modules, isLoading } = useModules();
 */
export function useModules(options?: Omit<UseJQELQueryOptions<Module[]>, 'queryKey'>) {
  return useJQELQuery<Module[]>(
    {
      schema: 'backend',
      select: 'module',
    },
    {
      queryKey: queryKeys.backend.modules(),
      select: (data) => data, // Return all items (not just first)
      ...options,
    }
  );
}

/**
 * Fetch single module by ID
 *
 * @param moduleId - Module ID to fetch
 * @example
 * const { data: module, isLoading } = useModule('setup');
 */
export function useModule(moduleId: string, options?: Omit<UseJQELQueryOptions<Module>, 'queryKey'>) {
  return useJQELQuery<Module>(
    {
      schema: 'backend',
      select: 'module',
      where: { moduleId: { $eq: moduleId } },
    },
    {
      queryKey: queryKeys.backend.module(moduleId),
      enabled: !!moduleId, // Don't fetch if ID is empty
      ...options,
    }
  );
}

/**
 * Fetch only active modules
 *
 * @example
 * const { data: activeModules } = useActiveModules();
 */
export function useActiveModules(options?: Omit<UseJQELQueryOptions<Module[]>, 'queryKey'>) {
  return useJQELQuery<Module[]>(
    {
      schema: 'backend',
      select: 'module',
      where: { active: { $eq: true } },
    },
    {
      queryKey: [...queryKeys.backend.modules(), 'active'] as const,
      select: (data) => data, // Return all items
      ...options,
    }
  );
}
