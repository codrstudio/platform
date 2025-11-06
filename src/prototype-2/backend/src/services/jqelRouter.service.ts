import { JQELQuery, JResult, SchemaType, JqelContext } from '../types/jqel.types.js';
import { backendProcessor } from './backendProcessor.service.js';
import { n8nProxyService } from './n8nProxy.service.js';
import { config } from '../config/env.js';

/**
 * JqelRouterService
 *
 * Routes JQEL queries to appropriate processor based on schema.
 *
 * Schema routing rules (SPEC-DA-SC-001:007):
 * - "backend" → BackendProcessor (local file processing)
 * - "platform" → N8nProxy (backbone processing)
 * - "system" → Configurable (env var)
 * - [other] → N8nProxy (application schemas)
 *
 * SPEC References:
 * - SPEC-DA-SC-001:007: Schema-based routing rules
 * - SPEC-CH-RO-001:021: Channel routing by schema
 */
export class JqelRouterService {
  private readonly reservedSchemas = ['backend', 'platform', 'system'];

  /**
   * Route JQEL query to appropriate processor
   *
   * @param query - JQEL query object
   * @param _context - Request context (user, IP, etc.) - reserved for future use
   * @returns JResult from processor
   */
  async route(query: JQELQuery, _context?: JqelContext): Promise<JResult> {
    try {
      // Validate schema field
      if (!query.schema || typeof query.schema !== 'string') {
        return {
          code: 400,
          message: 'Schema is required and must be a string',
          field: 'schema',
        };
      }

      // Classify schema type
      const schemaType = this.classifySchema(query.schema);

      // Log routing decision
      console.log(`ℹ️  Routing JQEL query:`, {
        schema: query.schema,
        type: schemaType,
        operation: query.select ? 'select' : 'mutate',
        entity: query.select || query.mutate,
      });

      // Route to appropriate processor
      switch (schemaType) {
        case 'backend':
          return await backendProcessor.process(query);

        case 'platform':
        case 'application':
          return await n8nProxyService.jqel(query);

        case 'system':
          // Check environment variable for system schema routing
          const systemTarget = (config as any).systemSchemaTarget || 'n8n';

          if (systemTarget === 'backend') {
            return await backendProcessor.process(query);
          } else {
            return await n8nProxyService.jqel(query);
          }

        default:
          // Should never reach here
          return {
            code: 500,
            message: `Unknown schema type: ${schemaType}`,
          };
      }
    } catch (error: any) {
      console.error('❌ Error in JqelRouter:', error);

      // Map service errors to HTTP errors
      if (error.message?.includes('n8n unreachable')) {
        return {
          code: 503,
          message: 'Query service is unavailable',
        };
      }

      if (error.message?.includes('timeout')) {
        return {
          code: 504,
          message: 'Query timed out',
        };
      }

      return {
        code: 500,
        message: `Query processing failed: ${error.message}`,
      };
    }
  }

  /**
   * Classify schema into routing category
   *
   * SPEC-JQEL-SCH-004:006: Schema classification rules
   *
   * @param schema - Schema name from query
   * @returns Schema type (backend, platform, system, application)
   */
  private classifySchema(schema: string): SchemaType {
    const normalizedSchema = schema.toLowerCase();

    // SPEC-DA-SC-008: backend schema processed locally
    if (normalizedSchema === 'backend') {
      return 'backend';
    }

    // SPEC-DA-SC-007: platform schema proxied to n8n
    if (normalizedSchema === 'platform') {
      return 'platform';
    }

    // SPEC-DA-SC-009: system schema routing is configurable
    if (normalizedSchema === 'system') {
      return 'system';
    }

    // SPEC-DA-SC-006: Non-reserved schemas are application schemas
    // Route to n8n by default
    return 'application';
  }

  /**
   * Check if schema is reserved by platform
   */
  isReservedSchema(schema: string): boolean {
    return this.reservedSchemas.includes(schema.toLowerCase());
  }
}

export const jqelRouter = new JqelRouterService();
