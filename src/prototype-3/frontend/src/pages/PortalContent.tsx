/**
 * Portal Content Page
 *
 * Renders module routes for the portal.
 * This component is lazy-loaded to reduce initial bundle size.
 */

import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import moduleRegistry from '@/core/modules/ModuleRegistry';
import type { Portal } from '@/types/portal';

export interface PortalContentProps {
  portal: Portal;
}

/**
 * Portal Content Component
 *
 * Renders module routes for the portal.
 * Gets routes from registered modules that are active in this portal.
 *
 * SPEC-R-LD-001: Loaded on demand when user navigates to portal routes.
 * SPEC-MO-LC-001: Modules loaded when portal activates them
 * SPEC-MO-RO-010: Module routes are relative to portal
 */
export function PortalContent({ portal }: PortalContentProps) {
  // Get all routes from modules active in this portal
  // SPEC-C-M-004: Modules must be explicitly activated
  const moduleRoutes = portal.activeModules.flatMap((moduleId) => {
    const moduleData = moduleRegistry.getModule(moduleId);
    if (!moduleData || !moduleData.routes) {
      return [];
    }
    return moduleData.routes;
  });

  // If no active modules or no routes, show placeholder
  if (moduleRoutes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Portal: {portal.name}</h1>
          <p className="mt-4 text-gray-600">No active modules with routes.</p>
          <p className="mt-2 text-sm text-gray-500">
            Active modules: {portal.activeModules.join(', ') || 'None'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Routes>
        {/* Render all module routes */}
        {moduleRoutes.map((route, index) => {
          const Component = route.component;
          return (
            <Route
              key={`${route.path}-${index}`}
              path={route.path}
              element={<Component />}
            />
          );
        })}

        {/* Fallback: redirect to first module's root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
