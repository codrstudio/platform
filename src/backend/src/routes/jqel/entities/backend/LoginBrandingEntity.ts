// LoginBranding Entity Handler
// Handles CRUD operations for LoginBranding entities

import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'
import { EntityHandler } from '../EntityHandler.js'
import { configService } from '../../../../services/config.service.js'
import { executeJQELQuery, applyWhere } from '../../../../utils/jqelProcessor.js'

/**
 * LoginBrandingEntity
 *
 * Manages Login Branding configuration (realm-scoped)
 */
export class LoginBrandingEntity extends EntityHandler {
  protected entityName = 'login-branding'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    const brandings = await configService.getLoginBranding()
    const result = executeJQELQuery(brandings, query)

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

    const branding = query.values as any

    if (!branding.realmId) {
      return {
        code: 400,
        message: 'Missing required field: realmId',
        data: null,
      }
    }

    await configService.saveLoginBrandingForRealm(branding.realmId, branding)

    return {
      code: 201,
      message: 'Created',
      data: [branding],
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

    const brandings = await configService.getLoginBranding()
    const matchingBrandings = applyWhere(brandings, query.where)

    let updated = 0
    for (const match of matchingBrandings) {
      await configService.saveLoginBrandingForRealm(match.realmId, {
        ...match,
        ...query.values,
      })
      updated++
    }

    const data = await configService.getLoginBranding()
    const result = applyWhere(data, query.where)

    return {
      code: 200,
      message: `Updated ${updated} record(s)`,
      data: result,
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

    const brandings = await configService.getLoginBranding()
    const matchingBrandings = applyWhere(brandings, query.where)

    let deleted = 0
    for (const branding of matchingBrandings) {
      await configService.deleteLoginBrandingForRealm(branding.realmId)
      deleted++
    }

    return {
      code: 200,
      message: `Deleted ${deleted} record(s)`,
      data: null,
    }
  }
}
