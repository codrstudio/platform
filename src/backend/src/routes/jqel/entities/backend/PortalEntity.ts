// Portal Entity Handler
// Handles CRUD operations for Portal entities

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import type { Portal, Instance } from '../../../../types/config.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { configService } from '../../../../services/config.service.js'
import { executeJQELQuery, applyWhere } from '../../../../utils/jqelProcessor.js'
import { emitConfigChanged } from '../../../../utils/event-emitter.js'

/**
 * PortalEntity
 *
 * Manages Portal configuration with:
 * - Realm validation (SPEC-RM-VAL-001, SPEC-RM-VAL-002)
 * - Auto-create instances for single-instance modules (SPEC-MO-IN-015, SPEC-C-I-016)
 * - Auto-remove instances when deactivating single-instance modules (SPEC-C-I-022)
 * - Config-changed events
 */
export class PortalEntity extends EntityHandler {
  protected entityName = 'portal'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    const portals = await configService.getPortals()
    const result = executeJQELQuery(portals, query)

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

    const portal = query.values as Portal

    // Validate realmId exists (SPEC-RM-VAL-001)
    if (portal.realmId) {
      const realm = await configService.getRealmById(portal.realmId)
      if (!realm) {
        return {
          code: 400,
          message: `Realm '${portal.realmId}' does not exist`,
          data: null,
        }
      }
    }

    const portals = await configService.getPortals()
    portals.push(portal)
    await configService.savePortals(portals)

    // Emit config-changed event
    await emitConfigChanged('portal', portal.portalId, 'create', portal)

    return {
      code: 201,
      message: 'Created',
      data: [portal],
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

    const updates = query.values as Partial<Portal>

    // Validate realmId if being updated (SPEC-RM-VAL-002)
    if (updates.realmId) {
      const realm = await configService.getRealmById(updates.realmId)
      if (!realm) {
        return {
          code: 400,
          message: `Realm '${updates.realmId}' does not exist`,
          data: null,
        }
      }
    }

    const portals = await configService.getPortals()
    const matchingPortals = applyWhere(portals, query.where)

    // SPEC-MO-IN-015 e SPEC-C-I-016: Auto-criar instância para módulos single-instance
    // SPEC-C-I-022: Auto-remover instância ao desativar módulo single-instance
    if (updates.activeModules) {
      await this.handleActiveModulesChange(matchingPortals, updates.activeModules)
    }

    let updated = 0
    matchingPortals.forEach(match => {
      const index = portals.findIndex(p => p.portalId === match.portalId)
      if (index !== -1) {
        const current = portals[index]
        // Deep merge config if both exist
        portals[index] = {
          ...current,
          ...updates,
          config: updates.config ? this.deepMerge(current.config || {}, updates.config) : current.config,
        }
        updated++

        // Emit config-changed event for each updated portal
        emitConfigChanged('portal', match.portalId, 'update', updates)
      }
    })

    await configService.savePortals(portals)
    const data = applyWhere(portals, query.where)

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

    const portals = await configService.getPortals()
    const matchingPortals = applyWhere(portals, query.where)
    const remaining = portals.filter(p =>
      !matchingPortals.some(m => m.portalId === p.portalId)
    )
    const deleted = portals.length - remaining.length

    await configService.savePortals(remaining)

    // Emit config-changed event for each deleted portal
    matchingPortals.forEach(portal => {
      emitConfigChanged('portal', portal.portalId, 'delete')
    })

    return {
      code: 200,
      message: `Deleted ${deleted} record(s)`,
      data: null,
    }
  }

  /**
   * Handle activeModules changes
   * Auto-create/remove instances for single-instance modules
   */
  private async handleActiveModulesChange(
    portals: Portal[],
    newActiveModules: string[]
  ): Promise<void> {
    const modules = await configService.getModules()
    const instances = await configService.getInstances()

    for (const portal of portals) {
      const oldActiveModules = portal.activeModules || []

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

  /**
   * Deep merge two objects
   * Used for merging nested config structures
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target }

    for (const key in source) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        // Both are objects - recurse
        result[key] = this.deepMerge(targetValue, sourceValue)
      } else {
        // Primitive or array - replace
        result[key] = sourceValue as any
      }
    }

    return result
  }
}
