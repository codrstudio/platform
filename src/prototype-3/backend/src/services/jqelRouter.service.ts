/**
 * JQEL Router Service
 *
 * Routes JQEL queries to appropriate processors based on schema.
 *
 * Routing rules (SPEC-JQEL-SCH-004 to SPEC-JQEL-SCH-006):
 * - 'backend' schema → Processed by Backend (Express) - portal/module/instance config
 * - 'platform' schema → Proxied to Backbone (n8n)
 * - 'system' schema → Configurable processing
 * - Other schemas → Proxied to Backbone (n8n)
 *
 * Based on:
 * - SPEC-jqel-syntax.md (SPEC-JQEL-SCH-*)
 * - SPEC-data-access.md
 */

import type { Request } from 'express';
import type { JQELQuery, JResult } from '../types/jqel.types.js';
import { backendProcessor } from './backendProcessor.service.js';
import { n8nProxy } from './n8nProxy.service.js';

// ============================================================================
// JQEL ROUTER SERVICE
// ============================================================================

class JQELRouterService {
  /**
   * Route JQEL query to appropriate processor
   *
   * @param query - JQEL query object
   * @param req - Express request object (for auth headers)
   * @returns Promise with JResult
   */
  async route(query: JQELQuery, req: Request): Promise<JResult> {
    const { schema } = query;

    // Route based on schema
    switch (schema) {
      case 'backend':
        // SPEC-JQEL-SCH-004: backend schema → Backend processor
        return this.routeToBackend(query);

      case 'platform':
        // SPEC-JQEL-SCH-004: platform schema → n8n Backbone
        return this.routeToBackbone(query, req);

      case 'system':
        // SPEC-JQEL-SCH-004: system schema → Configurable
        // For now, route to n8n
        return this.routeToBackbone(query, req);

      default:
        // SPEC-JQEL-SCH-006: Application schemas → n8n Backbone
        return this.routeToBackbone(query, req);
    }
  }

  /**
   * Route to backend processor (file-based CRUD)
   *
   * Processes queries for portal/module/instance configuration.
   *
   * @param query - JQEL query object
   * @returns Promise with JResult
   */
  private async routeToBackend(query: JQELQuery): Promise<JResult> {
    try {
      return await backendProcessor.process(query);
    } catch (error) {
      console.error('Backend processor error:', error);
      return {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      };
    }
  }

  /**
   * Route to n8n Backbone (HTTP proxy)
   *
   * Proxies query to n8n for processing by workflows.
   *
   * @param query - JQEL query object
   * @param req - Express request object (for auth headers)
   * @returns Promise with JResult
   */
  private async routeToBackbone(query: JQELQuery, req: Request): Promise<JResult> {
    try {
      // Get Authorization header from request
      const authHeader = req.headers.authorization;

      // Proxy to n8n JQEL endpoint
      // Note: n8n must have a webhook endpoint that accepts JQEL queries
      const result = await n8nProxy.post<JResult>('/webhook/jqel', query, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });

      return result;
    } catch (error) {
      console.error('Backbone proxy error:', error);

      // If n8n is unavailable
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        return {
          code: 503,
          message: 'Backbone service unavailable',
        };
      }

      return {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const jqelRouter = new JQELRouterService();
