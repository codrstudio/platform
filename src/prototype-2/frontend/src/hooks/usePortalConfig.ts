// Hook to fetch portal configuration
// Based on SPEC-data-access.md JQEL integration with TanStack Query

import { useQuery } from '@tanstack/react-query';
import { fetchPortalConfig } from '../services/jqel/portalQueries';
import type { Portal } from '../types/portal';

interface UsePortalConfigResult {
  portal: Portal | null;
  loading: boolean;
  error: Error | null;
}

export function usePortalConfig(portalId: string): UsePortalConfigResult {
  const { data, isLoading, error } = useQuery<Portal, Error>({
    queryKey: ['portal', portalId],
    queryFn: () => fetchPortalConfig(portalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
  });

  return {
    portal: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
