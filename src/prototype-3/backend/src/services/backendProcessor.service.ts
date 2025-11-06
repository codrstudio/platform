/**
 * Backend Processor Service
 *
 * Processes JQEL queries for 'backend' schema.
 * Handles portal/module/instance configuration stored in JSON files.
 *
 * Based on:
 * - SPEC-jqel-syntax.md
 * - SPEC-data-access.md
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  JQELQuery,
  JQELSelectQuery,
  JQELMutateQuery,
  JResult,
} from '../types/jqel.types.js';
import { isSelectQuery, isMutateQuery } from '../types/jqel.types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG_DIR = path.join(process.cwd(), 'src', 'config');

const ENTITY_FILES: Record<string, string> = {
  portal: path.join(CONFIG_DIR, 'portals.json'),
  module: path.join(CONFIG_DIR, 'modules.json'),
  instance: path.join(CONFIG_DIR, 'instances.json'),
};

// ============================================================================
// BACKEND PROCESSOR SERVICE
// ============================================================================

class BackendProcessorService {
  /**
   * Process JQEL query for backend schema
   *
   * @param query - JQEL query object
   * @returns Promise with JResult
   */
  async process(query: JQELQuery): Promise<JResult> {
    if (isSelectQuery(query)) {
      return this.processSelect(query);
    }

    if (isMutateQuery(query)) {
      return this.processMutate(query);
    }

    return {
      code: 400,
      message: "Query must have 'select' or 'mutate'",
    };
  }

  /**
   * Process SELECT query
   *
   * @param query - JQEL SELECT query
   * @returns Promise with JResult
   */
  private async processSelect(query: JQELSelectQuery): Promise<JResult> {
    const { select: entity, where, options, output, except } = query;

    // Check if entity is supported
    if (!ENTITY_FILES[entity]) {
      return {
        code: 404,
        message: `Entity '${entity}' not found in backend schema`,
        field: 'select',
      };
    }

    try {
      // Read data from file
      const data = await this.readEntityFile(entity);

      // Apply WHERE filter
      let filtered = where ? this.applyWhere(data, where) : data;

      // Apply sorting
      if (options?.orderBy) {
        filtered = this.applyOrderBy(filtered, options.orderBy);
      }

      // Apply pagination
      if (options?.offset !== undefined || options?.limit !== undefined) {
        const offset = options.offset || 0;
        const limit = options.limit || filtered.length;
        filtered = filtered.slice(offset, offset + limit);
      }

      // Apply projection
      if (output) {
        filtered = filtered.map((item) => this.applyOutput(item, output));
      } else if (except) {
        filtered = filtered.map((item) => this.applyExcept(item, except));
      }

      return {
        code: 200,
        data: filtered,
      };
    } catch (error) {
      console.error('Backend processor SELECT error:', error);
      return {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      };
    }
  }

  /**
   * Process MUTATE query
   *
   * @param query - JQEL MUTATE query
   * @returns Promise with JResult
   */
  private async processMutate(query: JQELMutateQuery): Promise<JResult> {
    const { mutate: entity, action, where, values } = query;

    // Check if entity is supported
    if (!ENTITY_FILES[entity]) {
      return {
        code: 404,
        message: `Entity '${entity}' not found in backend schema`,
        field: 'mutate',
      };
    }

    try {
      const data = await this.readEntityFile(entity);
      let modified: any[];
      let code = 200;

      switch (action) {
        case 'insert':
          if (!values) {
            return {
              code: 400,
              message: "Campo 'values' é obrigatório para action 'insert'",
              field: 'values',
            };
          }
          modified = [...data, values];
          code = 201;
          break;

        case 'update':
          if (!where) {
            return {
              code: 400,
              message: "Campo 'where' é obrigatório para action 'update'",
              field: 'where',
            };
          }
          if (!values) {
            return {
              code: 400,
              message: "Campo 'values' é obrigatório para action 'update'",
              field: 'values',
            };
          }
          modified = data.map((item) => {
            if (this.matchesWhere(item, where)) {
              return { ...item, ...values };
            }
            return item;
          });
          break;

        case 'delete':
          if (!where) {
            return {
              code: 400,
              message: "Campo 'where' é obrigatório para action 'delete'",
              field: 'where',
            };
          }
          modified = data.filter((item) => !this.matchesWhere(item, where));
          break;

        case 'upsert':
          if (!values) {
            return {
              code: 400,
              message: "Campo 'values' é obrigatório para action 'upsert'",
              field: 'values',
            };
          }
          // Try to find existing record
          const existingIndex = where
            ? data.findIndex((item) => this.matchesWhere(item, where))
            : -1;

          if (existingIndex >= 0) {
            // Update existing
            modified = [...data];
            modified[existingIndex] = { ...data[existingIndex], ...values };
          } else {
            // Insert new
            modified = [...data, values];
            code = 201;
          }
          break;

        default:
          return {
            code: 400,
            message: `Action '${action}' not supported`,
            field: 'action',
          };
      }

      // Write back to file
      await this.writeEntityFile(entity, modified);

      return {
        code,
        message: `${action} successful`,
        data: action === 'delete' ? [] : modified,
      };
    } catch (error) {
      console.error('Backend processor MUTATE error:', error);
      return {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      };
    }
  }

  /**
   * Read entity data from JSON file
   */
  private async readEntityFile(entity: string): Promise<any[]> {
    const filePath = ENTITY_FILES[entity];
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Write entity data to JSON file
   */
  private async writeEntityFile(entity: string, data: any[]): Promise<void> {
    const filePath = ENTITY_FILES[entity];
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Apply WHERE clause filtering
   */
  private applyWhere(data: any[], where: any): any[] {
    return data.filter((item) => this.matchesWhere(item, where));
  }

  /**
   * Check if item matches WHERE clause
   */
  private matchesWhere(item: any, where: any): boolean {
    for (const [field, condition] of Object.entries(where)) {
      // Handle logical operators
      if (field === 'or') {
        const orConditions = condition as any[];
        const matches = orConditions.some((cond) => this.matchesWhere(item, cond));
        if (!matches) return false;
        continue;
      }

      if (field === 'not') {
        const notCondition = condition as any;
        if (this.matchesWhere(item, notCondition)) return false;
        continue;
      }

      // Handle field conditions
      const value = item[field];
      const operators = condition as any;

      for (const [op, expected] of Object.entries(operators)) {
        switch (op) {
          case 'eq':
            if (value !== expected) return false;
            break;
          case 'ne':
            if (value === expected) return false;
            break;
          case 'gt':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-comparison
            if (!(value > (expected as any))) return false;
            break;
          case 'gte':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-comparison
            if (!(value >= (expected as any))) return false;
            break;
          case 'lt':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-comparison
            if (!(value < (expected as any))) return false;
            break;
          case 'lte':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-comparison
            if (!(value <= (expected as any))) return false;
            break;
          case 'in':
            if (!Array.isArray(expected) || !expected.includes(value)) return false;
            break;
          case 'like':
            const pattern = String(expected).replace(/%/g, '.*').replace(/_/g, '.');
            const regex = new RegExp(`^${pattern}$`, 'i');
            if (!regex.test(String(value))) return false;
            break;
        }
      }
    }

    return true;
  }

  /**
   * Apply ORDER BY sorting
   */
  private applyOrderBy(data: any[], orderBy: Array<Record<string, 'asc' | 'desc'>>): any[] {
    const sorted = [...data];

    sorted.sort((a, b) => {
      for (const orderItem of orderBy) {
        const [[field, direction]] = Object.entries(orderItem);
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }

  /**
   * Apply OUTPUT projection (include fields)
   */
  private applyOutput(item: any, output: string[]): any {
    const projected: any = {};
    for (const field of output) {
      if (field in item) {
        projected[field] = item[field];
      }
    }
    return projected;
  }

  /**
   * Apply EXCEPT projection (exclude fields)
   */
  private applyExcept(item: any, except: string[]): any {
    const projected = { ...item };
    for (const field of except) {
      delete projected[field];
    }
    return projected;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const backendProcessor = new BackendProcessorService();
