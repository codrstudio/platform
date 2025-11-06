/**
 * Setup Module Entry Point
 *
 * This is the main entry point for the Setup module.
 * Exports manifest, routes, and any public components/hooks.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-EX-007 to SPEC-MO-EX-011)
 * - SPEC-module-setup.md (SPEC-MS-EX-*)
 */

/**
 * SPEC-MO-EX-007: index.ts is the entry point
 * SPEC-MO-EX-009: Prefer named exports for clarity
 */

/** SPEC-MO-EX-010: Export module manifest */
export { manifest } from './manifest';

/** SPEC-MO-EX-010: Export route definitions */
export { routes } from './routes';

/**
 * SPEC-MS-EX-001: Export main components
 * These are the primary components that other modules may use
 */
export { default as SetupDashboard } from './pages/SetupDashboard';
export { default as PortalManagement } from './pages/PortalList';

/**
 * Module exports structure for compatibility
 * SPEC-MO-EX-011: Complete export format
 */
import { manifest } from './manifest';
import { routes } from './routes';

export default {
  manifest,
  routes,
};
