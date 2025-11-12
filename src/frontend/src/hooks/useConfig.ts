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

interface Instance {
  instanceId: string;
  portalId: string;
  moduleId: string;
  config: Record<string, unknown>;
  active: boolean;
  metadata?: Record<string, unknown>;
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
 * Fetch instances for a portal using JQEL
 */
async function fetchInstances(portalId: string): Promise<Instance[]> {
  try {
    const response = await fetch(`/api/jqel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema: 'backend',
        select: 'instance',
        where: {
          portalId: { $eq: portalId }
        }
      }),
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch instances:', error);
    return [];
  }
}

/**
 * Fetch portal configuration using JQEL
 */
async function fetchPortal(portalId: string): Promise<Portal | null> {
  try {
    const response = await fetch(`/api/jqel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema: 'backend',
        select: 'portal',
        where: {
          portalId: { $eq: portalId }
        }
      }),
    });

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
    // JQEL returns array, get first item
    const portal = result.data?.[0];

    if (!portal) {
      // Portal not found - return default (no modules active)
      return {
        portalId,
        name: portalId,
        activeModules: [],
        realmId: 'default',
        removable: true,
      };
    }

    return portal;
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

  const { data: portal, isLoading: portalLoading, error: portalError } = useQuery({
    queryKey: ['portal', portalId],
    queryFn: () => fetchPortal(portalId),
    staleTime: 0, // Always fetch fresh data for now
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  const { data: instances, isLoading: instancesLoading } = useQuery({
    queryKey: ['instances', portalId],
    queryFn: () => fetchInstances(portalId),
    staleTime: 0, // Always fetch fresh data for now
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  return {
    portal,
    portalId,
    instances: instances || [],
    isLoading: portalLoading || instancesLoading,
    error: portalError,
    hasModule: (moduleId: string) => {
      return portal?.activeModules.includes(moduleId) ?? false;
    },
    hasActiveInstance: (moduleId: string) => {
      if (!instances) return false;
      return instances.some(
        (instance) => instance.moduleId === moduleId && instance.active === true
      );
    },
    getActiveAuthInstance: () => {
      if (!instances) return null;
      return instances.find(
        (instance) => instance.moduleId === 'auth' && instance.active === true
      ) || null;
    },
  };
}
