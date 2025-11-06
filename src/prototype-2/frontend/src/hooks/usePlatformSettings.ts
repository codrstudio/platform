/**
 * usePlatformSettings Hook
 *
 * TanStack Query hook for fetching platform settings and service health.
 * Polls every 30 seconds to keep health status up-to-date.
 */

import { useQuery } from '@tanstack/react-query';
import type { PlatformSettingsResponse } from '../types/platformSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fetch platform settings from backend
 */
async function fetchPlatformSettings(): Promise<PlatformSettingsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/platform-settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch platform settings: ${response.status}`);
  }

  return response.json();
}

/**
 * Hook to fetch platform settings with automatic polling
 */
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: fetchPlatformSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds (for health checks)
  });
}
