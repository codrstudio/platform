// JQEL Client Service
// Based on SPEC-data-access.md (SPEC-DA-W-*)

import type { JQELQuery, JResult } from '@/types/jqel';
import { JQELError as JQELErrorClass } from '@/types/jqel';
import { tokenStorage } from './tokenStorage';
import { cacheValidator } from './cacheValidator';

const JQEL_ENDPOINT = '/api/jqel';

/**
 * JQEL Client
 *
 * SPEC-DA-W-001: Provides jqel.query() function
 * SPEC-DA-W-002: Accepts valid JQEL object
 * SPEC-DA-W-003: Returns Promise with JResult
 */
class JQELClient {
  /**
   * Execute JQEL query
   *
   * SPEC-DA-W-005: POST to /api/jqel
   * SPEC-DA-W-006: Content-Type: application/json
   * SPEC-DA-W-007: Include JWT automatically if available
   * 
   * Cache Epoch Integration:
   * - Extracts X-Cache-Epoch header from response
   * - Updates cache validator automatically
   */
  async query<T = unknown>(queryObject: JQELQuery): Promise<JResult<T>> {
    const token = tokenStorage.getAccessToken();

    try {
      const response = await fetch(JQEL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(queryObject),
        credentials: 'include',
      });

      // Extract and update cache epoch from response header
      const cacheEpoch = response.headers.get('X-Cache-Epoch');
      if (cacheEpoch) {
        cacheValidator.updateEpoch(cacheEpoch);
      }

      const result: JResult<T> = await response.json();

      // SPEC-DA-W-009: Throw exception on HTTP errors
      if (!response.ok) {
        throw new JQELErrorClass(result);
      }

      return result;
    } catch (error) {
      // Re-throw JQEL errors
      if (error instanceof JQELErrorClass) {
        throw error;
      }

      // Wrap other errors
      throw new JQELErrorClass({
        code: 500,
        message: error instanceof Error ? error.message : 'Network error',
      });
    }
  }

  /**
   * Execute SELECT query (convenience method)
   */
  async select<T = unknown>(
    schema: string,
    entity: string,
    options?: {
      where?: JQELQuery extends { where?: infer W } ? W : never;
      limit?: number;
      offset?: number;
      orderBy?: JQELQuery extends { options?: { orderBy?: infer O } } ? O : never;
      output?: string[];
      except?: string[];
    }
  ): Promise<JResult<T>> {
    return this.query<T>({
      schema,
      select: entity,
      ...(options?.where && { where: options.where }),
      ...(options && {
        options: {
          ...(options.limit && { limit: options.limit }),
          ...(options.offset && { offset: options.offset }),
          ...(options.orderBy && { orderBy: options.orderBy }),
        },
      }),
      ...(options?.output && { output: options.output }),
      ...(options?.except && { except: options.except }),
    });
  }

  /**
   * Execute MUTATE query (convenience method)
   */
  async mutate<T = unknown>(
    schema: string,
    entity: string,
    action: 'insert' | 'update' | 'delete' | 'custom',
    options?: {
      values?: Record<string, unknown>;
      where?: JQELQuery extends { where?: infer W } ? W : never;
      output?: string[];
    }
  ): Promise<JResult<T>> {
    return this.query<T>({
      schema,
      mutate: entity,
      action,
      ...(options?.values && { values: options.values }),
      ...(options?.where && { where: options.where }),
      ...(options?.output && { output: options.output }),
    });
  }
}

// Singleton instance
export const jqelClient = new JQELClient();

/**
 * Query key factory
 * SPEC-DA-TQ-005 to SPEC-DA-TQ-008
 */
export const queryKeys = {
  /**
   * Generate query key for SELECT
   */
  select: (schema: string, entity: string, params?: Record<string, unknown>) => {
    const key: unknown[] = [schema, entity];
    if (params) {
      key.push(params);
    }
    return key;
  },

  /**
   * Generate query key for entity list
   */
  list: (schema: string, entity: string) => [schema, entity, 'list'] as const,

  /**
   * Generate query key for entity detail
   */
  detail: (schema: string, entity: string, id: string | number) =>
    [schema, entity, 'detail', id] as const,

  /**
   * Generate query key for custom action
   */
  action: (schema: string, entity: string, action: string, params?: Record<string, unknown>) => {
    const key: unknown[] = [schema, entity, action];
    if (params) {
      key.push(params);
    }
    return key;
  },
};
