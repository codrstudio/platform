// Backend Schema Handler
// Handles backend schema queries (file-based storage)

import type { Response } from 'express'
import type { SchemaHandler } from './SchemaHandler.js'
import type { JQELQuery } from '../../../types/jqel.types.js'
import type { EntityHandler } from '../entities/EntityHandler.js'
import { PortalEntity } from '../entities/backend/PortalEntity.js'
import { ModuleEntity } from '../entities/backend/ModuleEntity.js'
import { InstanceEntity } from '../entities/backend/InstanceEntity.js'
import { RealmEntity } from '../entities/backend/RealmEntity.js'
import { LoginBrandingEntity } from '../entities/backend/LoginBrandingEntity.js'
import { SdlEntity } from '../entities/backend/SdlEntity.js'
import { CompositionEntity } from '../entities/backend/CompositionEntity.js'

/**
 * BackendSchemaHandler
 *
 * SPEC-JQEL-SCH-004: backend schema processed by Backend
 * Manages file-based configuration entities:
 * - portal, module, instance, realm, login-branding, sdl, composition
 */
export class BackendSchemaHandler implements SchemaHandler {
  private entities: Map<string, EntityHandler>

  constructor() {
    // Initialize entity handlers
    this.entities = new Map<string, EntityHandler>([
      ['portal', new PortalEntity()],
      ['portals', new PortalEntity()], // Support plural form
      ['module', new ModuleEntity()],
      ['modules', new ModuleEntity()],
      ['instance', new InstanceEntity()],
      ['instances', new InstanceEntity()],
      ['realm', new RealmEntity()],
      ['realms', new RealmEntity()],
      ['login-branding', new LoginBrandingEntity()],
      ['sdl', new SdlEntity()],
      ['composition', new CompositionEntity()],
      ['compositions', new CompositionEntity()],
    ])
  }

  async execute(query: JQELQuery, res: Response): Promise<void> {
    try {
      const isSelect = 'select' in query
      const entity = isSelect ? query.select : query.mutate

      // Validate entity exists
      if (!this.entities.has(entity!)) {
        res.status(400).json({
          code: 400,
          message: `Invalid entity: ${entity}. Must be 'portal', 'module', 'instance', 'realm', 'login-branding', 'sdl', or 'composition'`,
          data: null,
        })
        return
      }

      // Get entity handler
      const entityHandler = this.entities.get(entity!)!

      // Execute query
      const result = await entityHandler.execute(query)

      // Return result
      res.status(result.code).json(result)
    } catch (error: any) {
      console.error('Backend schema error:', error)
      res.status(500).json({
        code: 500,
        message: error.message || 'Internal server error',
        data: null,
      })
    }
  }
}
