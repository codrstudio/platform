// JQEL Routes
// Based on SPEC-data-access.md and SPEC-jqel-schema.md

import { Router, type Request, type Response } from 'express'
import type { JQELQuery, JResult } from '../../types/jqel.types.js'
import { SchemaHandlerFactory } from './handlers/SchemaHandlerFactory.js'

/*
 * **É PROIBIDO CRIAR ROTAS NESSE ARQUIVO**
 * **JQEL É UMA LINGUAGEM DE CONSULTA QUE PERMITE CONSULTAR TODOS OS TIPOS DE RECURSO NO SISTEMA**
 * **POR ESSE MOTIVO, NÃO É NECESSÁRIO CRIAR ROTAS SEPARADAS. BASTA ENVIAR A CONSULTA JQEL ESPECÍFICA PARA A ROTA JQEL**
 *
 * **ARQUITETURA MODULAR**
 * Este arquivo é apenas o ponto de entrada. A lógica está modularizada em:
 * - handlers/ - Schema handlers (backend, system, n8n)
 * - entities/ - Entity handlers (portal, module, instance, realm, etc.)
 *
 * Para adicionar novos schemas ou entidades, consulte: ./README.md
 */

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

    // Get appropriate handler for schema
    const handler = SchemaHandlerFactory.getHandler(query.schema)

    // Execute query
    return await handler.execute(query, res)
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

export default router
