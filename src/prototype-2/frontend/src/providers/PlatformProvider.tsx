/**
 * PlatformProvider - Platform state management
 *
 * Based on SPEC-frontend-state.md SPEC-FS-PL-001:013
 *
 * Features (Task 1.9):
 * - Platform state management (SPEC-FS-PL-001:007)
 * - Portal list management (SPEC-FS-PL-008:010)
 * - Module list management (SPEC-FS-PL-011:013)
 * - Current portal detection from URL
 * - Loaded modules tracking in memory
 * - Active modules per portal
 * - Cache invalidation on portal/module changes
 *
 * Usage:
 * ```tsx
 * <PlatformProvider>
 *   <App />
 * </PlatformProvider>
 * ```
 *
 * Consuming components use the `usePlatform()` hook to access platform state.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useJQELQuery } from '../services/jqel/hooks/useJQELQuery';
import type { Portal } from '../types/portal';

interface PlatformContextValue {
  portals: Portal[];
  currentPortal: string;
  loadedModules: Set<string>;
  activeModules: Map<string, string[]>;
  isLoading: boolean;
  error: Error | null;
  setCurrentPortal: (portalId: string) => void;
  markModuleLoaded: (moduleId: string) => void;
  markModuleUnloaded: (moduleId: string) => void;
  getActiveModulesForPortal: (portalId: string) => string[];
  isModuleLoaded: (moduleId: string) => boolean;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

/**
 * Extract portal ID from current URL pathname
 * Works without React Router hooks (can be used before Router is mounted)
 */
function getPortalIdFromPath(pathname: string): string {
  // Root path "/" maps to "main" portal
  if (pathname === '/') return 'main';

  // Other paths like "/setup" or "/setup/whatever" extract first segment
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] || 'main';
}

/**
 * PlatformProvider Component
 *
 * Manages global platform state and provides platform methods to the application
 */
export function PlatformProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Current portal detection from URL
  const [currentPortal, setCurrentPortalState] = useState<string>(() =>
    getPortalIdFromPath(window.location.pathname)
  );

  // Loaded modules tracking (in-memory only)
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set());

  // Listen for URL changes (for when user navigates between portals)
  useEffect(() => {
    const handleLocationChange = () => {
      const newPortalId = getPortalIdFromPath(window.location.pathname);
      if (newPortalId !== currentPortal) {
        setCurrentPortalState(newPortalId);
      }
    };

    // Listen to both popstate (back/forward) and custom navigation events
    window.addEventListener('popstate', handleLocationChange);

    // For client-side navigation, we'll check on interval (React Router doesn't fire popstate)
    const intervalId = setInterval(handleLocationChange, 500);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(intervalId);
    };
  }, [currentPortal]);

  /**
   * Load all portals via JQEL
   * Based on SPEC-STATE-P-003
   */
  const {
    data: portalsData,
    isLoading: portalsLoading,
    error: portalsError,
  } = useJQELQuery<Portal>(
    {
      schema: 'backend',
      select: 'portal',
      output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable', 'settingsKey'],
    },
    {
      // Override default to get all portals (not just first)
      select: (data) => data,
      staleTime: 10 * 60 * 1000, // 10 minutes (platform config changes rarely)
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Extract portals array from query result
  const portals: Portal[] = useMemo(() => {
    return Array.isArray(portalsData) ? portalsData : [];
  }, [portalsData]);

  // Build active modules map (portalId → moduleIds[])
  const activeModules: Map<string, string[]> = useMemo(() => {
    const map = new Map<string, string[]>();

    portals.forEach((portal) => {
      map.set(portal.portalId, portal.activeModules || []);
    });

    return map;
  }, [portals]);

  /**
   * Set current portal and invalidate relevant queries
   */
  const setCurrentPortal = useCallback(
    (portalId: string) => {
      setCurrentPortalState(portalId);

      // Invalidate queries that depend on current portal
      // This ensures fresh data when switching portals
      queryClient.invalidateQueries({
        queryKey: ['backend', 'portal'],
      });
    },
    [queryClient]
  );

  /**
   * Mark module as loaded in memory
   */
  const markModuleLoaded = useCallback((moduleId: string) => {
    setLoadedModules((prev) => {
      const newSet = new Set(prev);
      newSet.add(moduleId);
      return newSet;
    });
  }, []);

  /**
   * Mark module as unloaded (remove from memory tracking)
   */
  const markModuleUnloaded = useCallback((moduleId: string) => {
    setLoadedModules((prev) => {
      const newSet = new Set(prev);
      newSet.delete(moduleId);
      return newSet;
    });
  }, []);

  /**
   * Get active modules for a specific portal
   */
  const getActiveModulesForPortal = useCallback(
    (portalId: string): string[] => {
      return activeModules.get(portalId) || [];
    },
    [activeModules]
  );

  /**
   * Check if module is loaded in memory
   */
  const isModuleLoaded = useCallback(
    (moduleId: string): boolean => {
      return loadedModules.has(moduleId);
    },
    [loadedModules]
  );

  // Context value (optimized with useMemo to prevent unnecessary re-renders)
  const value = useMemo<PlatformContextValue>(
    () => ({
      portals,
      currentPortal,
      loadedModules,
      activeModules,
      isLoading: portalsLoading,
      error: portalsError,
      setCurrentPortal,
      markModuleLoaded,
      markModuleUnloaded,
      getActiveModulesForPortal,
      isModuleLoaded,
    }),
    [
      portals,
      currentPortal,
      loadedModules,
      activeModules,
      portalsLoading,
      portalsError,
      setCurrentPortal,
      markModuleLoaded,
      markModuleUnloaded,
      getActiveModulesForPortal,
      isModuleLoaded,
    ]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

/**
 * Hook to access platform context
 * Throws error if used outside PlatformProvider
 *
 * @returns Platform context value with current platform state and methods
 * @throws Error if used outside PlatformProvider
 */
export function usePlatform(): PlatformContextValue {
  const context = useContext(PlatformContext);

  if (context === undefined) {
    throw new Error(
      'usePlatform must be used within a PlatformProvider. ' +
      'Wrap your component tree with <PlatformProvider>.'
    );
  }

  return context;
}
