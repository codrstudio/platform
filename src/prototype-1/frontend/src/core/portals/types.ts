/**
 * Portal Types
 * Defines Portal structure and configuration
 * SPEC-C-P-* compliance
 */

/**
 * Portal Definition
 * Represents an isolated sub-application within the platform
 */
export interface Portal {
  portalId: string; // Unique ID (e.g., "main", "setup")
  name: string; // Display name
  path: string; // Route path ("/" for main, "/:portalId" for others)
  settingsKey: string; // Theme configuration key
  removable: boolean; // Can be deleted?
  activeModules: string[]; // Array of active module IDs
  metadata?: Record<string, any>; // Additional configuration
}

/**
 * Portal Configuration
 * Runtime configuration for a portal
 */
export interface PortalConfig {
  portal: Portal;
  theme?: string; // Active theme
  settings?: Record<string, any>; // Portal-specific settings
}

/**
 * Portal Context
 * Context available to components within a portal
 */
export interface PortalContext {
  portalId: string;
  portal: Portal;
  config: PortalConfig;
}
