// Portal Types
// Based on SPEC-concepts.md and SPEC-routing.md

/**
 * Portal - Isolated sub-application within the platform
 * SPEC-C-P-001 to SPEC-C-P-028
 * BREAKING CHANGE: settingsKey replaced with realmId (Realm System)
 */
export interface Portal {
  portalId: string;           // Unique identifier
  name: string;               // Display name
  description?: string;       // Optional description
  realmId: string;            // Realm this portal belongs to (default: "default")
  activeModules: string[];    // List of active module IDs
  removable: boolean;         // Can be deleted
  metadata?: Record<string, unknown>;
}

/**
 * Route definition from module
 * SPEC-R-RM-005 to SPEC-R-RM-015
 */
export interface RouteDefinition {
  path: string;               // Relative path (e.g., "/chat", "/dashboard")
  component: React.ComponentType<any>;
  exact?: boolean;
  index?: boolean;
  children?: RouteDefinition[];
}

/**
 * Portal route configuration
 */
export interface PortalRouteConfig {
  portalId: string;
  basePath: string;           // "/" for main, "/:portalId" for others
  routes: RouteDefinition[];
}

/**
 * Route match result
 */
export interface RouteMatch {
  portalId: string;
  path: string;
  params: Record<string, string>;
}
