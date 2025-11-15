// Entity Handler Base Class
// Abstract base for all JQEL entity handlers

import type { JQELQuery, JQELSelectQuery, JQELMutateQuery, JResult } from '../../../types/jqel.types.js'

/**
 * EntityHandler Abstract Class
 *
 * Provides base structure for entity-specific CRUD operations
 * Each entity (portal, module, instance, etc.) extends this class
 */
export abstract class EntityHandler {
  /**
   * Entity name (e.g., 'portal', 'module')
   */
  protected abstract entityName: string

  /**
   * Execute a query (SELECT or MUTATE)
   */
  async execute(query: JQELQuery): Promise<JResult> {
    const isSelect = 'select' in query

    if (isSelect) {
      return await this.handleSelect(query as JQELSelectQuery)
    } else {
      return await this.handleMutate(query as JQELMutateQuery)
    }
  }

  /**
   * Handle SELECT queries
   */
  protected abstract handleSelect(query: JQELSelectQuery): Promise<JResult>

  /**
   * Handle MUTATE queries (routes to INSERT/UPDATE/DELETE)
   */
  protected async handleMutate(query: JQELMutateQuery): Promise<JResult> {
    const action = query.action

    if (!action || !['insert', 'update', 'delete'].includes(action)) {
      return {
        code: 400,
        message: `Invalid action: ${action}. Must be 'insert', 'update', or 'delete'`,
        data: null,
      }
    }

    switch (action) {
      case 'insert':
        return await this.handleInsert(query)
      case 'update':
        return await this.handleUpdate(query)
      case 'delete':
        return await this.handleDelete(query)
      default:
        return {
          code: 400,
          message: `Unsupported action: ${action}`,
          data: null,
        }
    }
  }

  /**
   * Handle INSERT action
   */
  protected abstract handleInsert(query: JQELMutateQuery): Promise<JResult>

  /**
   * Handle UPDATE action
   */
  protected abstract handleUpdate(query: JQELMutateQuery): Promise<JResult>

  /**
   * Handle DELETE action
   */
  protected abstract handleDelete(query: JQELMutateQuery): Promise<JResult>
}
