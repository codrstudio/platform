/**
 * Portal Form Validation Schema
 *
 * Zod schema for portal creation/editing forms.
 * Implements validation rules from SPEC-module-setup.md SPEC-MS-VA-001:006
 */

import { z } from 'zod';

// Reserved routes that portals cannot use
const RESERVED_ROUTES = ['/health', '/api', '/assets'];

/**
 * Portal form validation schema
 *
 * Validation rules:
 * - portalId: Required, lowercase alphanumeric with hyphens (SPEC-MS-VA-002)
 * - name: Required, min 1 character
 * - description: Optional string
 * - path: Required, must start with '/', not reserved route (SPEC-MS-VA-003, SPEC-MS-VA-004)
 * - removable: Boolean, default true
 * - settingsKey: Optional, alphanumeric, default "default" (SPEC-C-P-016)
 */
export const portalSchema = z.object({
  portalId: z
    .string()
    .min(1, 'Portal ID is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Portal ID must contain only lowercase letters, numbers, and hyphens'
    )
    .refine(
      (id) => id.length >= 2,
      'Portal ID must be at least 2 characters long'
    ),

  name: z
    .string()
    .min(1, 'Portal name is required')
    .max(100, 'Portal name must not exceed 100 characters'),

  description: z
    .string()
    .optional(),

  path: z
    .string()
    .min(1, 'Route path is required')
    .refine(
      (path) => path.startsWith('/'),
      'Route path must start with /'
    )
    .refine(
      (path) => !RESERVED_ROUTES.some((reserved) => path.startsWith(reserved)),
      `Route path cannot start with ${RESERVED_ROUTES.join(', ')}`
    ),

  removable: z
    .boolean()
    .optional(),

  settingsKey: z
    .string()
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Settings key must contain only letters, numbers, hyphens, and underscores'
    )
    .optional(),

  // Optional fields for edit mode
  activeModules: z.array(z.string()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Infer TypeScript type from Zod schema
 */
export type PortalFormData = z.infer<typeof portalSchema>;
