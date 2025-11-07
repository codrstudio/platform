// JQEL Routes
// Based on SPEC-data-access.md and SPEC-jqel-schema.md

import { Router, type Request, type Response } from 'express'
import type { JQELQuery, JResult } from '../types/jqel.types.js'
import { n8nProxy } from '../services/n8nProxy.service.js'

const router = Router()

/**
 * POST /api/jqel
 *
 * Main JQEL endpoint
 * SPEC-DA-W-005: All JQEL queries go through this endpoint
 * SPEC-JQEL-SCH-004 to SPEC-JQEL-SCH-006: Schema-based routing
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const query: JQELQuery = req.body

    // Validate query structure
    if (!query.schema) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required field: schema',
      } as JResult)
    }

    // Check if SELECT or MUTATE
    const isSelect = 'select' in query
    const isMutate = 'mutate' in query

    if (!isSelect && !isMutate) {
      return res.status(400).json({
        code: 400,
        message: 'Query must have either "select" or "mutate" field',
      } as JResult)
    }

    if (isSelect && isMutate) {
      return res.status(400).json({
        code: 400,
        message: 'Query cannot have both "select" and "mutate" fields',
      } as JResult)
    }

    // SPEC-JQEL-SCH-004: Route based on schema
    const { schema } = query

    if (schema === 'backend') {
      // Backend schema - processed locally (file-based storage)
      return await handleBackendSchema(query, res)
    }

    if (schema === 'platform' || schema === 'system') {
      // Platform/System schemas - route to n8n
      return await handleN8nSchema(query, res)
    }

    // Application schemas - route to n8n
    return await handleN8nSchema(query, res)
  } catch (error: any) {
    console.error('JQEL Error:', error)

    const status = error.response?.status || 500
    const data = error.response?.data || {
      code: 500,
      message: 'Internal server error',
    }

    return res.status(status).json(data)
  }
})

/**
 * Handle backend schema queries (file-based storage)
 * SPEC-JQEL-SCH-004: backend schema processed by Backend
 */
async function handleBackendSchema(_query: JQELQuery, res: Response) {
  // For now, return a simple response
  // In production, this would read/write to config files
  return res.status(501).json({
    code: 501,
    message: 'Backend schema processing not yet implemented',
    data: null,
  } as JResult)
}

/**
 * Handle n8n schema queries (platform, system, and application schemas)
 * SPEC-JQEL-SCH-004, SPEC-JQEL-SCH-006: Forward to n8n Backbone
 */
async function handleN8nSchema(query: JQELQuery, res: Response) {
  try {
    // Forward to n8n JQEL endpoint
    const response = await n8nProxy.post('/webhook/jqel', query)

    return res.status(response.status || 200).json(response.data)
  } catch (error: any) {
    const status = error.response?.status || 500
    const data = error.response?.data || {
      code: 500,
      message: 'n8n processing error',
    }

    return res.status(status).json(data)
  }
}

export default router
