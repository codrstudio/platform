// System Schema Handler
// Handles system schema: SDL queries locally, others to n8n

import type { Response } from 'express'
import type { SchemaHandler } from './SchemaHandler.js'
import type { JQELQuery } from '../../../types/jqel.types.js'
import { N8nSchemaHandler } from './N8nSchemaHandler.js'
import { SdlEntity } from '../entities/backend/SdlEntity.js'

/**
 * SystemSchemaHandler
 *
 * SPEC-JQEL-SCH-004: system schema routing
 * - SDL queries: processed locally
 * - Other system queries: routed to n8n
 */
export class SystemSchemaHandler implements SchemaHandler {
  private n8nHandler = new N8nSchemaHandler()
  private sdlEntity = new SdlEntity()

  async execute(query: JQELQuery, res: Response): Promise<void> {
    try {
      const isSelect = 'select' in query

      // SDL queries are processed locally
      if (isSelect && query.select === 'sdl') {
        const result = await this.sdlEntity.execute(query)
        res.status(result.code).json(result)
        return
      }

      // All other system queries go to n8n
      await this.n8nHandler.execute(query, res)
    } catch (error: any) {
      console.error('System schema error:', error)
      res.status(500).json({
        code: 500,
        message: error.message || 'Internal server error',
        data: null,
      })
    }
  }
}
