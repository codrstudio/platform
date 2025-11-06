/**
 * JQEL Query Structure
 *
 * SPEC References:
 * - SPEC-JQEL-STR-002: Query structure
 * - SPEC-JQEL-STR-003:006: Required fields
 */
export interface JQELQuery {
  // Required
  schema: string;

  // One of these is required
  select?: string;
  mutate?: string;

  // Optional
  action?: string;
  where?: Record<string, any>;
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: Array<Record<string, 'asc' | 'desc'>>;
  };
  values?: Record<string, any>;
  output?: string[];
  except?: string[];
}

/**
 * JResult Response Envelope
 *
 * SPEC References:
 * - SPEC-JQEL-RES-001:020: JResult format
 */
export interface JResult<T = any> {
  code: number;              // HTTP status code (REQUIRED)
  message?: string;          // Error/success message (optional for 200)
  field?: string;            // Field that caused error (validation)
  data?: T[];                // ALWAYS array, even single record
  warnings?: JResultWarning[];
}

export interface JResultWarning {
  code: number;
  message: string;
  field?: string;
}

/**
 * Reserved schema names
 *
 * SPEC References:
 * - SPEC-CH-DA-018:021: Schema routing
 */
export const RESERVED_SCHEMAS = {
  PLATFORM: 'platform',   // Processed by n8n Backbone
  BACKEND: 'backend',     // Processed by Express Backend
  SYSTEM: 'system',       // Configurable (default: backend)
} as const;

export type ReservedSchema = typeof RESERVED_SCHEMAS[keyof typeof RESERVED_SCHEMAS];

/**
 * Schema routing types
 */
export type SchemaType = 'backend' | 'platform' | 'system' | 'application';

/**
 * JQEL request context
 *
 * Contains metadata about the request for authorization and logging.
 */
export interface JqelContext {
  userId?: string;          // From JWT (if authenticated)
  jwt?: string;             // Access token (if authenticated)
  ipAddress?: string;       // Client IP address
  userAgent?: string;       // Client user agent
}
