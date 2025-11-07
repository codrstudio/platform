// Configuration Routes
// Based on SPEC-configuration.md

import { Router, type Request, type Response } from 'express'
import { configService } from '../services/config.service.js'
import { PortalSchema, ModuleSchema, InstanceSchema } from '../types/config.types.js'
import type { Portal, Module, Instance } from '../types/config.types.js'

const router = Router()

/**
 * GET /api/config/portals
 * Get all portals
 */
router.get('/portals', async (_req: Request, res: Response) => {
  try {
    const portals = await configService.getPortals()
    return res.status(200).json({
      code: 200,
      data: portals,
      count: portals.length,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/config/portals/:portalId
 * Get portal by ID
 */
router.get('/portals/:portalId', async (req: Request, res: Response) => {
  try {
    const { portalId } = req.params
    const portal = await configService.getPortalById(portalId)

    if (!portal) {
      return res.status(404).json({
        code: 404,
        message: `Portal '${portalId}' not found`,
      })
    }

    return res.status(200).json({
      code: 200,
      data: portal,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * PUT /api/config/portals
 * Update all portals
 */
router.put('/portals', async (req: Request, res: Response) => {
  try {
    const portals: Portal[] = req.body

    // Validate each portal
    const validated = portals.map((p) => PortalSchema.parse(p))

    await configService.savePortals(validated)

    return res.status(200).json({
      code: 200,
      message: 'Portals updated successfully',
      data: validated,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(400).json({
      code: 400,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/config/modules
 * Get all modules
 */
router.get('/modules', async (_req: Request, res: Response) => {
  try {
    const modules = await configService.getModules()
    return res.status(200).json({
      code: 200,
      data: modules,
      count: modules.length,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/config/modules/:moduleId
 * Get module by ID
 */
router.get('/modules/:moduleId', async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params
    const module = await configService.getModuleById(moduleId)

    if (!module) {
      return res.status(404).json({
        code: 404,
        message: `Module '${moduleId}' not found`,
      })
    }

    return res.status(200).json({
      code: 200,
      data: module,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * PUT /api/config/modules
 * Update all modules
 */
router.put('/modules', async (req: Request, res: Response) => {
  try {
    const modules: Module[] = req.body

    // Validate each module
    const validated = modules.map((m) => ModuleSchema.parse(m))

    await configService.saveModules(validated)

    return res.status(200).json({
      code: 200,
      message: 'Modules updated successfully',
      data: validated,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(400).json({
      code: 400,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/config/instances
 * Get all instances
 */
router.get('/instances', async (_req: Request, res: Response) => {
  try {
    const instances = await configService.getInstances()
    return res.status(200).json({
      code: 200,
      data: instances,
      count: instances.length,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/config/instances/portal/:portalId
 * Get instances by portal ID
 */
router.get('/instances/portal/:portalId', async (req: Request, res: Response) => {
  try {
    const { portalId } = req.params
    const instances = await configService.getInstancesByPortal(portalId)

    return res.status(200).json({
      code: 200,
      data: instances,
      count: instances.length,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * PUT /api/config/instances
 * Update all instances
 */
router.put('/instances', async (req: Request, res: Response) => {
  try {
    const instances: Instance[] = req.body

    // Validate each instance
    const validated = instances.map((i) => InstanceSchema.parse(i))

    await configService.saveInstances(validated)

    return res.status(200).json({
      code: 200,
      message: 'Instances updated successfully',
      data: validated,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(400).json({
      code: 400,
      message: errorMessage,
    })
  }
})

export default router
