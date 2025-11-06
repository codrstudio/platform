import fs from 'fs/promises';
import path from 'path';
import { JQELQuery, JResult } from '../types/jqel.types.js';

/**
 * BackendProcessorService
 *
 * Processes JQEL queries for "backend" schema.
 * Reads/writes portal, module, and instance configuration from local JSON files.
 *
 * SPEC References:
 * - SPEC-DA-SC-008: Backend schema processed locally
 * - SPEC-CH-DA-019: Backend schema MUST be processed by Backend
 */
export class BackendProcessorService {
  private readonly configDir: string;

  constructor() {
    // Configuration files in backend/config/
    this.configDir = path.join(process.cwd(), 'config');
  }

  /**
   * Process JQEL query for backend schema
   *
   * @param query - JQEL query object
   * @returns JResult with query results
   */
  async process(query: JQELQuery): Promise<JResult> {
    try {
      // Validate query
      if (!query.select && !query.mutate) {
        return {
          code: 400,
          message: 'Query must have either "select" or "mutate"',
        };
      }

      // Route to SELECT or MUTATE
      if (query.select) {
        return await this.processSelect(query);
      } else {
        return await this.processMutate(query);
      }
    } catch (error: any) {
      console.error('❌ Error in BackendProcessor:', error);
      return {
        code: 500,
        message: `Internal error: ${error.message}`,
      };
    }
  }

  /**
   * Process SELECT query
   *
   * Supports entities: portal, module, instance
   */
  private async processSelect(query: JQELQuery): Promise<JResult> {
    const entity = query.select!;
    const filePath = this.getConfigPath(entity);

    // Read configuration file
    let data: any[];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(fileContent);

      // Ensure data is array
      if (!Array.isArray(data)) {
        data = [data];
      }
    } catch (error: any) {
      // File not found or invalid JSON
      if (error.code === 'ENOENT') {
        // Return empty array for missing file (not an error)
        return { code: 200, data: [] };
      }

      return {
        code: 500,
        message: `Failed to read ${entity}: ${error.message}`,
      };
    }

    // Apply WHERE filter
    if (query.where) {
      data = this.applyWhere(data, query.where);
    }

    // Apply ORDER BY
    if (query.options?.orderBy) {
      data = this.applyOrderBy(data, query.options.orderBy);
    }

    // Apply OFFSET and LIMIT
    if (query.options?.offset) {
      data = data.slice(query.options.offset);
    }
    if (query.options?.limit) {
      data = data.slice(0, query.options.limit);
    }

    // Apply projection (OUTPUT or EXCEPT)
    if (query.output) {
      data = data.map(item => this.projectOutput(item, query.output!));
    } else if (query.except) {
      data = data.map(item => this.projectExcept(item, query.except!));
    }

    return { code: 200, data };
  }

  /**
   * Process MUTATE query
   *
   * Supports actions: insert, update, delete
   */
  private async processMutate(query: JQELQuery): Promise<JResult> {
    const entity = query.mutate!;
    const action = query.action;

    if (!action) {
      return {
        code: 400,
        message: 'Action is required for mutate',
        field: 'action',
      };
    }

    const filePath = this.getConfigPath(entity);

    // Read current data
    let data: any[];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(fileContent);

      if (!Array.isArray(data)) {
        data = [data];
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist - create empty array for insert
        data = [];
      } else {
        return {
          code: 500,
          message: `Failed to read ${entity}: ${error.message}`,
        };
      }
    }

    // Execute action
    let result: JResult;
    switch (action.toLowerCase()) {
      case 'insert':
        result = await this.insert(data, query, filePath);
        break;
      case 'update':
        result = await this.update(data, query, filePath);
        break;
      case 'delete':
        result = await this.delete(data, query, filePath);
        break;
      default:
        return {
          code: 400,
          message: `Unsupported action: ${action}`,
          field: 'action',
        };
    }

    return result;
  }

  /**
   * Insert new record
   */
  private async insert(
    data: any[],
    query: JQELQuery,
    filePath: string
  ): Promise<JResult> {
    if (!query.values) {
      return {
        code: 400,
        message: 'Values are required for insert',
        field: 'values',
      };
    }

    // Add new record
    data.push(query.values);

    // Write back to file
    await this.writeConfig(filePath, data);

    return { code: 201, data: [query.values] };
  }

  /**
   * Update existing records
   */
  private async update(
    data: any[],
    query: JQELQuery,
    filePath: string
  ): Promise<JResult> {
    if (!query.where) {
      return {
        code: 400,
        message: 'WHERE clause is required for update',
        field: 'where',
      };
    }

    if (!query.values) {
      return {
        code: 400,
        message: 'Values are required for update',
        field: 'values',
      };
    }

    // Find matching records
    const matches = this.applyWhere(data, query.where);

    if (matches.length === 0) {
      return { code: 200, data: [] };
    }

    // Update matching records
    data = data.map(item => {
      const isMatch = matches.some(m => JSON.stringify(m) === JSON.stringify(item));
      if (isMatch) {
        return { ...item, ...query.values };
      }
      return item;
    });

    // Write back to file
    await this.writeConfig(filePath, data);

    // Return updated records
    const updated = this.applyWhere(data, query.where);
    return { code: 200, data: updated };
  }

  /**
   * Delete records
   */
  private async delete(
    data: any[],
    query: JQELQuery,
    filePath: string
  ): Promise<JResult> {
    if (!query.where) {
      return {
        code: 400,
        message: 'WHERE clause is required for delete',
        field: 'where',
      };
    }

    // Find matching records
    const matches = this.applyWhere(data, query.where);
    const beforeCount = data.length;

    // Remove matching records
    data = data.filter(item => {
      return !matches.some(m => JSON.stringify(m) === JSON.stringify(item));
    });

    // Write back to file
    await this.writeConfig(filePath, data);

    const deletedCount = beforeCount - data.length;
    return { code: 200, message: `${deletedCount} records deleted` };
  }

  /**
   * Apply WHERE clause filter
   */
  private applyWhere(data: any[], where: any): any[] {
    return data.filter(item => this.matchesWhere(item, where));
  }

  /**
   * Check if item matches WHERE clause
   */
  private matchesWhere(item: any, where: any): boolean {
    // Handle logical operators
    if (where.or) {
      return where.or.some((condition: any) => this.matchesWhere(item, condition));
    }

    if (where.not) {
      return !this.matchesWhere(item, where.not);
    }

    // Handle field conditions (AND is implicit)
    return Object.entries(where).every(([field, condition]: [string, any]) => {
      const value = item[field];

      // Handle operators
      if (condition.eq !== undefined) return value === condition.eq;
      if (condition.ne !== undefined) return value !== condition.ne;
      if (condition.gt !== undefined) return value > condition.gt;
      if (condition.gte !== undefined) return value >= condition.gte;
      if (condition.lt !== undefined) return value < condition.lt;
      if (condition.lte !== undefined) return value <= condition.lte;
      if (condition.in !== undefined) return condition.in.includes(value);
      if (condition.like !== undefined) {
        const pattern = condition.like.replace(/%/g, '.*').replace(/_/g, '.');
        return new RegExp(`^${pattern}$`, 'i').test(value);
      }

      return true;
    });
  }

  /**
   * Apply ORDER BY
   */
  private applyOrderBy(data: any[], orderBy: any[]): any[] {
    return data.sort((a, b) => {
      for (const orderRule of orderBy) {
        const [field, direction] = Object.entries(orderRule)[0] as [string, 'asc' | 'desc'];
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Project fields (include only specified)
   */
  private projectOutput(item: any, fields: string[]): any {
    const result: any = {};
    for (const field of fields) {
      if (item.hasOwnProperty(field)) {
        result[field] = item[field];
      }
    }
    return result;
  }

  /**
   * Project fields (exclude specified)
   */
  private projectExcept(item: any, fields: string[]): any {
    const result = { ...item };
    for (const field of fields) {
      delete result[field];
    }
    return result;
  }

  /**
   * Get configuration file path for entity
   */
  private getConfigPath(entity: string): string {
    // Map entity names to file names
    const fileNames: Record<string, string> = {
      portal: 'portals.json',
      module: 'modules.json',
      instance: 'instances.json',
    };

    const fileName = fileNames[entity];
    if (!fileName) {
      throw new Error(`Unknown backend entity: ${entity}`);
    }

    return path.join(this.configDir, fileName);
  }

  /**
   * Write configuration to file
   */
  private async writeConfig(filePath: string, data: any[]): Promise<void> {
    // Ensure config directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

export const backendProcessor = new BackendProcessorService();
