// Portal Router - Injects module routes into React Router
// Based on SPEC-routing.md Route injection patterns

import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Portal } from '../../types/portal';
import type { ModuleExports } from '../../types/module';
import type { PrefixedRoute } from '../../types/routing';

interface PortalRouterProps {
  portal: Portal;
  modules: ModuleExports[];
}

export default function PortalRouter({ portal, modules }: PortalRouterProps) {
  // Extract and prefix routes from all modules
  const routes = useMemo(() => {
    const allRoutes: PrefixedRoute[] = [];

    modules.forEach(module => {
      if (!module.routes) return;

      module.routes.forEach(route => {
        // Prefix route with portal path
        // Main portal (/) should not have prefix
        // Other portals (/setup) should have prefix
        const prefixedPath = portal.portalId === 'main'
          ? route.path
          : route.path === '/'
            ? '' // Root of portal (e.g., /setup)
            : route.path; // Sub-route (e.g., /portals becomes /setup/portals)

        allRoutes.push({
          ...route,
          originalPath: route.path,
          prefixedPath,
        });
      });
    });

    return allRoutes;
  }, [portal, modules]);

  // Execute onActivate for all modules (on mount)
  React.useEffect(() => {
    modules.forEach(module => {
      if (module.onActivate) {
        module.onActivate(portal);
      }
    });

    // Cleanup: execute onDeactivate on unmount
    return () => {
      modules.forEach(module => {
        if (module.onDeactivate) {
          module.onDeactivate(portal);
        }
      });
    };
  }, [modules, portal]);

  // No routes - show empty portal
  if (routes.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>{portal.name}</h2>
        <p>No modules active in this portal.</p>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Portal ID: {portal.portalId}
        </p>
      </div>
    );
  }

  // Render routes
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={`${route.prefixedPath}-${index}`}
          path={route.prefixedPath}
          element={<route.component />}
        />
      ))}

      {/* 404 fallback for unmatched routes within portal */}
      <Route
        path="*"
        element={
          <div style={{ padding: '2rem' }}>
            <h2>Page Not Found</h2>
            <p>The requested page does not exist in {portal.name}.</p>
          </div>
        }
      />
    </Routes>
  );
}
