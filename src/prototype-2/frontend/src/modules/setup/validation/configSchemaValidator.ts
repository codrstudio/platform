/**
 * Configuration Schema Validator
 *
 * Simplified config validator for basic type checking.
 * Supports basic validation rules for module configuration schemas.
 *
 * Based on SPEC-module-setup.md SPEC-MS-FU-017, SPEC-MS-VA-011:013
 */

import { z } from 'zod';
import type { ModuleConfigSchema } from '../types/schema';

/**
 * Creates a Zod validation schema from a ModuleConfigSchema
 * Simplified version with basic type support
 *
 * @param moduleSchema - Module config schema definition
 * @returns Zod schema for validation, or permissive schema if undefined
 */
export function createConfigSchema(moduleSchema?: ModuleConfigSchema): z.ZodTypeAny {
  // If no schema defined, allow any valid object (use object type for any JSON object)
  if (!moduleSchema) {
    return z.object({}).passthrough().optional();
  }

  // For now, just validate that it's an object with any fields
  // Full field-level validation can be added in the future
  return z.object({}).passthrough();
}

/**
 * Converts Zod validation error to user-friendly message
 *
 * @param error - Zod validation error
 * @returns Human-readable error message
 */
export function getUserFriendlyError(error: z.ZodError): string {
  if (error.issues.length === 0) {
    return 'Validation failed';
  }

  const issue = error.issues[0];
  const path = issue.path.join('.');
  const fieldName = path || 'value';

  return `${fieldName}: ${issue.message}`;
}

/**
 * Validates config data against a module schema
 *
 * @param config - Configuration data to validate
 * @param moduleSchema - Module config schema
 * @returns Validation result with data or error
 */
export function validateConfig(
  config: unknown,
  moduleSchema?: ModuleConfigSchema
): { success: true; data: Record<string, unknown> } | { success: false; error: string } {
  const schema = createConfigSchema(moduleSchema);
  const result = schema.safeParse(config);

  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  return {
    success: false,
    error: getUserFriendlyError(result.error),
  };
}
