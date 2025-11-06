/**
 * Configuration Type Definitions
 *
 * Type definitions for Application Settings stored in JSON files.
 * These configurations are accessed via JQEL with schema="backend".
 *
 * SPEC References:
 * - SPEC-CF-AS-001:004: Application Settings storage
 * - SPEC-CF-AS-009: Configuration structure
 */

/**
 * Portal configuration
 *
 * Represents a sub-application within the platform.
 * Each portal has its own route and set of active modules.
 *
 * @property portalId - Unique portal identifier (e.g., "main", "setup")
 * @property name - Human-readable portal name
 * @property path - Route path (e.g., "/", "/setup")
 * @property settingsKey - Theme settings key for UI customization
 * @property active - Whether portal is enabled
 * @property activeModules - Array of module IDs active in this portal
 * @property createdAt - ISO 8601 timestamp of creation
 * @property updatedAt - ISO 8601 timestamp of last update
 */
export interface Portal {
  portalId: string;
  name: string;
  path: string;
  settingsKey: string;
  active: boolean;
  activeModules: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Module configuration
 *
 * Represents a reusable feature that can be activated in portals.
 * Modules can have dependencies on other modules.
 *
 * @property moduleId - Unique module identifier (e.g., "setup", "dashboard")
 * @property name - Human-readable module name
 * @property type - Module type: "functionality" (complete feature) or "component" (library)
 * @property version - Semantic version string (e.g., "1.0.0")
 * @property active - Whether module is available for activation
 * @property dependencies - Array of module IDs this module depends on
 * @property createdAt - ISO 8601 timestamp of creation
 * @property updatedAt - ISO 8601 timestamp of last update
 */
export interface Module {
  moduleId: string;
  name: string;
  type: 'functionality' | 'component';
  version: string;
  active: boolean;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Instance configuration
 *
 * Represents a specific activation of a module in a portal.
 * Each instance has its own configuration object.
 *
 * @property instanceId - Unique instance identifier within portal
 * @property portalId - Portal where module is activated
 * @property moduleId - Module being activated
 * @property config - Module-specific configuration object
 * @property active - Whether this instance is enabled
 * @property createdAt - ISO 8601 timestamp of creation
 * @property updatedAt - ISO 8601 timestamp of last update
 */
export interface Instance {
  instanceId: string;
  portalId: string;
  moduleId: string;
  config: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
