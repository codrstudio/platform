// Storage Routes
// External configuration file management for module instances

import { Router, type Request, type Response } from 'express'
import { configService } from '../services/config.service.js'
import type { JResult } from '../types/jqel.types.js'

const router = Router()

/**
 * GET /api/storage/config/:moduleId/:instanceId
 *
 * Load external configuration file for a module instance
 *
 * @returns JResult with config object or null if not found
 */
router.get('/config/:moduleId/:instanceId', async (req: Request, res: Response) => {
  try {
    const { moduleId, instanceId } = req.params

    // Validate parameters
    if (!moduleId || !instanceId) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameters: moduleId and instanceId',
        data: null,
      } as JResult)
    }

    // Load external config file
    const config = await configService.loadConfigFile(moduleId, instanceId)

    // Return null if file doesn't exist (not an error)
    return res.status(200).json({
      code: 200,
      message: config ? 'Config loaded successfully' : 'Config file not found',
      data: config,
    } as JResult<Record<string, any> | null>)
  } catch (error: any) {
    console.error('Failed to load external config:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Failed to load external config',
      data: null,
    } as JResult)
  }
})

/**
 * POST /api/storage/config/:moduleId/:instanceId
 *
 * Save external configuration file for a module instance
 *
 * @body config - Configuration object to save
 * @returns JResult with success confirmation
 */
router.post('/config/:moduleId/:instanceId', async (req: Request, res: Response) => {
  try {
    const { moduleId, instanceId } = req.params
    const { config } = req.body

    // Validate parameters
    if (!moduleId || !instanceId) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameters: moduleId and instanceId',
        data: null,
      } as JResult)
    }

    // Validate config payload
    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        code: 400,
        message: 'Invalid config: must be an object',
        data: null,
      } as JResult)
    }

    // Save external config file
    await configService.saveConfigFile(moduleId, instanceId, config)

    return res.status(200).json({
      code: 200,
      message: 'Config saved successfully',
      data: { moduleId, instanceId },
    } as JResult<{ moduleId: string; instanceId: string }>)
  } catch (error: any) {
    console.error('Failed to save external config:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Failed to save external config',
      data: null,
    } as JResult)
  }
})

/**
 * DELETE /api/storage/config/:moduleId/:instanceId
 *
 * Delete external configuration file for a module instance
 *
 * @returns JResult with success confirmation
 */
router.delete('/config/:moduleId/:instanceId', async (req: Request, res: Response) => {
  try {
    const { moduleId, instanceId } = req.params

    // Validate parameters
    if (!moduleId || !instanceId) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameters: moduleId and instanceId',
        data: null,
      } as JResult)
    }

    // Delete external config file
    await configService.deleteConfigFile(moduleId, instanceId)

    return res.status(200).json({
      code: 200,
      message: 'Config deleted successfully',
      data: { moduleId, instanceId },
    } as JResult<{ moduleId: string; instanceId: string }>)
  } catch (error: any) {
    console.error('Failed to delete external config:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Failed to delete external config',
      data: null,
    } as JResult)
  }
})

/**
 * HEAD /api/storage/config/:moduleId/:instanceId
 *
 * Check if external configuration file exists
 *
 * @returns 200 if exists, 404 if not found
 */
router.head('/config/:moduleId/:instanceId', async (req: Request, res: Response) => {
  try {
    const { moduleId, instanceId } = req.params

    // Validate parameters
    if (!moduleId || !instanceId) {
      return res.status(400).send()
    }

    // Check if config file exists
    const exists = await configService.configFileExists(moduleId, instanceId)

    return res.status(exists ? 200 : 404).send()
  } catch (error: any) {
    console.error('Failed to check external config:', error)
    return res.status(500).send()
  }
})

export default router
