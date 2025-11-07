// Configuration Hook
// Provides access to portal configuration (modules, instances)

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

// BREAKING CHANGE: settingsKey replaced with realmId (Realm System)
interface Portal {
  portalId: string;
  name: string;
  activeModules: string[];
  realmId: string;
  removable: boolean;
}

/**
 * Get current portal ID from URL
 */
function getCurrentPortalId(pathname: string): string {
  // Main portal uses "/"
  if (pathname === '/' || pathname.startsWith('/?')) {
    return 'main';
  }

  // Other portals use "/:portalId/*"
  const match = pathname.match(/^\/([^/?]+)/);
  return match ? match[1] : 'main';
}

/**
 * Fetch portal configuration
 */
async function fetchPortal(portalId: string): Promise<Portal | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/config/portals/${portalId}`);

    if (!response.ok) {
      // Portal not found - return default (no modules active)
      return {
        portalId,
        name: portalId,
        activeModules: [],
        realmId: 'default',
        removable: true,
      };
    }

    const result = await response.json();

    // Backend returns JResult format: { code, data }
    return result.data || result;
  } catch (error) {
    console.error('Failed to fetch portal config:', error);
    // On error, return default (no modules active)
    return {
      portalId,
      name: portalId,
      activeModules: [],
      realmId: 'default',
      removable: true,
    };
  }
}

/**
 * useConfig Hook
 *
 * Provides access to current portal configuration
 */
export function useConfig() {
  const location = useLocation();
  const portalId = getCurrentPortalId(location.pathname);

  const { data: portal, isLoading, error } = useQuery({
    queryKey: ['portal', portalId],
    queryFn: () => fetchPortal(portalId),
    staleTime: 0, // Always fetch fresh data for now
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  return {
    portal,
    portalId,
    isLoading,
    error,
    hasModule: (moduleId: string) => {
      return portal?.activeModules.includes(moduleId) ?? false;
    },
  };
}
