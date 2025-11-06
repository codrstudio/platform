/**
 * Portal Types
 *
 * Type definitions for portal configuration and structure.
 * Based on SPEC-C-P-001 to SPEC-C-P-010.
 */

/**
 * Portal configuration
 *
 * SPEC-C-P-001: Portal is an isolated sub-application
 * SPEC-C-P-003: Portal has unique ID and human-readable name
 */
export interface Portal {
  /**
   * Unique portal identifier (used in URL routing)
   */
  portalId: string;

  /**
   * Human-readable portal name
   */
  name: string;

  /**
   * Optional portal description
   */
  description?: string;

  /**
   * Optional icon name (Lucide icon name or URL)
   */
  icon?: string;

  /**
   * Whether this portal is active and accessible
   */
  active: boolean;

  /**
   * Whether this portal can be removed
   * SPEC-C-P-019: Every portal must have a removable property
   * SPEC-C-P-020: Portal "main" must have removable=false
   */
  removable: boolean;

  /**
   * List of module IDs activated in this portal
   * SPEC-C-P-008: Portal configures which modules are active
   */
  activeModules: string[];

  /**
   * Whether this portal requires authentication
   * SPEC-R-RP-001: Routes MAY require authentication (not MUST)
   * SPEC-R-RP-009: Protection is module responsibility
   * If undefined, defaults to checking if 'auth' module is in activeModules
   */
  requiresAuth?: boolean;

  /**
   * Optional settings-key for portal-specific theming
   * SPEC-TH-BR-001: Brand color can be customized per portal
   * SPEC-C-P-015: Each portal must have a settings-key configuration
   */
  settingsKey?: string;

  /**
   * Optional metadata for extensibility
   */
  metadata?: Record<string, unknown>;
}

/**
 * Portal API response wrapper
 */
export interface PortalResponse {
  success: boolean;
  data?: Portal;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Portal list API response
 */
export interface PortalListResponse {
  success: boolean;
  data?: Portal[];
  error?: {
    code: string;
    message: string;
  };
}
