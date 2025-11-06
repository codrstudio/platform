/**
 * useHealth Hook
 *
 * React hook for monitoring system health with auto-refresh.
 *
 * SPEC-module-setup.md (SPEC-MS-PS-010 to SPEC-MS-PS-016)
 * SPEC-MS-PS-015: Periodic health check updates (every 30 seconds)
 * SPEC-MS-PS-016: Last check timestamp
 */

import { useQuery } from '@tanstack/react-query';
import { healthClient, type DetailedHealth } from '../services/health/healthClient.js';

/**
 * Query key for health checks
 */
const HEALTH_QUERY_KEY = ['health', 'detailed'] as const;

/**
 * Options for useHealth hook
 */
export interface UseHealthOptions {
  /**
   * Enable auto-refresh
   * Default: true
   */
  autoRefresh?: boolean;

  /**
   * Refresh interval in milliseconds
   * Default: 30000 (30 seconds)
   * SPEC-MS-PS-015: Auto-refresh every 30 seconds
   */
  refetchInterval?: number;

  /**
   * Refetch on window focus
   * Default: true
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Refetch on mount
   * Default: true
   */
  refetchOnMount?: boolean;
}

/**
 * useHealth hook return type
 */
export interface UseHealthReturn {
  /**
   * Detailed health data
   */
  data: DetailedHealth | undefined;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: Error | null;

  /**
   * Is fetching/refetching
   */
  isFetching: boolean;

  /**
   * Manually refresh health check
   */
  refresh: () => Promise<void>;

  /**
   * Last check timestamp (from query data)
   */
  lastCheck: string | null;

  /**
   * Overall system status
   */
  systemStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

  /**
   * Backend status
   */
  backendStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

  /**
   * Redis status
   */
  redisStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

  /**
   * n8n status
   */
  n8nStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}

/**
 * Hook for monitoring system health with auto-refresh
 *
 * SPEC-MS-PS-015: Periodic health check updates (every 30 seconds)
 * SPEC-MS-PS-016: Last check timestamp
 *
 * Features:
 * - Auto-refresh every 30 seconds (configurable)
 * - Manual refresh capability
 * - Loading and error states
 * - Individual service status extraction
 *
 * @param options - Hook options
 * @returns Health query result with additional helpers
 *
 * @example
 * ```typescript
 * const {
 *   data: health,
 *   isLoading,
 *   error,
 *   systemStatus,
 *   refresh
 * } = useHealth({ autoRefresh: true });
 * ```
 */
export function useHealth(options: UseHealthOptions = {}): UseHealthReturn {
  const {
    autoRefresh = true,
    refetchInterval = 30000, // 30 seconds (SPEC-MS-PS-015)
    refetchOnWindowFocus = true,
    refetchOnMount = true,
  } = options;

  const query = useQuery<DetailedHealth, Error>({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: healthClient.fetchDetailed,
    refetchInterval: autoRefresh ? refetchInterval : false,
    refetchOnWindowFocus,
    refetchOnMount,
    // Don't retry on errors (health endpoint should be fast or fail)
    retry: false,
    // Keep data fresh
    staleTime: 0,
    // Cache for 5 minutes in case of errors
    gcTime: 5 * 60 * 1000,
  });

  // Manual refresh function
  const refresh = async () => {
    await query.refetch();
  };

  // Extract last check timestamp
  const lastCheck = query.data?.timestamp || null;

  // Extract system status
  const systemStatus = query.data?.status || 'unknown';

  // Extract individual service statuses
  const backendStatus = query.data?.services?.backend?.status || 'unknown';
  const redisStatus = query.data?.services?.redis?.status || 'unknown';
  const n8nStatus = query.data?.services?.n8n?.status || 'unknown';

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isFetching: query.isFetching,
    refresh,
    lastCheck,
    systemStatus,
    backendStatus,
    redisStatus,
    n8nStatus,
  };
}

/**
 * Hook for basic health check (no auto-refresh)
 *
 * Simpler version without auto-refresh for one-time checks.
 *
 * @returns Health query result
 */
export function useBasicHealth() {
  return useQuery({
    queryKey: ['health', 'basic'],
    queryFn: healthClient.fetchBasic,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}
