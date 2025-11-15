// Module Entity Handler
// Handles CRUD operations for Module entities

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import type { Module } from '../../../../types/config.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { configService } from '../../../../services/config.service.js'
import { executeJQELQuery, applyWhere } from '../../../../utils/jqelProcessor.js'

/**
 * ModuleEntity
 *
 * Manages Module configuration
 */
export class ModuleEntity extends EntityHandler {
  protected entityName = 'module'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    const modules = await configService.getModules()
    const result = executeJQELQuery(modules, query)

    return {
      code: 200,
      message: 'Success',
      data: result,
    }
  }

  async handleInsert(query: JQELMutateQuery): Promise<JResult> {
    if (!query.values) {
      return {
        code: 400,
        message: 'Missing required field: values',
        data: null,
      }
    }

    const module = query.values as Module
    const modules = await configService.getModules()
    modules.push(module)
    await configService.saveModules(modules)

    return {
      code: 201,
      message: 'Created',
      data: [module],
    }
  }

  async handleUpdate(query: JQELMutateQuery): Promise<JResult> {
    if (!query.values) {
      return {
        code: 400,
        message: 'Missing required field: values',
        data: null,
      }
    }

    if (!query.where) {
      return {
        code: 400,
        message: 'Missing required field: where',
        data: null,
      }
    }

    const modules = await configService.getModules()
    const matchingModules = applyWhere(modules, query.where)

    let updated = 0
    matchingModules.forEach(match => {
      const index = modules.findIndex(m => m.moduleId === match.moduleId)
      if (index !== -1) {
        modules[index] = { ...modules[index], ...query.values }
        updated++
      }
    })

    await configService.saveModules(modules)
    const data = applyWhere(modules, query.where)

    return {
      code: 200,
      message: `Updated ${updated} record(s)`,
      data,
    }
  }

  async handleDelete(query: JQELMutateQuery): Promise<JResult> {
    if (!query.where) {
      return {
        code: 400,
        message: 'Missing required field: where',
        data: null,
      }
    }

    const modules = await configService.getModules()
    const matchingModules = applyWhere(modules, query.where)
    const remaining = modules.filter(m =>
      !matchingModules.some(match => match.moduleId === m.moduleId)
    )
    const deleted = modules.length - remaining.length

    await configService.saveModules(remaining)

    return {
      code: 200,
      message: `Deleted ${deleted} record(s)`,
      data: null,
    }
  }
}
