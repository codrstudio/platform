// Instance Entity Handler
// Handles CRUD operations for Instance entities

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import type { Instance } from '../../../../types/config.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { configService } from '../../../../services/config.service.js'
import { executeJQELQuery, applyWhere } from '../../../../utils/jqelProcessor.js'

/**
 * InstanceEntity
 *
 * Manages Instance configuration with:
 * - Single-instance validation (SPEC-MO-IN-017, SPEC-MO-IN-018)
 * - Prevention of default instance removal for single-instance modules
 */
export class InstanceEntity extends EntityHandler {
  protected entityName = 'instance'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    const instances = await configService.getInstances()

    // Resolve external config files (Hybrid Storage)
    // If instance.config has { $ref: "modules/:moduleId/:instanceId.json" },
    // load the external file and merge with instance
    const resolvedInstances = await Promise.all(
      instances.map(async (instance) => {
        if (instance.config && typeof instance.config === 'object') {
          const ref = (instance.config as any).$ref

          if (typeof ref === 'string' && ref.startsWith('modules/')) {
            // Load external config file
            const externalConfig = await configService.loadConfigFile(
              instance.moduleId,
              instance.instanceId
            )

            if (externalConfig) {
              // Merge external config with instance
              return {
                ...instance,
                config: externalConfig,
              }
            }
          }
        }

        return instance
      })
    )

    const result = executeJQELQuery(resolvedInstances, query)

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

    const instance = query.values as Instance

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
        return {
          code: 400,
          message: `Módulo '${module.name}' é single-instance e já possui uma instância no portal '${instance.portalId}'. Apenas UMA instância é permitida.`,
          data: null,
        }
      }
    }

    const instances = await configService.getInstances()
    instances.push(instance)
    await configService.saveInstances(instances)

    return {
      code: 201,
      message: 'Created',
      data: [instance],
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

    const instances = await configService.getInstances()
    const matchingInstances = applyWhere(instances, query.where)

    let updated = 0
    matchingInstances.forEach(match => {
      const index = instances.findIndex(i =>
        i.instanceId === match.instanceId &&
        i.portalId === match.portalId &&
        i.moduleId === match.moduleId  // ← CRÍTICO: incluir moduleId para identificação única!
      )
      if (index !== -1) {
        instances[index] = { ...instances[index], ...query.values }
        updated++
      }
    })

    await configService.saveInstances(instances)
    const data = applyWhere(instances, query.where)

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

    const instances = await configService.getInstances()
    const matchingInstances = applyWhere(instances, query.where)

    // SPEC-MO-IN-017: Validar single-instance
    // Prevenir remoção de instância default de módulos single-instance
    const modules = await configService.getModules()

    for (const instance of matchingInstances) {
      const module = modules.find(m => m.moduleId === instance.moduleId)

      if (module?.singleInstance && instance.instanceId === 'default') {
        return {
          code: 400,
          message: `Instância 'default' do módulo '${module.name}' não pode ser removida. Módulos single-instance devem manter sua instância default.`,
          data: null,
        }
      }
    }

    const remaining = instances.filter(i =>
      !matchingInstances.some(m =>
        m.instanceId === i.instanceId &&
        m.portalId === i.portalId &&
        m.moduleId === i.moduleId  // ← CRÍTICO: incluir moduleId para identificação única!
      )
    )
    const deleted = instances.length - remaining.length

    await configService.saveInstances(remaining)

    // Auto-cleanup: Delete external config files for deleted instances
    // This prevents orphaned files when instances are removed
    await Promise.all(
      matchingInstances.map(async (instance) => {
        await configService.deleteConfigFile(instance.moduleId, instance.instanceId)
      })
    )

    return {
      code: 200,
      message: `Deleted ${deleted} record(s)`,
      data: null,
    }
  }
}
