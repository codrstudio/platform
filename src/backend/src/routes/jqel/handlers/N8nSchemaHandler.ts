// N8n Schema Handler
// Handles platform, system (non-SDL), and application schemas by proxying to n8n

import type { Response } from 'express'
import type { SchemaHandler } from './SchemaHandler.js'
import type { JQELQuery } from '../../../types/jqel.types.js'
import { n8nProxy } from '../../../services/n8nProxy.service.js'

/**
 * N8nSchemaHandler
 *
 * SPEC-JQEL-SCH-004, SPEC-JQEL-SCH-006: Forward to n8n Backbone
 * Handles:
 * - platform schema
 * - system schema (non-SDL queries)
 * - Application schemas (custom schemas)
 */
export class N8nSchemaHandler implements SchemaHandler {
  async execute(query: JQELQuery, res: Response): Promise<void> {
    try {
      // Forward to n8n JQEL endpoint
      // Note: The n8n BASE_URL is https://n8n.codrstudio.dev/webhook/coletivos/api/1
      // The active workflow "request" expects POST /webhook/api/1/request
      const response = await n8nProxy.post('/request', query)

      res.status(response.status || 200).json(response.data)
    } catch (error: any) {
      const status = error.response?.status || 500
      const data = error.response?.data || {
        code: 500,
        message: 'n8n processing error',
      }

      res.status(status).json(data)
    }
  }
}
