/**
 * JQEL (JSON Query Expression Language) Type Definitions
 *
 * Based on:
 * - SPEC-jqel-syntax.md (SPEC-JQEL-*)
 * - SPEC-data-access.md (SPEC-DA-*)
 */

// ============================================================================
// WHERE OPERATORS (SPEC-JQEL-WHE-004)
// ============================================================================

/**
 * WHERE clause operators for filtering data
 * SPEC-JQEL-WHE-004: Relational operators
 */
export interface WhereOperators {
  eq?: any;        // Equal
  ne?: any;        // Not equal
  gt?: any;        // Greater than
  gte?: any;       // Greater than or equal
  lt?: any;        // Less than
  lte?: any;       // Less than or equal
  in?: any[];      // In list (SPEC-JQEL-WHE-006)
  like?: string;   // Pattern matching (SPEC-JQEL-WHE-009)
}

/**
 * WHERE clause structure
 * SPEC-JQEL-WHE-001: WHERE is object with conditions
 */
export interface WhereClause {
  [field: string]: WhereOperators | WhereClause | WhereClause[] | undefined;
  or?: WhereClause[];   // SPEC-JQEL-WHE-015: OR operator
  not?: WhereClause;    // SPEC-JQEL-WHE-018: NOT operator
}

// ============================================================================
// OPTIONS (SPEC-JQEL-OPT-001)
// ============================================================================

/**
 * Query options for pagination and sorting
 * SPEC-JQEL-OPT-003: OPTIONS structure
 */
export interface JQELOptions {
  limit?: number;                           // SPEC-JQEL-OPT-004: Max records
  offset?: number;                          // SPEC-JQEL-OPT-008: Pagination offset
  orderBy?: Array<Record<string, 'asc' | 'desc'>>;  // SPEC-JQEL-OPT-012: Sorting
}

// ============================================================================
// JQEL QUERY (SPEC-JQEL-STR-002)
// ============================================================================

/**
 * Base JQEL query structure
 * SPEC-JQEL-STR-002: Complete query structure
 */
export interface JQELBaseQuery {
  schema: string;           // SPEC-JQEL-STR-003: Schema is required
  where?: WhereClause;      // SPEC-JQEL-WHE-001: Optional filter
  options?: JQELOptions;    // SPEC-JQEL-OPT-001: Optional query options
  output?: string[];        // SPEC-JQEL-PRJ-001: Include fields
  except?: string[];        // SPEC-JQEL-PRJ-006: Exclude fields
}

/**
 * SELECT query (read operation)
 * SPEC-JQEL-SEL-001: SELECT structure
 */
export interface JQELSelectQuery extends JQELBaseQuery {
  select: string;           // SPEC-JQEL-SEL-001: Entity name
  action?: string;          // SPEC-JQEL-SEL-003: Optional action (views, reports)
}

/**
 * MUTATE query (write operation)
 * SPEC-JQEL-MUT-001: MUTATE structure
 */
export interface JQELMutateQuery extends JQELBaseQuery {
  mutate: string;           // SPEC-JQEL-MUT-001: Entity name
  action: string;           // SPEC-JQEL-MUT-002: Required action (insert, update, delete, upsert)
  values?: Record<string, any>;  // SPEC-JQEL-VAL-001: Data for insert/update/upsert
}

/**
 * Union type for all JQEL queries
 * SPEC-JQEL-STR-005: select and mutate are mutually exclusive
 */
export type JQELQuery = JQELSelectQuery | JQELMutateQuery;

// ============================================================================
// JQEL RESPONSE (JResult) (SPEC-JQEL-RES-001)
// ============================================================================

/**
 * Standard JResult envelope for all JQEL responses
 * SPEC-JQEL-RES-002: JResult structure
 */
export interface JResult<T = any> {
  code: number;             // SPEC-JQEL-RES-003: Required HTTP status code
  message?: string;         // SPEC-JQEL-RES-006: Optional message (required for errors)
  field?: string;           // SPEC-JQEL-RES-010: Field identifier for validation errors
  data?: T[];               // SPEC-JQEL-RES-013: Always array (even for single record)
  warnings?: JResult[];     // SPEC-JQEL-RES-017: Non-blocking warnings
}

// ============================================================================
// JQEL ERROR (SPEC-DA-W-009)
// ============================================================================

/**
 * JQEL-specific error class
 * SPEC-DA-W-011: JQELError structure
 */
export class JQELError extends Error {
  code: number;
  field?: string;
  jresult: JResult;

  constructor(jresult: JResult) {
    super(jresult.message || 'JQEL query failed');
    this.name = 'JQELError';
    this.code = jresult.code;
    this.field = jresult.field;
    this.jresult = jresult;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, JQELError.prototype);
  }

  /**
   * Check if error is a specific HTTP status code
   */
  isStatus(code: number): boolean {
    return this.code === code;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.code >= 400 && this.code < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.code >= 500 && this.code < 600;
  }

  /**
   * Check if error is related to a specific field
   */
  isFieldError(fieldName?: string): boolean {
    if (!this.field) return false;
    if (!fieldName) return true;
    return this.field === fieldName;
  }
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if query is a SELECT query
 */
export function isSelectQuery(query: JQELQuery): query is JQELSelectQuery {
  return 'select' in query;
}

/**
 * Type guard to check if query is a MUTATE query
 */
export function isMutateQuery(query: JQELQuery): query is JQELMutateQuery {
  return 'mutate' in query;
}

/**
 * Type guard to check if error is a JQELError
 */
export function isJQELError(error: unknown): error is JQELError {
  return error instanceof JQELError;
}

// ============================================================================
// QUERY KEY TYPES
// ============================================================================

/**
 * Query key structure for TanStack Query cache management
 * SPEC-DA-TQ-006: Format [schema, entity, params?]
 */
export type JQELQueryKey = [string, string, Record<string, any>?];
