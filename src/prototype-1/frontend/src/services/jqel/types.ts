/**
 * JQEL Types
 * JSON Query Expression Language
 * SPEC-DA-*, SPEC-JQEL-*
 */

// JQEL WHERE Clause Operators
export type JQELOperator =
  | 'eq' // Equal
  | 'ne' // Not equal
  | 'gt' // Greater than
  | 'gte' // Greater than or equal
  | 'lt' // Less than
  | 'lte' // Less than or equal
  | 'like' // SQL LIKE pattern
  | 'in' // IN array
  | 'nin' // NOT IN array
  | 'null' // IS NULL
  | 'nnull'; // IS NOT NULL

// Logical operators
export type JQELLogical = 'and' | 'or' | 'not';

// WHERE Condition - Recursive structure
export type JQELWhere =
  | {
      // Field conditions
      [field: string]:
        | { [operator in JQELOperator]?: any }
        | JQELWhere
        | any; // Direct value implies 'eq'
    }
  | {
      // Logical conditions
      and?: JQELWhere[];
      or?: JQELWhere[];
      not?: JQELWhere;
    };

// ORDER BY Clause
export type JQELOrderBy = Record<string, 'asc' | 'desc'>;

// Query Options
export interface JQELOptions {
  limit?: number; // Max records (default 1000)
  offset?: number; // Skip records
  orderBy?: JQELOrderBy[]; // Sort order
}

// Main JQEL Query Interface
export interface JQELQuery {
  schema: string; // "backend", "platform", "system", or app schema

  // SELECT query
  select?: string; // Entity to select

  // MUTATE query
  mutate?: string; // Entity to mutate
  action?: 'insert' | 'update' | 'delete' | string; // Mutation action

  // Common clauses
  where?: JQELWhere; // Filter conditions
  values?: Record<string, any>; // Values for mutations
  options?: JQELOptions; // Query options

  // Projections
  output?: string[]; // Fields to return
  except?: string[]; // Fields to exclude
}

// JResult Response Format
export interface JResult<T = any> {
  code: number; // HTTP status code
  message: string; // Human-readable message
  data?: T; // Response data
  field?: string; // Field with error (for validation)
  errors?: Array<{
    // Multiple errors
    field: string;
    message: string;
  }>;
}

// Query Key Factory Return Type
export type JQELQueryKey = readonly [string, ...any[]];
