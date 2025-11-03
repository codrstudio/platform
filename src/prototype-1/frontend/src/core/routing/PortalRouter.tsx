/**
 * Portal Router Component
 * Renders dynamic routes for a portal
 * SPEC-R-* compliance
 */

import { Routes, Route, Link } from 'react-router-dom';
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { Portal } from '../portals/types';

interface PortalRouterProps {
  routes: RouteObject[];
  portal: Portal;
}

/**
 * Portal Router Component
 * Renders routes with Suspense and error boundaries
 */
export function PortalRouter({ routes, portal }: PortalRouterProps) {
  // If no routes, show empty state
  if (routes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">{portal.name}</h1>
          <p className="text-muted-foreground">
            No modules are active in this portal.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Visit{' '}
            <Link
              to="/setup"
              className="inline-flex items-center bg-success/10 text-success hover:bg-success/20 px-2 py-1 rounded font-mono font-medium transition-colors"
            >
              /setup
            </Link>{' '}
            to activate modules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={route.path || index}
          path={route.path}
          element={
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }
            >
              {route.element}
            </Suspense>
          }
        />
      ))}

      {/* Catch-all route for 404 within portal */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
              <p className="text-muted-foreground">
                The requested page does not exist in this portal.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Portal: <code className="bg-muted px-2 py-1 rounded">{portal.name}</code>
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
