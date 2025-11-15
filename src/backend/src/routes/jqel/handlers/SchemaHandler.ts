// Schema Handler Interface
// Base interface for all JQEL schema handlers

import type { Response } from 'express'
import type { JQELQuery } from '../../../types/jqel.types.js'

/**
 * SchemaHandler Interface
 *
 * SPEC-JQEL-SCH-004: Each schema type has a dedicated handler
 * Handlers are responsible for:
 * - Validating schema-specific queries
 * - Routing to appropriate entity handlers
 * - Processing schema-level logic
 */
export interface SchemaHandler {
  /**
   * Execute a JQEL query for this schema
   * @param query - JQEL query object
   * @param res - Express response object
   */
  execute(query: JQELQuery, res: Response): Promise<void>
}
