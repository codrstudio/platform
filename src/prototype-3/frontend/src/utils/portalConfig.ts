/**
 * Portal Configuration Utilities
 *
 * Helper functions to check portal configuration and requirements.
 * Based on SPEC-C-M-004, SPEC-R-RP-001, SPEC-R-RP-009.
 */

import type { Portal } from '@/types/portal';

/**
 * Check if a portal requires authentication
 *
 * SPEC-R-RP-001: Routes MAY require authentication (not MUST)
 * SPEC-R-RP-009: Protection is module responsibility
 * SPEC-C-M-004: Modules must be explicitly activated per portal
 *
 * Logic:
 * 1. If portal.requiresAuth is explicitly set, use that value
 * 2. Otherwise, check if 'auth' module is in portal.activeModules
 * 3. If auth module is active, portal requires authentication
 * 4. If auth module is not active, portal is public (no auth required)
 *
 * This allows:
 * - Public websites without authentication (no auth module)
 * - Protected portals with authentication (auth module active)
 * - Explicit override via requiresAuth field if needed
 *
 * @param portal - Portal configuration
 * @returns true if portal requires authentication, false otherwise
 *
 * @example
 * // Public portal (no auth module)
 * const portal = { portalId: 'public', activeModules: [] };
 * portalRequiresAuth(portal); // returns false
 *
 * @example
 * // Protected portal (auth module active)
 * const portal = { portalId: 'admin', activeModules: ['auth', 'users'] };
 * portalRequiresAuth(portal); // returns true
 *
 * @example
 * // Explicit override
 * const portal = { portalId: 'special', activeModules: ['auth'], requiresAuth: false };
 * portalRequiresAuth(portal); // returns false (explicit override)
 */
export function portalRequiresAuth(portal: Portal): boolean {
  // Explicit configuration takes precedence
  if (portal.requiresAuth !== undefined) {
    return portal.requiresAuth;
  }

  // Default: portal requires auth if 'auth' module is active
  return portal.activeModules.includes('auth');
}

/**
 * Check if a module is active in a portal
 *
 * SPEC-C-M-004: Modules must be explicitly activated
 * SPEC-C-M-006: Inactive modules should not be loaded
 *
 * @param portal - Portal configuration
 * @param moduleId - Module identifier to check
 * @returns true if module is active in portal, false otherwise
 *
 * @example
 * const portal = { portalId: 'main', activeModules: ['auth', 'users'] };
 * isModuleActive(portal, 'auth'); // returns true
 * isModuleActive(portal, 'billing'); // returns false
 */
export function isModuleActive(portal: Portal, moduleId: string): boolean {
  return portal.activeModules.includes(moduleId);
}

/**
 * Get list of active module IDs for a portal
 *
 * @param portal - Portal configuration
 * @returns Array of active module IDs
 *
 * @example
 * const portal = { portalId: 'main', activeModules: ['auth', 'users', 'settings'] };
 * getActiveModules(portal); // returns ['auth', 'users', 'settings']
 */
export function getActiveModules(portal: Portal): string[] {
  return [...portal.activeModules];
}
