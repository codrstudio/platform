import React from 'react';
import { RouteDefinition, RegisteredRoute } from './types';
import { addPortalRoutes, getPortalRoutes, setPortalRoutes, clearPortalRoutes } from './routeRegistry';
import { prefixRoutes } from './prefixRoutes';
import { RouteLoading } from '../../components/loading';
import RouteSuspense from './RouteSuspense';

export interface RegisterRoutesOptions {
  moduleId?: string;
  replace?: boolean; // If true, replace routes instead of append
}

/**
 * Register routes for a portal from a module
 *
 * @param portalId - Portal identifier
 * @param routes - Array of route definitions from module
 * @param options - Registration options
 */
export function registerRoutes(
  portalId: string,
  routes: RouteDefinition[],
  options: RegisterRoutesOptions = {}
): void {
  try {
    // Validate inputs
    if (!portalId) {
      console.warn('[registerRoutes] Invalid portalId:', portalId);
      return;
    }

    if (!Array.isArray(routes) || routes.length === 0) {
      console.warn('[registerRoutes] No routes to register for portal:', portalId);
      return;
    }

    // Convert RouteDefinition to RegisteredRoute (RouteObject)
    const registeredRoutes: RegisteredRoute[] = routes.map(route =>
      convertToRouteObject(route, options.moduleId)
    );

    // Apply portal prefix
    const prefixedRoutes = prefixRoutes(portalId, registeredRoutes);

    // Update registry
    addPortalRoutes(portalId, prefixedRoutes);

    // Debug log
    if (import.meta.env.DEV) {
      console.log(
        `[registerRoutes] Registered ${routes.length} route(s) for portal "${portalId}"`,
        options.moduleId ? `from module "${options.moduleId}"` : ''
      );
    }
  } catch (error) {
    console.error('[registerRoutes] Error registering routes:', error);
  }
}

/**
 * Convert RouteDefinition to RouteObject with lazy loading support
 */
function convertToRouteObject(
  route: RouteDefinition,
  moduleId?: string
): RegisteredRoute {
  // Wrap in Suspense with loading fallback
  // Pass the route component as children to RouteSuspense
  const element = React.createElement(
    RouteSuspense,
    {
      moduleName: moduleId,
      fallback: React.createElement(RouteLoading, { moduleName: moduleId }),
      children: React.createElement(route.component)
    }
  );

  return {
    path: route.path,
    element,
    moduleId,
    requiresAuth: route.requiresAuth,
    permissions: route.permissions,
    layout: route.layout,
  };
}

/**
 * Unregister routes for a portal
 * Used when module is deactivated or portal is unmounted
 *
 * @param portalId - Portal identifier
 * @param moduleId - Optional module ID to remove only routes from specific module
 */
export function unregisterRoutes(portalId: string, moduleId?: string): void {
  if (moduleId) {
    // Remove only routes from specific module
    const routes = getPortalRoutes(portalId);
    const filtered = routes.filter(r => r.moduleId !== moduleId);
    setPortalRoutes(portalId, filtered);

    if (import.meta.env.DEV) {
      console.log(`[unregisterRoutes] Removed routes for module "${moduleId}" from portal "${portalId}"`);
    }
  } else {
    // Remove all routes for portal
    clearPortalRoutes(portalId);

    if (import.meta.env.DEV) {
      console.log(`[unregisterRoutes] Cleared all routes for portal "${portalId}"`);
    }
  }
}
