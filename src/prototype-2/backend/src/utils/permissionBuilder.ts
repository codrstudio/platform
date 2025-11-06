import type { JQELQuery } from '../types/jqel.types.js';

/**
 * Permission Builder Utilities
 *
 * Build permission strings from JQEL queries following the format:
 * {operation}.{entity}[.{action}]
 *
 * SPEC References:
 * - SPEC-AU-AZ-009:013: Permission format specification
 * - SPEC-DA-PERM-003: Permission based on schema, entity, action
 */

/**
 * Build permission string from JQEL query
 *
 * Format: "{operation}.{entity}[.{action}]"
 *
 * Examples:
 * - SELECT query: "select.users"
 * - MUTATE with action: "mutate.orders.approve"
 * - MUTATE insert: "mutate.orders.insert"
 *
 * @param query - JQEL query object
 * @returns Permission string
 */
export function buildPermissionFromQuery(query: JQELQuery): string {
  // Determine operation (select or mutate)
  const operation = query.select ? 'select' : 'mutate';

  // Get entity name
  const entity = query.select || query.mutate;
  if (!entity) {
    throw new Error('Query must have select or mutate field');
  }

  // Get action (for mutations only)
  const action = query.action;

  // Build permission string
  // Format: {operation}.{entity}[.{action}]
  if (operation === 'mutate' && action) {
    return `${operation}.${entity}.${action}`;
  }

  return `${operation}.${entity}`;
}

/**
 * Parse permission string into components
 *
 * Useful for debugging and logging.
 *
 * @param permission - Permission string (e.g., "select.users")
 * @returns Object with operation, entity, action
 */
export function parsePermission(permission: string): {
  operation: string;
  entity: string;
  action?: string;
} {
  const parts = permission.split('.');

  if (parts.length < 2) {
    throw new Error(`Invalid permission format: ${permission}`);
  }

  return {
    operation: parts[0],
    entity: parts[1],
    action: parts[2],
  };
}

/**
 * Check if permission is a wildcard (admin permission)
 *
 * @param permission - Permission string
 * @returns True if wildcard permission
 */
export function isWildcardPermission(permission: string): boolean {
  return permission === '*' || permission.endsWith('.*');
}
