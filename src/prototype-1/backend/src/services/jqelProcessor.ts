/**
 * JQEL Processor
 * Processes JQEL queries for "backend" schema
 * Handles portal, module, instance CRUD operations
 * SPEC-DA-* compliance
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { JQELQuery } from '../types/jqel.types.js';
import type { JResult } from '../types/jresult.types.js';
import { successResult, errorResult } from '../types/jresult.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to config directory
const CONFIG_DIR = path.resolve(__dirname, '../../config');
const PORTALS_FILE = path.join(CONFIG_DIR, 'portals.json');

interface Portal {
  portalId: string;
  name: string;
  path: string;
  settingsKey: string;
  removable: boolean;
  activeModules: string[];
  metadata?: Record<string, any>;
}

class JQELProcessor {
  /**
   * Process JQEL query for backend schema
   */
  async process(query: JQELQuery): Promise<JResult> {
    // Only process "backend" schema
    if (query.schema !== 'backend') {
      return errorResult(400, 'Invalid schema for backend processor');
    }

    // Route to appropriate handler
    if (query.select) {
      return this.handleSelect(query);
    } else if (query.mutate) {
      return this.handleMutate(query);
    } else {
      return errorResult(400, 'Query must specify select or mutate');
    }
  }

  /**
   * Handle SELECT queries
   */
  private async handleSelect(query: JQELQuery): Promise<JResult> {
    const entity = query.select!;

    switch (entity) {
      case 'portal':
        return this.selectPortals(query);
      case 'module':
        return this.selectModules(query);
      case 'instance':
        return this.selectInstances(query);
      default:
        return errorResult(404, `Entity not found: ${entity}`);
    }
  }

  /**
   * Handle MUTATE queries
   */
  private async handleMutate(query: JQELQuery): Promise<JResult> {
    const entity = query.mutate!;
    const action = query.action || 'insert';

    switch (entity) {
      case 'portal':
        return this.mutatePortal(action, query);
      case 'module':
        return this.mutateModule(action, query);
      case 'instance':
        return this.mutateInstance(action, query);
      default:
        return errorResult(404, `Entity not found: ${entity}`);
    }
  }

  /**
   * Select portals
   */
  private async selectPortals(query: JQELQuery): Promise<JResult> {
    try {
      const portals = await this.loadPortals();
      let results = portals;

      // Apply WHERE filter
      if (query.where) {
        results = this.filterRecords(results, query.where);
      }

      // Apply OPTIONS
      if (query.options) {
        results = this.applyOptions(results, query.options);
      }

      return successResult(results, 'Portals retrieved successfully');
    } catch (error: any) {
      console.error('Select portals error:', error);
      return errorResult(500, 'Failed to retrieve portals');
    }
  }

  /**
   * Select modules (placeholder - modules are registered in frontend)
   */
  private async selectModules(_query: JQELQuery): Promise<JResult> {
    // Modules are not stored in backend, they're registered in frontend
    // Return empty array for now
    return successResult(
      [],
      'Modules should be queried from module registry'
    );
  }

  /**
   * Select instances (placeholder)
   */
  private async selectInstances(_query: JQELQuery): Promise<JResult> {
    // Instances could be stored separately
    // For now, return empty array
    return successResult([], 'Instances not yet implemented');
  }

  /**
   * Mutate portal
   */
  private async mutatePortal(action: string, query: JQELQuery): Promise<JResult> {
    try {
      const portals = await this.loadPortals();

      switch (action) {
        case 'insert': {
          const newPortal = query.values as Portal;

          // Validate required fields
          if (!newPortal.portalId || !newPortal.name) {
            return errorResult(400, 'portalId and name are required');
          }

          // Check if portal exists
          const exists = portals.some((p) => p.portalId === newPortal.portalId);
          if (exists) {
            return errorResult(409, `Portal ${newPortal.portalId} already exists`);
          }

          // Add defaults
          const portal: Portal = {
            ...newPortal,
            settingsKey: newPortal.settingsKey || 'default',
            removable: newPortal.removable ?? true,
            activeModules: newPortal.activeModules || [],
          };

          portals.push(portal);
          await this.savePortals(portals);

          return successResult(portal, 'Portal created successfully');
        }

        case 'update': {
          const values = query.values!;
          const where = query.where;

          if (!where) {
            return errorResult(400, 'WHERE clause required for update');
          }

          const matches = this.filterRecords(portals, where);

          if (matches.length === 0) {
            return errorResult(404, 'No portals found matching criteria');
          }

          // Update matching portals
          matches.forEach((match) => {
            const index = portals.findIndex((p) => p.portalId === match.portalId);
            if (index !== -1) {
              portals[index] = { ...portals[index], ...values };
            }
          });

          await this.savePortals(portals);

          return successResult(matches, `Updated ${matches.length} portal(s)`);
        }

        case 'delete': {
          const where = query.where;

          if (!where) {
            return errorResult(400, 'WHERE clause required for delete');
          }

          const matches = this.filterRecords(portals, where);

          if (matches.length === 0) {
            return errorResult(404, 'No portals found matching criteria');
          }

          // Check if any portal is not removable
          const nonRemovable = matches.find((p) => !p.removable);
          if (nonRemovable) {
            return errorResult(
              403,
              `Portal ${nonRemovable.portalId} cannot be removed`
            );
          }

          // Remove matching portals
          const remaining = portals.filter(
            (p) => !matches.some((m) => m.portalId === p.portalId)
          );

          await this.savePortals(remaining);

          return successResult(matches, `Deleted ${matches.length} portal(s)`);
        }

        default:
          return errorResult(400, `Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error('Mutate portal error:', error);
      return errorResult(500, 'Failed to mutate portal');
    }
  }

  /**
   * Mutate module (placeholder)
   */
  private async mutateModule(_action: string, _query: JQELQuery): Promise<JResult> {
    return errorResult(501, 'Module mutations not yet implemented');
  }

  /**
   * Mutate instance (placeholder)
   */
  private async mutateInstance(_action: string, _query: JQELQuery): Promise<JResult> {
    return errorResult(501, 'Instance mutations not yet implemented');
  }

  /**
   * Load portals from JSON file
   */
  private async loadPortals(): Promise<Portal[]> {
    try {
      const data = await fs.readFile(PORTALS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Save portals to JSON file
   */
  private async savePortals(portals: Portal[]): Promise<void> {
    await fs.writeFile(PORTALS_FILE, JSON.stringify(portals, null, 2), 'utf-8');
  }

  /**
   * Filter records based on WHERE clause
   * Simple implementation - not comprehensive
   */
  private filterRecords<T extends Record<string, any>>(
    records: T[],
    where: any
  ): T[] {
    return records.filter((record) => this.matchesWhere(record, where));
  }

  /**
   * Check if record matches WHERE clause
   */
  private matchesWhere(record: any, where: any): boolean {
    // Logical operators
    if (where.and) {
      return where.and.every((w: any) => this.matchesWhere(record, w));
    }

    if (where.or) {
      return where.or.some((w: any) => this.matchesWhere(record, w));
    }

    if (where.not) {
      return !this.matchesWhere(record, where.not);
    }

    // Field conditions
    for (const [field, condition] of Object.entries(where)) {
      const value = record[field];

      if (typeof condition === 'object' && condition !== null) {
        // Operator conditions
        for (const [op, compareValue] of Object.entries(condition)) {
          if (!this.matchesOperator(value, op, compareValue)) {
            return false;
          }
        }
      } else {
        // Direct value comparison (implicit eq)
        if (value !== condition) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if value matches operator
   */
  private matchesOperator(value: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case 'eq':
        return value === compareValue;
      case 'ne':
        return value !== compareValue;
      case 'gt':
        return value > compareValue;
      case 'gte':
        return value >= compareValue;
      case 'lt':
        return value < compareValue;
      case 'lte':
        return value <= compareValue;
      case 'like':
        return String(value).includes(String(compareValue));
      case 'in':
        return Array.isArray(compareValue) && compareValue.includes(value);
      case 'nin':
        return Array.isArray(compareValue) && !compareValue.includes(value);
      case 'null':
        return value === null || value === undefined;
      case 'nnull':
        return value !== null && value !== undefined;
      default:
        return false;
    }
  }

  /**
   * Apply OPTIONS (limit, offset, orderBy)
   */
  private applyOptions<T>(records: T[], options: any): T[] {
    let results = [...records];

    // Apply offset
    if (options.offset) {
      results = results.slice(options.offset);
    }

    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    // Apply orderBy (simplified - single field only)
    if (options.orderBy && options.orderBy.length > 0) {
      const orderBy = options.orderBy[0];
      const field = Object.keys(orderBy)[0];
      const direction = orderBy[field];

      results.sort((a: any, b: any) => {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return results;
  }
}

// Export singleton instance
export const jqelProcessor = new JQELProcessor();
