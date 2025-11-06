/**
 * JQEL (JSON Query Expression Language) Type Definitions
 *
 * Backend types for JQEL query processing and routing.
 *
 * Based on:
 * - SPEC-jqel-syntax.md (SPEC-JQEL-*)
 * - SPEC-data-access.md (SPEC-DA-*)
 */

// ============================================================================
// WHERE OPERATORS (SPEC-JQEL-WHE-004)
// ============================================================================

export interface WhereOperators {
  eq?: any;
  ne?: any;
  gt?: any;
  gte?: any;
  lt?: any;
  lte?: any;
  in?: any[];
  like?: string;
}

export interface WhereClause {
  [field: string]: WhereOperators | WhereClause | WhereClause[] | undefined;
  or?: WhereClause[];
  not?: WhereClause;
}

// ============================================================================
// OPTIONS (SPEC-JQEL-OPT-001)
// ============================================================================

export interface JQELOptions {
  limit?: number;
  offset?: number;
  orderBy?: Array<Record<string, 'asc' | 'desc'>>;
}

// ============================================================================
// JQEL QUERY (SPEC-JQEL-STR-002)
// ============================================================================

export interface JQELBaseQuery {
  schema: string;
  where?: WhereClause;
  options?: JQELOptions;
  output?: string[];
  except?: string[];
}

export interface JQELSelectQuery extends JQELBaseQuery {
  select: string;
  action?: string;
}

export interface JQELMutateQuery extends JQELBaseQuery {
  mutate: string;
  action: string;
  values?: Record<string, any>;
}

export type JQELQuery = JQELSelectQuery | JQELMutateQuery;

// ============================================================================
// JQEL RESPONSE (JResult) (SPEC-JQEL-RES-001)
// ============================================================================

export interface JResult<T = any> {
  code: number;
  message?: string;
  field?: string;
  data?: T[];
  warnings?: JResult[];
}

// ============================================================================
// AUTHORIZATION CONTEXT
// ============================================================================

export interface AuthorizationContext {
  portalId?: string;
  moduleId?: string;
  instanceId?: string;
  permission?: string;
  [key: string]: any;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isSelectQuery(query: JQELQuery): query is JQELSelectQuery {
  return 'select' in query;
}

export function isMutateQuery(query: JQELQuery): query is JQELMutateQuery {
  return 'mutate' in query;
}
