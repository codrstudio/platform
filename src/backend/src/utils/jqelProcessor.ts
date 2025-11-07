// JQEL Processor - Generic JSON Query Executor
// Based on SPEC-jqel-syntax.md
//
// This utility executes JQEL queries on any JSON data (array of objects)
// Completely decoupled from storage - works with in-memory data

import type { JQELSelectQuery } from '../types/jqel.types.js'

/**
 * Execute a JQEL SELECT query on JSON data
 *
 * @param data - Array of objects to query
 * @param query - JQEL query to execute
 * @returns Filtered, sorted, and projected data
 *
 * @example
 * const users = [{ id: 1, name: 'Alice', age: 30 }, { id: 2, name: 'Bob', age: 25 }]
 * const result = executeJQELQuery(users, {
 *   schema: 'app',
 *   select: 'user',
 *   where: { age: { $gte: 25 } },
 *   options: { orderBy: [{ field: 'name', direction: 'asc' }] }
 * })
 */
export function executeJQELQuery<T = any>(
  data: T[],
  query: JQELSelectQuery
): T[] {
  let result = [...data]

  // Apply WHERE filter
  if (query.where) {
    result = applyWhere(result, query.where)
  }

  // Apply ORDER BY
  if (query.options?.orderBy) {
    result = applyOrderBy(result, query.options.orderBy)
  }

  // Apply LIMIT/OFFSET (pagination)
  result = applyPagination(result, query.options?.limit, query.options?.offset)

  // Apply OUTPUT/EXCEPT (projection)
  result = applyProjection(result, query.output, query.except)

  return result
}

/**
 * Apply WHERE conditions to filter data
 *
 * Supports operators:
 * - $eq: equals
 * - $ne: not equals
 * - $gt: greater than
 * - $gte: greater than or equal
 * - $lt: less than
 * - $lte: less than or equal
 * - $in: value in array
 * - $like: string contains (case-insensitive)
 *
 * Shorthand: { field: value } is equivalent to { field: { $eq: value } }
 */
export function applyWhere<T = any>(
  data: T[],
  where: Record<string, any>
): T[] {
  return data.filter(item => {
    // Check if ALL conditions match (AND logic)
    return Object.entries(where).every(([field, condition]) => {
      const value = (item as any)[field]

      // Shorthand: direct equality
      if (typeof condition !== 'object' || condition === null) {
        return value === condition
      }

      // Operator-based conditions
      return Object.entries(condition).every(([operator, expected]) => {
        switch (operator) {
          case '$eq':
            return value === expected

          case '$ne':
            return value !== expected

          case '$gt':
            return typeof value === 'number' && typeof expected === 'number' && value > expected

          case '$gte':
            return typeof value === 'number' && typeof expected === 'number' && value >= expected

          case '$lt':
            return typeof value === 'number' && typeof expected === 'number' && value < expected

          case '$lte':
            return typeof value === 'number' && typeof expected === 'number' && value <= expected

          case '$in':
            return Array.isArray(expected) && expected.includes(value)

          case '$like':
            return (
              typeof value === 'string' &&
              typeof expected === 'string' &&
              value.toLowerCase().includes(expected.toLowerCase())
            )

          default:
            // Unknown operator - ignore (return true to not filter out)
            console.warn(`Unknown JQEL operator: "${operator}"`)
            return true
        }
      })
    })
  })
}

/**
 * Apply ORDER BY to sort data
 *
 * @example
 * applyOrderBy(data, [
 *   { field: 'age', direction: 'desc' },
 *   { field: 'name', direction: 'asc' }
 * ])
 */
export function applyOrderBy<T = any>(
  data: T[],
  orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>
): T[] {
  const sorted = [...data]

  sorted.sort((a, b) => {
    for (const { field, direction } of orderBy) {
      const aVal = (a as any)[field]
      const bVal = (b as any)[field]

      // Handle undefined/null
      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1

      // Compare values
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return sorted
}

/**
 * Apply LIMIT and OFFSET for pagination
 *
 * @example
 * applyPagination(data, 10, 20) // Get 10 items starting from index 20
 */
export function applyPagination<T = any>(
  data: T[],
  limit?: number,
  offset?: number
): T[] {
  let result = data

  // Apply OFFSET (skip first N items)
  if (offset !== undefined && offset > 0) {
    result = result.slice(offset)
  }

  // Apply LIMIT (take first N items)
  if (limit !== undefined && limit > 0) {
    result = result.slice(0, limit)
  }

  return result
}

/**
 * Apply OUTPUT (projection) and EXCEPT (exclusion)
 *
 * OUTPUT: Select only specified fields
 * EXCEPT: Exclude specified fields
 *
 * If both are provided, OUTPUT takes precedence
 *
 * @example
 * // Select only id and name
 * applyProjection(data, ['id', 'name'], undefined)
 *
 * // Exclude password field
 * applyProjection(data, undefined, ['password'])
 */
export function applyProjection<T = any>(
  data: T[],
  output?: string[],
  except?: string[]
): T[] {
  // No projection needed
  if (!output && !except) {
    return data
  }

  return data.map(item => {
    // OUTPUT: select only specified fields
    if (output && output.length > 0) {
      const projected: any = {}
      output.forEach(field => {
        if (field in (item as any)) {
          projected[field] = (item as any)[field]
        }
      })
      return projected as T
    }

    // EXCEPT: exclude specified fields
    if (except && except.length > 0) {
      const filtered = { ...(item as any) }
      except.forEach(field => {
        delete filtered[field]
      })
      return filtered as T
    }

    return item
  })
}

/**
 * Utility: Count items matching WHERE conditions
 *
 * @example
 * const activeUsers = countWhere(users, { active: true })
 */
export function countWhere<T = any>(
  data: T[],
  where: Record<string, any>
): number {
  return applyWhere(data, where).length
}

/**
 * Utility: Check if any item matches WHERE conditions
 *
 * @example
 * const hasAdmin = existsWhere(users, { role: 'admin' })
 */
export function existsWhere<T = any>(
  data: T[],
  where: Record<string, any>
): boolean {
  return applyWhere(data, where).length > 0
}

/**
 * Utility: Find first item matching WHERE conditions
 *
 * @example
 * const admin = findWhere(users, { role: 'admin' })
 */
export function findWhere<T = any>(
  data: T[],
  where: Record<string, any>
): T | undefined {
  return applyWhere(data, where)[0]
}
