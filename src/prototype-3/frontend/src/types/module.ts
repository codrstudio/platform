/**
 * Module System Types
 *
 * This file defines TypeScript types for the module system.
 *
 * References:
 * - SPEC-concepts.md (SPEC-C-M-*)
 * - SPEC-modules.md (SPEC-MO-*)
 */

/**
 * Module type classification
 * SPEC-MO-MA-004
 */
export type ModuleType = 'components' | 'functionality';

/**
 * Route definition for a module
 * SPEC-MO-RO-003 to SPEC-MO-RO-009
 */
export interface ModuleRoute {
  /** Relative path (no portal prefix) - SPEC-MO-RO-010 */
  path: string;

  /** React component for this route */
  component: React.ComponentType;

  /** Whether this route requires authentication - SPEC-MO-RO-006 */
  requiresAuth?: boolean;

  /** Array of permissions required for this route - SPEC-MO-RO-007 */
  permissions?: string[];

  /** Optional layout component - SPEC-MO-RO-008 */
  layout?: React.ComponentType<{ children: React.ReactNode }>;

  /** Custom metadata - SPEC-MO-RO-009 */
  meta?: Record<string, unknown>;
}

/**
 * Module manifest metadata
 * SPEC-MO-MA-001 to SPEC-MO-MA-012
 */
export interface ModuleManifest {
  /** Unique module identifier (alphanumeric, no spaces) - SPEC-MO-MA-001, SPEC-MO-MA-005 */
  id: string;

  /** Human-readable module name - SPEC-MO-MA-002 */
  name: string;

  /** Semantic version - SPEC-MO-MA-003 */
  version: string;

  /** Module type classification - SPEC-MO-MA-004 */
  type: ModuleType;

  /** Module description - SPEC-MO-MA-007 */
  description?: string;

  /** Module author - SPEC-MO-MA-008 */
  author?: string;

  /** Array of moduleIds this module depends on - SPEC-MO-MA-009 */
  dependencies?: string[];

  /** Lucide icon name - SPEC-MO-MA-010 */
  icon?: string;

  /** Category for organization - SPEC-MO-MA-011 */
  category?: string;

  /** Custom metadata - SPEC-MO-MA-012 */
  meta?: Record<string, unknown>;
}

/**
 * Module exports structure
 * SPEC-MO-EX-001 to SPEC-MO-EX-011
 */
export interface ModuleExports {
  /** Module manifest - SPEC-MO-ST-007 */
  manifest: ModuleManifest;

  /** Route definitions (optional) - SPEC-MO-EX-001, SPEC-MO-RO-001 */
  routes?: ModuleRoute[];

  /** Exported components (optional) - SPEC-MO-EX-002 */
  components?: Record<string, React.ComponentType<any>>;

  /** Exported hooks (optional) - SPEC-MO-EX-003 */
  hooks?: Record<string, (...args: any[]) => any>;

  /** Exported utilities/functions (optional) - SPEC-MO-EX-004 */
  utils?: Record<string, (...args: any[]) => any>;

  /** Exported TypeScript types (optional) - SPEC-MO-EX-005 */
  types?: Record<string, unknown>;
}

/**
 * Module interface
 * SPEC-MO-ST-001 to SPEC-MO-ST-003
 */
export interface Module extends ModuleExports {
  /** Module ID from manifest */
  id: string;

  /** Module name from manifest */
  name: string;

  /** Module version from manifest */
  version: string;

  /** Module type from manifest */
  type: ModuleType;
}

/**
 * Instance configuration
 * SPEC-C-I-011 to SPEC-C-I-015
 */
export interface InstanceConfig {
  /** Unique instance identifier within portal - SPEC-C-I-002 */
  instanceId: string;

  /** Module ID this instance belongs to */
  moduleId: string;

  /** Portal ID where this instance is created */
  portalId: string;

  /** Instance-specific configuration (defined by module) - SPEC-MO-IN-001, SPEC-MO-IN-004 */
  config: Record<string, unknown>;

  /** Optional instance metadata */
  meta?: Record<string, unknown>;
}

/**
 * Module activation status in a portal
 * SPEC-C-M-004 to SPEC-C-M-010
 */
export interface ModuleActivation {
  /** Module ID */
  moduleId: string;

  /** Portal ID */
  portalId: string;

  /** Whether module is active in this portal */
  active: boolean;

  /** Timestamp of activation */
  activatedAt?: string;

  /** User who activated the module */
  activatedBy?: string;
}
