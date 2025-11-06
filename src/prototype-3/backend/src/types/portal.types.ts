/**
 * Portal Types (Backend)
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
   * Whether this portal is active and accessible
   */
  active: boolean;

  /**
   * List of module IDs activated in this portal
   * SPEC-C-P-008: Portal configures which modules are active
   */
  activeModules: string[];

  /**
   * Optional settings-key for portal-specific theming
   * SPEC-TH-BR-001: Brand color can be customized per portal
   */
  settingsKey?: string;

  /**
   * Optional metadata for extensibility
   */
  metadata?: Record<string, unknown>;
}
