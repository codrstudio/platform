// JQEL Routes
// Based on SPEC-data-access.md and SPEC-jqel-schema.md

import { Router, type Request, type Response } from 'express'
import type { JQELQuery, JResult, JQELSelectQuery } from '../types/jqel.types.js'
import { n8nProxy } from '../services/n8nProxy.service.js'
import { configService } from '../services/config.service.js'
import type { Portal, Module, Instance } from '../types/config.types.js'
import { executeJQELQuery, applyWhere } from '../utils/jqelProcessor.js'
import { emitConfigChanged } from '../utils/event-emitter.js'
import { schemaDiscoveryService } from '../services/SchemaDiscoveryService.js'

const router = Router()

/**
 * GET /api/jqel/schemas
 *
 * Schema Discovery endpoint
 * Returns SDL (Schema Definition Language) document with available schemas, entities, and actions
 * SPEC-SDL-*: Schema Discovery Layer
 */
router.get('/schemas', async (_req: Request, res: Response) => {
  try {
    const document = await schemaDiscoveryService.getSchemas()
    return res.status(200).json(document)
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: 'Failed to load schemas',
      data: null,
    } as JResult)
  }
})

/**
 * POST /api/jqel/schemas/refresh
 *
 * Refresh schemas cache
 * SPEC-SDL-*: Force reload of SDL document
 */
router.post('/schemas/refresh', async (_req: Request, res: Response) => {
  try {
    const document = await schemaDiscoveryService.refreshSchemas()
    return res.status(200).json({
      code: 200,
      message: 'Schemas refreshed successfully',
      data: document,
    } as JResult)
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: 'Failed to refresh schemas',
      data: null,
    } as JResult)
  }
})

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
async function handleBackendSchema(query: JQELQuery, res: Response) {
  try {
    const isSelect = 'select' in query
    const entity = isSelect ? query.select : query.mutate

    // Validate entity
    if (!['portal', 'portals', 'module', 'modules', 'instance', 'instances'].includes(entity!)) {
      return res.status(400).json({
        code: 400,
        message: `Invalid entity: ${entity}. Must be 'portal', 'module', or 'instance'`,
        data: null,
      } as JResult)
    }

    // Normalize entity name (singular form)
    const normalizedEntity = entity!.replace(/s$/, '') as 'portal' | 'module' | 'instance'

    if (isSelect) {
      return await handleSelect(query, normalizedEntity, res)
    } else {
      return await handleMutate(query, normalizedEntity, res)
    }
  } catch (error: any) {
    console.error('Backend schema error:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal server error',
      data: null,
    } as JResult)
  }
}

/**
 * Handle SELECT queries
 */
async function handleSelect(query: JQELQuery, entity: 'portal' | 'module' | 'instance', res: Response) {
  // Load data based on entity
  let data: any[] = []
  switch (entity) {
    case 'portal':
      data = await configService.getPortals()
      break
    case 'module':
      data = await configService.getModules()
      break
    case 'instance':
      data = await configService.getInstances()
      break
  }

  // Execute JQEL query using the processor utility
  const result = executeJQELQuery(data, query as JQELSelectQuery)

  return res.status(200).json({
    code: 200,
    message: 'Success',
    data: result,
  } as JResult)
}

/**
 * Handle MUTATE queries (INSERT/UPDATE/DELETE)
 */
async function handleMutate(query: JQELQuery, entity: 'portal' | 'module' | 'instance', res: Response) {
  const action = query.action

  if (!action || !['insert', 'update', 'delete'].includes(action)) {
    return res.status(400).json({
      code: 400,
      message: `Invalid action: ${action}. Must be 'insert', 'update', or 'delete'`,
      data: null,
    } as JResult)
  }

  switch (action) {
    case 'insert':
      return await handleInsert(query, entity, res)
    case 'update':
      return await handleUpdate(query, entity, res)
    case 'delete':
      return await handleDelete(query, entity, res)
    default:
      return res.status(400).json({
        code: 400,
        message: `Unsupported action: ${action}`,
        data: null,
      } as JResult)
  }
}

/**
 * Handle INSERT
 */
async function handleInsert(query: JQELQuery, entity: 'portal' | 'module' | 'instance', res: Response) {
  // Type guard for mutate query
  if (!('mutate' in query)) {
    return res.status(400).json({
      code: 400,
      message: 'Invalid query type for insert',
      data: null,
    } as JResult)
  }

  if (!query.values) {
    return res.status(400).json({
      code: 400,
      message: 'Missing required field: values',
      data: null,
    } as JResult)
  }

  let data: any[] = []
  const newItem = query.values

  switch (entity) {
    case 'portal': {
      const portal = newItem as Portal

      // Validate realmId exists (SPEC-RM-VAL-001)
      if (portal.realmId) {
        const realm = await configService.getRealmById(portal.realmId)
        if (!realm) {
          return res.status(400).json({
            code: 400,
            message: `Realm '${portal.realmId}' does not exist`,
            data: null,
          } as JResult)
        }
      }

      const portals = await configService.getPortals()
      portals.push(portal)
      await configService.savePortals(portals)

      // Emit config-changed event
      await emitConfigChanged('portal', portal.portalId, 'create', portal)

      data = [portal]
      break
    }
    case 'module': {
      const modules = await configService.getModules()
      modules.push(newItem as Module)
      await configService.saveModules(modules)
      data = [newItem]
      break
    }
    case 'instance': {
      const instances = await configService.getInstances()
      instances.push(newItem as Instance)
      await configService.saveInstances(instances)
      data = [newItem]
      break
    }
  }

  return res.status(201).json({
    code: 201,
    message: 'Created',
    data,
  } as JResult)
}

/**
 * Handle UPDATE
 */
async function handleUpdate(query: JQELQuery, entity: 'portal' | 'module' | 'instance', res: Response) {
  // Type guard for mutate query
  if (!('mutate' in query)) {
    return res.status(400).json({
      code: 400,
      message: 'Invalid query type for update',
      data: null,
    } as JResult)
  }

  if (!query.values) {
    return res.status(400).json({
      code: 400,
      message: 'Missing required field: values',
      data: null,
    } as JResult)
  }

  if (!query.where) {
    return res.status(400).json({
      code: 400,
      message: 'Missing required field: where',
      data: null,
    } as JResult)
  }

  let data: any[] = []
  let updated = 0

  switch (entity) {
    case 'portal': {
      const updates = query.values as Partial<Portal>

      // Validate realmId if being updated (SPEC-RM-VAL-002)
      if (updates.realmId) {
        const realm = await configService.getRealmById(updates.realmId)
        if (!realm) {
          return res.status(400).json({
            code: 400,
            message: `Realm '${updates.realmId}' does not exist`,
            data: null,
          } as JResult)
        }
      }

      const portals = await configService.getPortals()
      const matchingPortals = applyWhere(portals, query.where)

      matchingPortals.forEach(match => {
        const index = portals.findIndex(p => p.portalId === match.portalId)
        if (index !== -1) {
          portals[index] = { ...portals[index], ...updates }
          updated++

          // Emit config-changed event for each updated portal
          emitConfigChanged('portal', match.portalId, 'update', updates)
        }
      })

      await configService.savePortals(portals)
      data = applyWhere(portals, query.where)
      break
    }
    case 'module': {
      const modules = await configService.getModules()
      const matchingModules = applyWhere(modules, query.where)

      matchingModules.forEach(match => {
        const index = modules.findIndex(m => m.moduleId === match.moduleId)
        if (index !== -1) {
          modules[index] = { ...modules[index], ...query.values }
          updated++
        }
      })

      await configService.saveModules(modules)
      data = applyWhere(modules, query.where)
      break
    }
    case 'instance': {
      const instances = await configService.getInstances()
      const matchingInstances = applyWhere(instances, query.where)

      matchingInstances.forEach(match => {
        const index = instances.findIndex(i =>
          i.instanceId === match.instanceId && i.portalId === match.portalId
        )
        if (index !== -1) {
          instances[index] = { ...instances[index], ...query.values }
          updated++
        }
      })

      await configService.saveInstances(instances)
      data = applyWhere(instances, query.where)
      break
    }
  }

  return res.status(200).json({
    code: 200,
    message: `Updated ${updated} record(s)`,
    data,
  } as JResult)
}

/**
 * Handle DELETE
 */
async function handleDelete(query: JQELQuery, entity: 'portal' | 'module' | 'instance', res: Response) {
  if (!query.where) {
    return res.status(400).json({
      code: 400,
      message: 'Missing required field: where',
      data: null,
    } as JResult)
  }

  let deleted = 0

  switch (entity) {
    case 'portal': {
      const portals = await configService.getPortals()
      const matchingPortals = applyWhere(portals, query.where)
      const remaining = portals.filter(p =>
        !matchingPortals.some(m => m.portalId === p.portalId)
      )
      deleted = portals.length - remaining.length
      await configService.savePortals(remaining)

      // Emit config-changed event for each deleted portal
      matchingPortals.forEach(portal => {
        emitConfigChanged('portal', portal.portalId, 'delete')
      })

      break
    }
    case 'module': {
      const modules = await configService.getModules()
      const matchingModules = applyWhere(modules, query.where)
      const remaining = modules.filter(m =>
        !matchingModules.some(match => match.moduleId === m.moduleId)
      )
      deleted = modules.length - remaining.length
      await configService.saveModules(remaining)
      break
    }
    case 'instance': {
      const instances = await configService.getInstances()
      const matchingInstances = applyWhere(instances, query.where)
      const remaining = instances.filter(i =>
        !matchingInstances.some(m =>
          m.instanceId === i.instanceId && m.portalId === i.portalId
        )
      )
      deleted = instances.length - remaining.length
      await configService.saveInstances(remaining)
      break
    }
  }

  return res.status(200).json({
    code: 200,
    message: `Deleted ${deleted} record(s)`,
    data: null,
  } as JResult)
}

// Note: applyWhere and other query processing functions are now
// imported from jqelProcessor.ts utility

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
