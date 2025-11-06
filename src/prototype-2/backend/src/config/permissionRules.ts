export interface PermissionRules {
  /** Whether this schema requires authentication */
  requireAuth: boolean;

  /** Optional: List of entities that are public even if schema requires auth */
  publicEntities?: string[];

  /** Optional: List of entities that always require authentication */
  protectedEntities?: string[];
}

/**
 * Schema-specific permission requirements
 *
 * SPEC References:
 * - SPEC-DA-AUTH-001:004: Queries can require authentication
 * - SPEC-DA-PERM-001:005: Queries can require specific permissions
 */
const permissionRules: Record<string, PermissionRules> = {
  /**
   * Backend schema: Auth controlled by module activation
   * Contains platform configuration (portals, modules, instances)
   * Auth only enforced when auth module is active
   */
  backend: {
    requireAuth: false,
    // Auth enforcement will be dynamic based on active modules (SISTEMA 2.1)
  },

  /**
   * Platform schema: Auth controlled by module activation
   * General platform operations, user management, etc.
   */
  platform: {
    requireAuth: false,
    // Optional: Some entities might be public (e.g., public documentation)
    publicEntities: [],
  },

  /**
   * System schema: Auth controlled by module activation
   * System-level operations and configurations
   */
  system: {
    requireAuth: false,
  },

  /**
   * Default rules for application schemas
   * Application schemas are public by default unless overridden
   */
  default: {
    requireAuth: false,
    // Application-specific schemas may have protected entities
    // This can be overridden per schema in future
  },
};

/**
 * Get permission rules for a schema
 */
export function getPermissionRules(schema: string): PermissionRules {
  // Check for exact match first
  if (permissionRules[schema]) {
    return permissionRules[schema];
  }

  // Fall back to default
  return permissionRules.default;
}

/**
 * Check if schema requires authentication
 */
export function requiresAuthentication(schema: string): boolean {
  const rules = getPermissionRules(schema);
  return rules.requireAuth;
}

/**
 * Check if entity is public within a schema
 */
export function isPublicEntity(schema: string, entity: string): boolean {
  const rules = getPermissionRules(schema);

  // If schema doesn't require auth, all entities are public
  if (!rules.requireAuth) {
    return true;
  }

  // If schema requires auth, check public entity list
  if (rules.publicEntities && rules.publicEntities.includes(entity)) {
    return true;
  }

  // Otherwise, entity requires auth
  return false;
}

export default permissionRules;

