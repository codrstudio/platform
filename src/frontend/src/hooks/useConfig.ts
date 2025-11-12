// Configuration Hook
// Provides access to portal configuration (modules, instances)

import { useLocation } from 'react-router-dom';
import { useJQELQuery } from './useJQEL';

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
 * useConfig Hook
 *
 * Provides access to current portal configuration
 */
export function useConfig() {
  const location = useLocation();
  const portalId = getCurrentPortalId(location.pathname);

  // Fetch portal configuration using useJQELQuery
  const { data: portalResult, isLoading: portalLoading, error: portalError } = useJQELQuery<Portal[]>(
    {
      schema: 'backend',
      select: 'portal',
      where: {
        portalId: { $eq: portalId }
      }
    },
    {
      staleTime: 0, // Always fetch fresh data for now
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    }
  );

  // Fetch instances using useJQELQuery
  const { data: instancesResult, isLoading: instancesLoading } = useJQELQuery<Instance[]>(
    {
      schema: 'backend',
      select: 'instance',
      where: {
        portalId: { $eq: portalId }
      }
    },
    {
      staleTime: 0, // Always fetch fresh data for now
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    }
  );

  // Extract portal from result (first item or default)
  const portal = portalResult?.data?.[0] || {
    portalId,
    name: portalId,
    activeModules: [],
    realmId: 'default',
    removable: true,
  };

  // Extract instances from result
  const instances = instancesResult?.data || [];

  return {
    portal,
    portalId,
    instances,
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
