/**
 * Portal Validation Schemas
 *
 * Zod schemas for portal creation and editing validation.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-VA-001 to SPEC-MS-VA-006)
 * - SPEC-concepts.md (SPEC-C-P-002, SPEC-C-P-004, SPEC-C-P-015)
 * - SPEC-module-setup.md (SPEC-MS-UI-009 to SPEC-MS-UI-015)
 */

import { z } from 'zod';

/**
 * Portal ID validation
 *
 * SPEC-MS-VA-002: Portal ID must be alphanumeric (without spaces or special characters)
 * SPEC-C-P-002: Portal ID must be alphanumeric string without spaces, special characters or accents
 */
const portalIdSchema = z
  .string()
  .min(1, 'Portal ID is required')
  .max(50, 'Portal ID must be less than 50 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Portal ID must be lowercase alphanumeric with hyphens (e.g., "my-portal")'
  );

/**
 * Portal name validation
 */
const portalNameSchema = z
  .string()
  .min(1, 'Portal name is required')
  .max(100, 'Portal name must be less than 100 characters');

/**
 * Portal description validation (optional)
 */
const portalDescriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters')
  .optional();

/**
 * Settings key validation
 *
 * SPEC-MS-VA-006: Settings Key must be alphanumeric
 * SPEC-C-P-015: Each portal must have a settings-key configuration
 */
const settingsKeySchema = z
  .string()
  .min(1, 'Settings key is required')
  .max(50, 'Settings key must be less than 50 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Settings key must be lowercase alphanumeric with hyphens'
  )
  .default('default');

/**
 * Portal icon validation (optional)
 * Can be a Lucide icon name or URL to an icon
 */
const portalIconSchema = z
  .string()
  .max(100, 'Icon name/URL must be less than 100 characters')
  .optional();

/**
 * Removable flag validation
 *
 * SPEC-C-P-019: Every portal must have a removable property (boolean)
 * SPEC-C-P-020: Portal "main" must have removable=false
 */
const removableSchema = z.boolean().default(true);

/**
 * Complete portal creation schema
 *
 * SPEC-MS-FU-002: Allow creating new portal
 * SPEC-MS-UI-009: Form fields: Portal ID, Name, Route, Settings Key
 */
export const createPortalSchema = z.object({
  /**
   * Unique portal identifier
   * SPEC-MS-VA-001: Portal ID must be unique
   */
  portalId: portalIdSchema,

  /**
   * Human-readable portal name
   */
  name: portalNameSchema,

  /**
   * Optional description
   */
  description: portalDescriptionSchema,

  /**
   * Optional icon name (Lucide icon)
   */
  icon: portalIconSchema,

  /**
   * Settings key for theme configuration
   * SPEC-MS-UI-012: Explain concept of Settings Key
   */
  settingsKey: settingsKeySchema,

  /**
   * Whether portal can be removed
   * SPEC-MS-UI-014: Toggle for removable (disabled for "main")
   */
  removable: removableSchema,
});

/**
 * Portal update schema
 *
 * SPEC-MS-FU-003: Allow editing existing portal
 * Note: portalId and removable are immutable after creation
 */
export const updatePortalSchema = z.object({
  /**
   * Portal ID (read-only, used for identification)
   */
  portalId: portalIdSchema,

  /**
   * Human-readable portal name (editable)
   */
  name: portalNameSchema,

  /**
   * Description (editable)
   */
  description: portalDescriptionSchema,

  /**
   * Icon (editable)
   */
  icon: portalIconSchema,

  /**
   * Settings key (editable)
   * SPEC-MS-UI-013: Show which portals share Settings Key
   */
  settingsKey: settingsKeySchema,

  /**
   * Note: removable is NOT editable after creation
   */
});

/**
 * Infer TypeScript types from schemas
 */
export type CreatePortalInput = z.infer<typeof createPortalSchema>;
export type UpdatePortalInput = z.infer<typeof updatePortalSchema>;

/**
 * Validation helper: Check if portal ID is reserved
 *
 * SPEC-MS-VA-005: Portal "main" has special constraints
 */
export function isReservedPortalId(portalId: string): boolean {
  return portalId === 'main';
}

/**
 * Validation helper: Validate route format
 *
 * SPEC-MS-VA-003: Route must start with /
 * SPEC-MS-VA-004: Route must not conflict with static routes
 */
export function validatePortalRoute(portalId: string): string | null {
  // Main portal always uses root route
  if (portalId === 'main') {
    return '/';
  }

  // Other portals use /:portalId route
  const route = `/${portalId}`;

  // Check for conflicts with reserved routes
  const reservedRoutes = ['/api', '/health', '/assets', '/_', '/public'];
  const hasConflict = reservedRoutes.some((reserved) =>
    route.startsWith(reserved)
  );

  if (hasConflict) {
    return null; // Invalid route
  }

  return route;
}

/**
 * Validation helper: Check if portal ID already exists
 * This should be used in the form component to validate uniqueness
 *
 * SPEC-MS-VA-001: Portal ID must be unique
 */
export async function isPortalIdUnique(
  portalId: string,
  existingPortalIds: string[]
): Promise<boolean> {
  return !existingPortalIds.includes(portalId);
}

/**
 * Validation helper: Get portal route preview
 *
 * SPEC-MS-UI-015: Show preview of final route
 */
export function getPortalRoutePreview(portalId: string): string {
  if (portalId === 'main') {
    return '/ (root)';
  }
  return `/${portalId}`;
}
