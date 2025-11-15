// Realm Entity Handler
// Handles CRUD operations for Realm entities

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { configService } from '../../../../services/config.service.js'
import { executeJQELQuery, applyWhere } from '../../../../utils/jqelProcessor.js'
import { emitConfigChanged } from '../../../../utils/event-emitter.js'

/**
 * RealmEntity
 *
 * Manages Realm configuration with config-changed events
 */
export class RealmEntity extends EntityHandler {
  protected entityName = 'realm'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    const realms = await configService.getRealms()
    const result = executeJQELQuery(realms, query)

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

    const realm = query.values as any
    await configService.createRealm(realm)

    // Emit config-changed event
    await emitConfigChanged('realm', realm.realmId, 'create', realm)

    return {
      code: 201,
      message: 'Created',
      data: [realm],
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

    const realms = await configService.getRealms()
    const matchingRealms = applyWhere(realms, query.where)

    let updated = 0
    for (const match of matchingRealms) {
      await configService.updateRealm(match.realmId, query.values)
      updated++

      // Emit config-changed event
      await emitConfigChanged('realm', match.realmId, 'update', query.values)
    }

    const data = await Promise.all(
      matchingRealms.map(m => configService.getRealmById(m.realmId))
    ).then(results => results.filter(Boolean))

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

    const realms = await configService.getRealms()
    const matchingRealms = applyWhere(realms, query.where)

    let deleted = 0
    for (const realm of matchingRealms) {
      await configService.deleteRealm(realm.realmId)
      deleted++

      // Emit config-changed event
      await emitConfigChanged('realm', realm.realmId, 'delete')
    }

    return {
      code: 200,
      message: `Deleted ${deleted} record(s)`,
      data: null,
    }
  }
}
