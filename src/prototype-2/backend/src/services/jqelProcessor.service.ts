import { jqelRouter } from './jqelRouter.service.js';
import type { JQELQuery, JResult, JqelContext } from '../types/jqel.types.js';

/**
 * JQEL Processor Service
 *
 * Main entry point for JQEL query processing.
 * Delegates to JqelRouter for schema-based routing.
 *
 * SPEC References:
 * - SPEC-DA-SC-001:007: Schema routing
 * - SPEC-CH-DA-005:008: Backend routing responsibility
 */
export class JQELProcessor {
  /**
   * Process a JQEL query
   *
   * @param query - Validated JQEL query
   * @param context - Request context (user, IP, etc.)
   * @returns JResult response
   */
  async process(query: JQELQuery, context?: JqelContext): Promise<JResult> {
    // Delegate to router for schema-based routing
    return await jqelRouter.route(query, context);
  }
}

// Export singleton instance
export const jqelProcessor = new JQELProcessor();
