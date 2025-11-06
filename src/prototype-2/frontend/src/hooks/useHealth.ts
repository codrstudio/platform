import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { healthClient, type HealthStatus } from '../services/health/healthClient';

/**
 * useHealth Hook
 *
 * TanStack Query hook for health checks with automatic polling.
 * Provides real-time health status for platform services.
 *
 * Features:
 * - Auto-refetch every 60 seconds
 * - Retry with exponential backoff (3 attempts)
 * - Stale time of 30 seconds
 * - Hierarchical query keys for cache management
 *
 * SPEC References:
 * - SPEC-MS-HE-001:009: Health check monitoring
 * - SPEC-MS-PS-014:016: Platform Settings health indicators
 *
 * @param service - Service to monitor ('n8n', 'redis', 'backend')
 * @returns TanStack Query result with health status
 *
 * @example
 * const { data, isLoading, error } = useHealth('n8n');
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 * return <HealthIndicator status={data.status} />;
 */
export function useHealth(
  service: 'n8n' | 'redis' | 'backend'
): UseQueryResult<HealthStatus, Error> {
  return useQuery({
    queryKey: ['health', service],
    queryFn: () => healthClient.check(service),
    staleTime: 30000, // 30 seconds - data stays fresh
    refetchInterval: 60000, // Refetch every 60 seconds
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000), // Exponential backoff
  });
}
