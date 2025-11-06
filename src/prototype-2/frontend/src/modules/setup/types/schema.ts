/**
 * Schema Type Definitions
 *
 * Defines types for module configuration schemas.
 * Supports JSON Schema-like definitions with validation constraints.
 *
 * Based on SPEC-module-setup.md SPEC-MS-FU-017, SPEC-MS-VA-011:013
 */

/**
 * Supported field types for configuration schemas
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Field schema definition
 */
export interface FieldSchema {
  /**
   * Field type
   */
  type: FieldType;

  /**
   * Human-readable description of the field
   */
  description?: string;

  /**
   * Default value for the field
   */
  default?: unknown;

  // String constraints
  /**
   * Minimum string length (for type: 'string')
   */
  minLength?: number;

  /**
   * Maximum string length (for type: 'string')
   */
  maxLength?: number;

  /**
   * Regex pattern for string validation (for type: 'string')
   */
  pattern?: string;

  // Number constraints
  /**
   * Minimum value (for type: 'number')
   */
  min?: number;

  /**
   * Maximum value (for type: 'number')
   */
  max?: number;

  // Enum constraint (applicable to any type)
  /**
   * Allowed values (enum)
   */
  enum?: unknown[];

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;
}

/**
 * Module configuration schema
 */
export interface ModuleConfigSchema {
  /**
   * Schema type (always 'object' for config root)
   */
  type: 'object';

  /**
   * Property definitions
   */
  properties: Record<string, FieldSchema>;

  /**
   * Required property names
   */
  required?: string[];
}
