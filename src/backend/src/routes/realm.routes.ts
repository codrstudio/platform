// Realm Routes
// SPEC-RM-CR-001 to SPEC-RM-CR-025

import { Router } from 'express'
import { configService } from '../services/config.service.js'
import { RealmSchema } from '../types/config.types.js'
import { emitConfigChanged } from '../utils/event-emitter.js'

const router = Router()

/**
 * List all realms
 * GET /api/realms
 * SPEC-RM-CR-001 to SPEC-RM-CR-004
 */
router.get('/', async (_req, res) => {
  try {
    const realms = await configService.getRealms()

    // Add portal count to each realm
    const realmsWithCount = await Promise.all(
      realms.map(async (realm) => ({
        ...realm,
        portalCount: await configService.getRealmPortalCount(realm.realmId),
      }))
    )

    res.json({
      success: true,
      data: realmsWithCount,
    })
  } catch (error) {
    console.error('Error listing realms:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'REALM_LIST_ERROR',
        message: 'Failed to list realms',
      },
    })
  }
})

/**
 * Get realm by ID
 * GET /api/realms/:realmId
 * SPEC-RM-CR-005 to SPEC-RM-CR-007
 */
router.get('/:realmId', async (req, res) => {
  try {
    const { realmId } = req.params
    const realm = await configService.getRealmById(realmId)

    if (!realm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REALM_NOT_FOUND',
          message: `Realm "${realmId}" not found`,
        },
      })
    }

    // SPEC-RM-CR-007: Include portal count
    const portalCount = await configService.getRealmPortalCount(realmId)

    return res.json({
      success: true,
      data: {
        ...realm,
        portalCount,
      },
    })
  } catch (error) {
    console.error('Error getting realm:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'REALM_GET_ERROR',
        message: 'Failed to get realm',
      },
    })
  }
})

/**
 * Create new realm
 * POST /api/realms
 * SPEC-RM-CR-008 to SPEC-RM-CR-014
 */
router.post('/', async (req, res) => {
  try {
    // SPEC-RM-CR-012: Validate with Zod schema
    const realmData = RealmSchema.parse(req.body)

    // SPEC-RM-CR-014: Cannot create realm with ID "default"
    if (realmData.realmId === 'default') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REALM_ID',
          message: 'Cannot create realm with ID "default" (reserved)',
        },
      })
    }

    await configService.createRealm(realmData)

    // Emit config-changed event
    await emitConfigChanged('realm', realmData.realmId, 'create', realmData)

    return res.status(201).json({
      success: true,
      data: realmData,
    })
  } catch (error) {
    console.error('Error creating realm:', error)

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid realm data',
          details: error.message,
        },
      })
    }

    // Handle duplicate ID error
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'REALM_ALREADY_EXISTS',
          message: error.message,
        },
      })
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'REALM_CREATE_ERROR',
        message: 'Failed to create realm',
      },
    })
  }
})

/**
 * Update realm
 * PATCH /api/realms/:realmId
 * SPEC-RM-CR-015 to SPEC-RM-CR-019
 */
router.patch('/:realmId', async (req, res) => {
  try {
    const { realmId } = req.params
    const updates = req.body

    // SPEC-RM-CR-017: Cannot update realmId or removable
    if (updates.realmId || updates.removable !== undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_UPDATE',
          message: 'Cannot update realmId or removable fields',
        },
      })
    }

    await configService.updateRealm(realmId, updates)

    const updatedRealm = await configService.getRealmById(realmId)

    // Emit config-changed event
    await emitConfigChanged('realm', realmId, 'update', updates)

    return res.json({
      success: true,
      data: updatedRealm,
    })
  } catch (error) {
    console.error('Error updating realm:', error)

    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REALM_NOT_FOUND',
          message: error.message,
        },
      })
    }

    // SPEC-RM-CR-018: Cannot rename default realm
    if (error instanceof Error && error.message.includes('Cannot rename')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_RENAME_DEFAULT',
          message: error.message,
        },
      })
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'REALM_UPDATE_ERROR',
        message: 'Failed to update realm',
      },
    })
  }
})

/**
 * Delete realm
 * DELETE /api/realms/:realmId
 * SPEC-RM-CR-020 to SPEC-RM-CR-025
 */
router.delete('/:realmId', async (req, res) => {
  try {
    const { realmId } = req.params

    await configService.deleteRealm(realmId)

    // Emit config-changed event
    await emitConfigChanged('realm', realmId, 'delete')

    return res.json({
      success: true,
      message: `Realm "${realmId}" deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting realm:', error)

    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REALM_NOT_FOUND',
          message: error.message,
        },
      })
    }

    // SPEC-RM-CR-021: Cannot delete non-removable realms
    if (error instanceof Error && error.message.includes('not removable')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REALM_NOT_REMOVABLE',
          message: error.message,
        },
      })
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'REALM_DELETE_ERROR',
        message: 'Failed to delete realm',
      },
    })
  }
})

export default router
