import { RegisteredRoute } from './types';

/**
 * Prefix routes with portal path
 * - Portal "main": No prefix (routes stay as-is)
 * - Other portals: Prefix with /:portalId
 *
 * @param portalId - Portal identifier
 * @param routes - Array of routes to prefix
 * @returns Array of routes with prefixed paths
 */
export function prefixRoutes(
  portalId: string,
  routes: RegisteredRoute[]
): RegisteredRoute[] {
  // Portal "main" has no prefix
  if (portalId === 'main') {
    return routes;
  }

  // Other portals: prefix with /:portalId
  return routes.map(route => prefixRoute(portalId, route));
}

/**
 * Recursively prefix a single route and its children
 * @param portalId - Portal identifier
 * @param route - Route to prefix
 * @returns Route with prefixed path
 */
function prefixRoute(portalId: string, route: RegisteredRoute): RegisteredRoute {
  const prefixedPath = prefixPath(portalId, route.path);

  // Recursively prefix child routes
  const children = route.children
    ? route.children.map((child: RegisteredRoute) => prefixRoute(portalId, child))
    : undefined;

  return {
    ...route,
    path: prefixedPath,
    children,
  };
}

/**
 * Prefix a single path with portal ID
 * @param portalId - Portal identifier
 * @param path - Path to prefix
 * @returns Prefixed path
 */
function prefixPath(portalId: string, path?: string): string {
  if (!path) return `/${portalId}`;

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `/${portalId}/${cleanPath}`;
}
