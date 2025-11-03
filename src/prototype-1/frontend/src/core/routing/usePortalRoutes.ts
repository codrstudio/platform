/**
 * usePortalRoutes Hook
 * Fetches portal configuration and extracts routes from active modules
 * SPEC-R-* and SPEC-C-P-* compliance
 */

import { useMemo } from 'react';
import { useJQEL } from '@/services/jqel/jqelHooks';
import type { Portal } from '../portals/types';
import type { RouteObject } from 'react-router-dom';

interface UsePortalRoutesResult {
  routes: RouteObject[];
  portal: Portal | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch portal configuration and load module routes
 * @param portalId - Portal identifier
 * @returns Portal routes, portal data, loading state, and error
 */
export function usePortalRoutes(portalId: string): UsePortalRoutesResult {
  console.log('🚪 [Portal] usePortalRoutes called for:', portalId);

  // Fetch portal configuration from backend
  const {
    data: portalResult,
    isLoading,
    error,
  } = useJQEL<Portal[]>({
    schema: 'backend',
    select: 'portal',
    where: {
      portalId: { eq: portalId },
    },
  });

  console.log('🚪 [Portal] Query state:', {
    portalId,
    isLoading,
    hasError: !!error,
    hasData: !!portalResult
  });

  // Extract routes from portal configuration
  const routes = useMemo(() => {
    if (!portalResult?.data || portalResult.data.length === 0) {
      return [];
    }

    const portal = portalResult.data[0];
    const { activeModules } = portal;

    if (!activeModules || activeModules.length === 0) {
      return [];
    }

    // Load modules and extract routes
    // Note: This is synchronous for now, but should be handled differently
    // in production (e.g., via Suspense or separate loading state)
    const moduleRoutes: RouteObject[] = [];

    // For each active module, we need to load it and extract routes
    // This will be handled by the PortalLoader component
    // Here we just return the structure

    return moduleRoutes;
  }, [portalResult]);

  const portal = useMemo(() => {
    if (!portalResult?.data || portalResult.data.length === 0) {
      return null;
    }
    return portalResult.data[0];
  }, [portalResult]);

  return {
    routes,
    portal,
    isLoading,
    error: error as Error | null,
  };
}
