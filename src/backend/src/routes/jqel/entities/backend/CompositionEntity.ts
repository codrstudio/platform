// Composition Entity Handler
// Handles CRUD operations for Composition configurations

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { configService } from '../../../../services/config.service.js'
import { executeJQELQuery, applyWhere } from '../../../../utils/jqelProcessor.js'
import { emitConfigChanged } from '../../../../utils/event-emitter.js'

/**
 * Composition configuration stored in backend
 *
 * Represents customizations of module-provided compositions per portal.
 * Base composition structures come from modules via CompositionRegistry.
 * This entity stores portal-specific component selections, slotConfigs, and layout preferences.
 */
export interface CompositionConfig {
  id: string;                      // Unique ID for this configuration
  portalId: string;                 // Portal this configuration belongs to
  baseCompositionId: string;        // ID of the base composition from module
  name: string;                     // Custom name for this configuration
  components?: {                    // Component selections per slot
    [slotId: string]: string;       // slotId -> componentId
  };
  slotConfigs?: {                   // Slot component configurations
    [componentId: string]: Record<string, any>;
  };
  layout?: {                        // Layout preferences
    width?: 'full' | 'lg' | 'md' | 'sm';  // Layout width override
  };
}

/**
 * CompositionEntity
 *
 * Manages Composition configurations with:
 * - Portal validation
 * - Config-changed events
 * - SlotConfigs persistence
 */
export class CompositionEntity extends EntityHandler {
  protected entityName = 'composition'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    const compositions = await configService.getCompositions()
    const result = executeJQELQuery(compositions, query)

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

    const composition = query.values as CompositionConfig

    // Validate required fields
    if (!composition.id || !composition.portalId || !composition.baseCompositionId) {
      return {
        code: 400,
        message: 'Missing required fields: id, portalId, baseCompositionId',
        data: null,
      }
    }

    // Validate portalId exists
    const portal = await configService.getPortalById(composition.portalId)
    if (!portal) {
      return {
        code: 400,
        message: `Portal '${composition.portalId}' does not exist`,
        data: null,
      }
    }

    const compositions = await configService.getCompositions()

    // Check for duplicate ID
    const existing = compositions.find(c => c.id === composition.id)
    if (existing) {
      return {
        code: 409,
        message: `Composition with id '${composition.id}' already exists`,
        data: null,
      }
    }

    compositions.push(composition)
    await configService.saveCompositions(compositions)

    // Emit config-changed event
    await emitConfigChanged('composition', composition.id, 'create', composition)

    return {
      code: 201,
      message: 'Created',
      data: [composition],
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

    const updates = query.values as Partial<CompositionConfig>

    const compositions = await configService.getCompositions()
    const matchingCompositions = applyWhere(compositions, query.where)

    let updated = 0
    matchingCompositions.forEach(match => {
      const index = compositions.findIndex(c => c.id === match.id)
      if (index !== -1) {
        compositions[index] = { ...compositions[index], ...updates }
        updated++

        // Emit config-changed event for each updated composition
        emitConfigChanged('composition', match.id, 'update', updates)
      }
    })

    await configService.saveCompositions(compositions)
    const data = applyWhere(compositions, query.where)

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

    const compositions = await configService.getCompositions()
    const matchingCompositions = applyWhere(compositions, query.where)
    const remaining = compositions.filter(c =>
      !matchingCompositions.some(m => m.id === c.id)
    )
    const deleted = compositions.length - remaining.length

    await configService.saveCompositions(remaining)

    // Emit config-changed event for each deleted composition
    matchingCompositions.forEach(composition => {
      emitConfigChanged('composition', composition.id, 'delete')
    })

    return {
      code: 200,
      message: `Deleted ${deleted} record(s)`,
      data: null,
    }
  }
}
