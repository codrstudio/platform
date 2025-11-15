// SDL Entity Handler
// Handles SDL (Schema Definition Language) queries - READ ONLY

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { schemaDiscoveryService } from '../../../../services/SchemaDiscoveryService.js'

/**
 * SdlEntity
 *
 * Manages SDL (Schema Definition Language) queries
 * SDL is READ-ONLY - mutations are not allowed
 */
export class SdlEntity extends EntityHandler {
  protected entityName = 'sdl'

  async handleSelect(_query: JQELSelectQuery): Promise<JResult> {
    const document = await schemaDiscoveryService.getSchemas()

    return {
      code: 200,
      message: 'Success',
      data: [document],
    }
  }

  async handleInsert(_query: JQELMutateQuery): Promise<JResult> {
    return {
      code: 400,
      message: 'SDL is read-only. Mutations are not allowed.',
      data: null,
    }
  }

  async handleUpdate(_query: JQELMutateQuery): Promise<JResult> {
    return {
      code: 400,
      message: 'SDL is read-only. Mutations are not allowed.',
      data: null,
    }
  }

  async handleDelete(_query: JQELMutateQuery): Promise<JResult> {
    return {
      code: 400,
      message: 'SDL is read-only. Mutations are not allowed.',
      data: null,
    }
  }
}
