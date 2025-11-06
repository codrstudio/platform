// JQEL type definitions
// Based on SPEC-jqel-syntax.md and SPEC-data-access.md

/**
 * WHERE Clause Operators
 *
 * SPEC References:
 * - SPEC-JQEL-WHE-004: Relational operators
 * - SPEC-JQEL-WHE-006: IN operator
 * - SPEC-JQEL-WHE-009: LIKE operator
 */
export interface WhereOperators {
  $eq?: unknown;
  $ne?: unknown;
  $gt?: unknown;
  $gte?: unknown;
  $lt?: unknown;
  $lte?: unknown;
  $in?: unknown[];
  $like?: string;
}

export interface WhereClause {
  [field: string]: WhereOperators | WhereClause | WhereClause[] | undefined;
  $or?: WhereClause[];
  $not?: WhereClause;
}

export interface JQELQuery {
  schema: string;
  select?: string;
  mutate?: string;
  action?: 'insert' | 'update' | 'delete' | 'upsert' | string;
  where?: WhereClause;
  values?: Record<string, unknown>;
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: Array<{ field: string; order: 'asc' | 'desc' }>;
  };
  output?: string[];
  except?: string[];
}

/**
 * JQEL Result envelope - matches backend format
 * Based on SPEC-JQEL-RES-001:020
 */
export interface JResult<T = any> {
  /** HTTP status code (200, 400, 404, 500, etc.) */
  code: number;
  /** Error or success message (optional for 200) */
  message?: string;
  /** Field that caused validation error (for 400) */
  field?: string;
  /** Query result - ALWAYS array, even for single record */
  data?: T[];
  /** Non-critical warnings */
  warnings?: JResultWarning[];
}

export interface JResultWarning {
  code: number;
  message: string;
  field?: string;
}

/**
 * Mutation Query Options
 *
 * SPEC References:
 * - SPEC-JQEL-PRJ-001:017: Projection (output/except)
 */
export interface MutationQueryOptions {
  output?: string[];
  except?: string[];
}

/**
 * Mutation Variables by Action Type
 *
 * SPEC References:
 * - SPEC-JQEL-MUT-004:005: Action requirements
 */
export interface InsertVariables {
  values: Record<string, unknown>;
}

export interface UpdateVariables {
  where: WhereClause;
  values: Record<string, unknown>;
}

export interface DeleteVariables {
  where: WhereClause;
}

export interface UpsertVariables {
  values: Record<string, unknown>;
  where?: WhereClause; // Optional for upsert
}

/**
 * Hook Options
 */
export interface UseMutationOptions<TData, TVariables> {
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onError?: (error: Error, variables: TVariables, context: unknown) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: unknown) => void;
}
