/**
 * Routing Types
 *
 * Type definitions for routing configuration and structure.
 * Based on SPEC-R-STR-001 to SPEC-R-PRI-006.
 */

import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Route definition for React Router
 *
 * SPEC-R-STR-001: Routes follow portal isolation pattern
 */
export interface RouteDefinition {
  /**
   * Route path (relative to portal prefix)
   */
  path: string;

  /**
   * Route component (lazy-loaded)
   */
  component: LazyExoticComponent<ComponentType<any>>;

  /**
   * Whether this route requires authentication
   * SPEC-AU-FR-001: Protected routes require valid JWT
   */
  protected?: boolean;

  /**
   * Child routes (nested routing)
   */
  children?: RouteDefinition[];

  /**
   * Route index (for nested route defaults)
   */
  index?: boolean;
}

/**
 * Portal route configuration
 *
 * SPEC-R-STR-001: Main portal uses "/", others use "/:portalId/*"
 */
export interface PortalRouteConfig {
  /**
   * Portal ID
   */
  portalId: string;

  /**
   * Base path for this portal
   * - Main portal: "/"
   * - Other portals: "/:portalId"
   */
  basePath: string;

  /**
   * Routes available in this portal
   */
  routes: RouteDefinition[];

  /**
   * Whether this portal is the main portal
   */
  isMain: boolean;
}

/**
 * Route match result
 */
export interface RouteMatch {
  /**
   * Matched portal ID
   */
  portalId: string;

  /**
   * Matched route path
   */
  path: string;

  /**
   * Route parameters
   */
  params: Record<string, string>;
}
