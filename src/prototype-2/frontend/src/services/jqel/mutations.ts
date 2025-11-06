// File: frontend/src/services/jqel/mutations.ts
// JQEL mutation functions

import { jqelQuery } from './client';
import type {
  JQELQuery,
  MutationQueryOptions,
  WhereClause,
} from '../../types/jqel';

/**
 * Insert a new record
 *
 * SPEC References:
 * - SPEC-JQEL-MUT-001:003: MUTATE structure
 * - SPEC-JQEL-MUT-004: INSERT action
 * - SPEC-DA-MU-001:004: Mutation function structure
 *
 * @param schema - Schema name (e.g., "backend", "sac")
 * @param entity - Entity name (e.g., "portal", "usuario")
 * @param values - Data to insert
 * @param options - Query options (output projection)
 * @returns Created record
 */
export async function insertRecord<T = unknown>(
  schema: string,
  entity: string,
  values: Record<string, unknown>,
  options?: MutationQueryOptions
): Promise<T> {
  const query: JQELQuery = {
    schema,
    mutate: entity,
    action: 'insert',
    values,
    ...options,
  };

  // SPEC-JQEL-RES-013: data is always array
  const data = await jqelQuery<T>(query);

  // Return first item (single insert)
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update existing record(s)
 *
 * SPEC References:
 * - SPEC-JQEL-MUT-004: UPDATE action requires WHERE
 * - SPEC-DA-MU-001:004: Mutation function structure
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param where - WHERE clause to identify record(s)
 * @param values - Data to update
 * @param options - Query options (output projection)
 * @returns Updated record(s)
 */
export async function updateRecord<T = unknown>(
  schema: string,
  entity: string,
  where: WhereClause,
  values: Record<string, unknown>,
  options?: MutationQueryOptions
): Promise<T> {
  const query: JQELQuery = {
    schema,
    mutate: entity,
    action: 'update',
    where,
    values,
    ...options,
  };

  const data = await jqelQuery<T>(query);

  // Return first item (single update) or all items (bulk update)
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Delete existing record(s)
 *
 * SPEC References:
 * - SPEC-JQEL-MUT-004: DELETE action requires WHERE
 * - SPEC-DA-MU-001:004: Mutation function structure
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param where - WHERE clause to identify record(s)
 * @param options - Query options (output projection)
 * @returns Deleted record(s) info
 */
export async function deleteRecord<T = unknown>(
  schema: string,
  entity: string,
  where: WhereClause,
  options?: MutationQueryOptions
): Promise<T> {
  const query: JQELQuery = {
    schema,
    mutate: entity,
    action: 'delete',
    where,
    ...options,
  };

  const data = await jqelQuery<T>(query);

  return Array.isArray(data) ? data[0] : data;
}

/**
 * Upsert record (update or insert)
 *
 * SPEC References:
 * - SPEC-JQEL-MUT-004: UPSERT action
 * - SPEC-DA-MU-001:004: Mutation function structure
 *
 * @param schema - Schema name
 * @param entity - Entity name
 * @param values - Data to insert/update
 * @param where - Optional WHERE clause for update matching
 * @param options - Query options (output projection)
 * @returns Upserted record
 */
export async function upsertRecord<T = unknown>(
  schema: string,
  entity: string,
  values: Record<string, unknown>,
  where?: WhereClause,
  options?: MutationQueryOptions
): Promise<T> {
  const query: JQELQuery = {
    schema,
    mutate: entity,
    action: 'upsert',
    values,
    ...(where && { where }),
    ...options,
  };

  const data = await jqelQuery<T>(query);

  return Array.isArray(data) ? data[0] : data;
}
