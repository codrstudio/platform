// JQEL Routes
// Based on SPEC-data-access.md and SPEC-jqel-schema.md

import { Router, type Request, type Response } from 'express'
import type { JQELQuery, JResult, JQELSelectQuery } from '../types/jqel.types.js'
import { n8nProxy } from '../services/n8nProxy.service.js'
import { configService } from '../services/config.service.js'
import type { Portal, Module, Instance } from '../types/config.types.js'
import { executeJQELQuery, applyWhere } from '../utils/jqelProcessor.js'
import { emitConfigChanged } from '../utils/event-emitter.js'

/*
 * **É PROIBIDO CRIAR ROTAS NESSE ARQUIVO**
 * **JQEL É UMA LINGUAGEM DE CONSULTA QUE PERTMITE CONSULTAR TODOS OS TIPOS DE RECURSO NO SISTEMA**
 * **POR ESSE MOTIVO, NAO É NECESSARIO CRIAR ROTAS SEPARADAS. BASTA ENVIAR A CONSULTA JQEL ESPECIFICA PARA A ROTA JQEL**
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
    if (!['portal', 'portals', 'module', 'modules', 'instance', 'instances', 'realm', 'realms', 'login-branding'].includes(entity!)) {
      return res.status(400).json({
        code: 400,
        message: `Invalid entity: ${entity}. Must be 'portal', 'module', 'instance', 'realm', or 'login-branding'`,
        data: null,
      } as JResult)
    }

    // Normalize entity name (singular form)
    const normalizedEntity = entity!.replace(/s$/, '') as 'portal' | 'module' | 'instance' | 'realm' | 'login-branding'

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
async function handleSelect(query: JQELQuery, entity: 'portal' | 'module' | 'instance' | 'realm' | 'login-branding', res: Response) {
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
    case 'realm':
      data = await configService.getRealms()
      break
    case 'login-branding':
      data = await configService.getLoginBranding()
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
async function handleMutate(query: JQELQuery, entity: 'portal' | 'module' | 'instance' | 'realm' | 'login-branding', res: Response) {
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
async function handleInsert(query: JQELQuery, entity: 'portal' | 'module' | 'instance' | 'realm' | 'login-branding', res: Response) {
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
      const instance = newItem as Instance

      // SPEC-MO-IN-018: Validar single-instance
      // Prevenir criação de instâncias adicionais em módulos single-instance
      const modules = await configService.getModules()
      const module = modules.find(m => m.moduleId === instance.moduleId)

      if (module?.singleInstance) {
        // Verificar se já existe instância desse módulo no portal
        const instances = await configService.getInstances()
        const existingInstance = instances.find(
          i => i.moduleId === instance.moduleId && i.portalId === instance.portalId
        )

        if (existingInstance) {
          return res.status(400).json({
            code: 400,
            message: `Módulo '${module.name}' é single-instance e já possui uma instância no portal '${instance.portalId}'. Apenas UMA instância é permitida.`,
            data: null,
          } as JResult)
        }
      }

      const instances = await configService.getInstances()
      instances.push(instance)
      await configService.saveInstances(instances)
      data = [instance]
      break
    }
    case 'realm': {
      const realm = newItem as any
      await configService.createRealm(realm)

      // Emit config-changed event
      await emitConfigChanged('realm', realm.realmId, 'create', realm)

      data = [realm]
      break
    }
    case 'login-branding': {
      const branding = newItem as any
      if (!branding.realmId) {
        return res.status(400).json({
          code: 400,
          message: 'Missing required field: realmId',
          data: null,
        } as JResult)
      }

      await configService.saveLoginBrandingForRealm(branding.realmId, branding)
      data = [branding]
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
async function handleUpdate(query: JQELQuery, entity: 'portal' | 'module' | 'instance' | 'realm' | 'login-branding', res: Response) {
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

      // SPEC-MO-IN-015 e SPEC-C-I-016: Auto-criar instância para módulos single-instance
      // Detectar mudanças em activeModules
      if (updates.activeModules) {
        const modules = await configService.getModules()
        const instances = await configService.getInstances()

        for (const portal of matchingPortals) {
          const oldActiveModules = portal.activeModules || []
          const newActiveModules = updates.activeModules

          // Módulos adicionados
          const addedModules = newActiveModules.filter(m => !oldActiveModules.includes(m))

          // Para cada módulo adicionado, verificar se é single-instance
          for (const moduleId of addedModules) {
            const module = modules.find(m => m.moduleId === moduleId)

            if (module?.singleInstance) {
              // Verificar se já existe instância (segurança)
              const existingInstance = instances.find(
                i => i.moduleId === moduleId && i.portalId === portal.portalId
              )

              if (!existingInstance) {
                // Criar instância default ativa
                const defaultInstance: Instance = {
                  instanceId: 'default',
                  portalId: portal.portalId,
                  moduleId: moduleId,
                  config: {},
                  active: true,
                }
                instances.push(defaultInstance)
              }
            }
          }

          // SPEC-C-I-022: Auto-remover instância ao desativar módulo single-instance
          // Módulos removidos
          const removedModules = oldActiveModules.filter(m => !newActiveModules.includes(m))

          for (const moduleId of removedModules) {
            const module = modules.find(m => m.moduleId === moduleId)

            if (module?.singleInstance) {
              // Remover instância default
              const indexToRemove = instances.findIndex(
                i => i.moduleId === moduleId && i.portalId === portal.portalId && i.instanceId === 'default'
              )
              if (indexToRemove !== -1) {
                instances.splice(indexToRemove, 1)
              }
            }
          }
        }

        // Salvar instâncias modificadas
        await configService.saveInstances(instances)
      }

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
    case 'realm': {
      const realms = await configService.getRealms()
      const matchingRealms = applyWhere(realms, query.where)

      for (const match of matchingRealms) {
        await configService.updateRealm(match.realmId, query.values)
        updated++

        // Emit config-changed event
        await emitConfigChanged('realm', match.realmId, 'update', query.values)
      }

      data = await Promise.all(
        matchingRealms.map(m => configService.getRealmById(m.realmId))
      ).then(results => results.filter(Boolean))
      break
    }
    case 'login-branding': {
      const brandings = await configService.getLoginBranding()
      const matchingBrandings = applyWhere(brandings, query.where)

      for (const match of matchingBrandings) {
        await configService.saveLoginBrandingForRealm(match.realmId, {
          ...match,
          ...query.values,
        })
        updated++
      }

      data = await configService.getLoginBranding()
      data = applyWhere(data, query.where)
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
async function handleDelete(query: JQELQuery, entity: 'portal' | 'module' | 'instance' | 'realm' | 'login-branding', res: Response) {
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

      // SPEC-MO-IN-017: Validar single-instance
      // Prevenir remoção de instância default de módulos single-instance
      const modules = await configService.getModules()

      for (const instance of matchingInstances) {
        const module = modules.find(m => m.moduleId === instance.moduleId)

        if (module?.singleInstance && instance.instanceId === 'default') {
          return res.status(400).json({
            code: 400,
            message: `Instância 'default' do módulo '${module.name}' não pode ser removida. Módulos single-instance devem manter sua instância default.`,
            data: null,
          } as JResult)
        }
      }

      const remaining = instances.filter(i =>
        !matchingInstances.some(m =>
          m.instanceId === i.instanceId && m.portalId === i.portalId
        )
      )
      deleted = instances.length - remaining.length
      await configService.saveInstances(remaining)
      break
    }
    case 'realm': {
      const realms = await configService.getRealms()
      const matchingRealms = applyWhere(realms, query.where)

      for (const realm of matchingRealms) {
        await configService.deleteRealm(realm.realmId)
        deleted++

        // Emit config-changed event
        await emitConfigChanged('realm', realm.realmId, 'delete')
      }
      break
    }
    case 'login-branding': {
      const brandings = await configService.getLoginBranding()
      const matchingBrandings = applyWhere(brandings, query.where)

      for (const branding of matchingBrandings) {
        await configService.deleteLoginBrandingForRealm(branding.realmId)
        deleted++
      }
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
    // Note: The n8n BASE_URL is https://n8n.codrstudio.dev/webhook/coletivos/api/1
    // The active workflow "request" expects POST /webhook/api/1/request
    // So we need to adjust the base URL or the path
    const response = await n8nProxy.post('/request', query)

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
