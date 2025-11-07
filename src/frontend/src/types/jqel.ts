// JQEL Types
// Based on SPEC-jqel-syntax.md and SPEC-data-access.md

/**
 * JQEL Query Structure
 * SPEC-JQEL-STR-001 to SPEC-JQEL-STR-006
 */

// WHERE conditions operators
export interface JQELWhereCondition {
  $eq?: unknown;
  $ne?: unknown;
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $in?: unknown[];
  $nin?: unknown[];
  $like?: string;
  $ilike?: string;
  $null?: boolean;
  $between?: [number, number];
}

export type JQELWhere = {
  [field: string]: JQELWhereCondition | unknown;
} & {
  $and?: JQELWhere[];
  $or?: JQELWhere[];
  $not?: JQELWhere;
};

// ORDER BY
export interface JQELOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// Query options
export interface JQELOptions {
  limit?: number;
  offset?: number;
  orderBy?: JQELOrderBy[];
}

/**
 * SELECT Query
 * SPEC-JQEL-SEL-001 to SPEC-JQEL-SEL-006
 */
export interface JQELSelectQuery {
  schema: string;           // SPEC-JQEL-SCH-001
  select: string;           // Entity name (singular, snake_case)
  action?: string;          // Optional transformation
  where?: JQELWhere;
  options?: JQELOptions;
  output?: string[];        // Fields to return
  except?: string[];        // Fields to exclude
}

/**
 * MUTATE Query (insert, update, delete)
 * SPEC-JQEL-MU-001 to SPEC-JQEL-MU-006
 */
export interface JQELMutateQuery {
  schema: string;
  mutate: string;           // Entity name
  action: 'insert' | 'update' | 'delete' | 'custom';
  values?: Record<string, unknown>;
  where?: JQELWhere;
  options?: JQELOptions;
  output?: string[];
  except?: string[];
}

/**
 * Union type for all JQEL queries
 */
export type JQELQuery = JQELSelectQuery | JQELMutateQuery;

/**
 * JResult - Standard response format
 * SPEC-JQEL-RES-001 to SPEC-JQEL-RES-009
 */
export interface JResult<T = unknown> {
  code: number;             // HTTP-like status code
  message?: string;         // Success/error message
  data?: T;                 // Response data
  field?: string;           // Error field (if applicable)
  count?: number;           // Total count (for paginated queries)
  metadata?: Record<string, unknown>;
}

/**
 * JQEL Error
 * SPEC-DA-W-009 to SPEC-DA-W-011
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
  }
}

/**
 * Query Key Factory Types
 * SPEC-DA-TQ-005 to SPEC-DA-TQ-008
 */
export type JQELQueryKey = [string, string, ...unknown[]];
