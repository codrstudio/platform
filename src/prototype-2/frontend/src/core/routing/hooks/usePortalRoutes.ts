import { useState, useEffect, useMemo } from 'react';
import { getPortalRoutes, subscribe } from '../routeRegistry';
import { RegisteredRoute } from '../types';

/**
 * Hook to get routes for a specific portal
 * Automatically updates when routes are registered/unregistered
 *
 * @param portalId - Portal identifier
 * @returns Array of routes for the portal
 */
export default function usePortalRoutes(portalId: string): RegisteredRoute[] {
  // Version counter to force re-render when registry changes
  const [version, setVersion] = useState(0);

  // Subscribe to registry changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setVersion(v => v + 1); // Force re-render
    });

    return unsubscribe;
  }, []);

  // Get routes and memoize
  const routes = useMemo(() => {
    return getPortalRoutes(portalId);
  }, [portalId, version]);

  return routes;
}
