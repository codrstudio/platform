/**
 * Instance Form Validation Schema
 *
 * Zod schema for instance creation/editing forms.
 * Implements validation rules from SPEC-module-setup.md SPEC-MS-VA-010:013
 *
 * Now supports dynamic config validation based on module schemas.
 */

import { z } from 'zod';
import { createConfigSchema } from '../validation/configSchemaValidator';
import type { ModuleConfigSchema } from '../types/schema';

/**
 * Base instance form validation schema (without config validation)
 */
const baseInstanceSchema = z.object({
  instanceId: z
    .string()
    .min(1, 'Instance ID is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Instance ID must contain only lowercase letters, numbers, and hyphens'
    )
    .refine(
      (id) => id.length >= 2,
      'Instance ID must be at least 2 characters long'
    ),

  portalId: z
    .string()
    .min(1, 'Portal is required'),

  moduleId: z
    .string()
    .min(1, 'Module is required'),

  config: z
    .record(z.string(), z.unknown())
    .default({}),

  active: z
    .boolean()
    .default(true),
});

/**
 * Default instance schema (without module-specific config validation)
 * Use this when module schema is not available
 */
export const instanceSchema = baseInstanceSchema;

/**
 * Creates instance schema with module-specific config validation
 *
 * @param configSchema - Optional module config schema for validation
 * @returns Zod schema with appropriate config validation
 *
 * @example
 * const schema = createInstanceSchema(module.configSchema);
 * const result = schema.safeParse(formData);
 */
export function createInstanceSchema(configSchema?: ModuleConfigSchema) {
  const configValidation = createConfigSchema(configSchema);

  return baseInstanceSchema.extend({
    config: configValidation,
  });
}

/**
 * Infer TypeScript type from Zod schema
 */
export type InstanceFormData = z.infer<typeof baseInstanceSchema>;
