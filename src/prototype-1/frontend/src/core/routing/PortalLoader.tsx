/**
 * Portal Loader Component
 * Loads portal configuration and renders portal router
 * SPEC-R-* compliance
 */

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortalRoutes } from './usePortalRoutes';
import { PortalRouter } from './PortalRouter';
import { moduleLoader } from '../modules/ModuleLoader';
import type { RouteObject } from 'react-router-dom';

interface PortalLoaderProps {
  portalId?: string; // Optional: If not provided, read from URL params
}

/**
 * Portal Loader Component
 * Fetches portal config, loads modules, and renders routes
 */
export function PortalLoader({ portalId: propPortalId }: PortalLoaderProps) {
  const params = useParams<{ portalId?: string }>();
  const portalId = propPortalId || params.portalId || 'main';

  const { portal, isLoading, error } = usePortalRoutes(portalId);
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [moduleError, setModuleError] = useState<Error | null>(null);

  // Load module routes when portal is loaded
  useEffect(() => {
    if (!portal || !portal.activeModules || portal.activeModules.length === 0) {
      setRoutes([]);
      return;
    }

    const loadModuleRoutes = async () => {
      setIsLoadingModules(true);
      setModuleError(null);

      try {
        // Load all active modules
        const manifests = await moduleLoader.loadModules(portal.activeModules);

        // Extract routes from manifests
        const extractedRoutes: RouteObject[] = [];

        for (const manifest of manifests) {
          if (manifest.exports.routes) {
            for (const routeExport of manifest.exports.routes) {
              extractedRoutes.push({
                path: routeExport.path,
                element: <routeExport.element />,
              });
            }
          }
        }

        setRoutes(extractedRoutes);
      } catch (err) {
        console.error('Failed to load module routes:', err);
        setModuleError(err as Error);
      } finally {
        setIsLoadingModules(false);
      }
    };

    loadModuleRoutes();
  }, [portal]);

  // Show loading skeleton
  if (isLoading || isLoadingModules) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {isLoading ? 'Loading portal...' : 'Loading modules...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || moduleError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Portal Load Error</h1>
          <p className="text-destructive mb-4">
            {error?.message || moduleError?.message || 'Failed to load portal'}
          </p>
          <p className="text-sm text-muted-foreground">
            Portal ID: <code className="bg-muted px-2 py-1 rounded">{portalId}</code>
          </p>
        </div>
      </div>
    );
  }

  // Show portal not found
  if (!portal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Portal Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The portal "{portalId}" does not exist or is not accessible.
          </p>
        </div>
      </div>
    );
  }

  // Render portal router with loaded routes
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PortalRouter routes={routes} portal={portal} />
    </Suspense>
  );
}
