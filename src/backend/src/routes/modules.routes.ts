// Module Registry Routes
// Exposes registered modules from frontend ModuleRegistry

import { Router, type Request, type Response } from 'express'
import type { JResult } from '../types/jqel.types.js'

const router = Router()

/**
 * GET /api/modules/registered
 *
 * Returns list of module IDs from ACTIVE_MODULES array in index.ts
 */
router.get('/registered', async (_req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Navigate up from src/backend to project root, then to frontend
    const projectRoot = path.join(process.cwd(), '..', '..')
    const indexPath = path.join(projectRoot, 'src', 'frontend', 'src', 'modules', 'index.ts')
    const content = await fs.readFile(indexPath, 'utf-8')

    // Extract ACTIVE_MODULES array
    // Match: export const ACTIVE_MODULES = [ 'module1', 'module2', ... ] as const;
    const match = content.match(/export\s+const\s+ACTIVE_MODULES\s*=\s*\[([\s\S]*?)\]\s*as\s+const/)

    if (!match) {
      throw new Error('ACTIVE_MODULES array not found in index.ts')
    }

    // Parse module IDs from array
    const arrayContent = match[1]
    const moduleIds = arrayContent
      .split(',')
      .map(line => line.trim())
      .filter(line => line.startsWith("'") || line.startsWith('"'))
      .map(line => line.replace(/['"]/g, '').trim())
      .filter(id => id.length > 0)

    return res.status(200).json({
      code: 200,
      message: 'Success',
      data: moduleIds,
    } as JResult)
  } catch (error: any) {
    console.error('Failed to read ACTIVE_MODULES:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Failed to read ACTIVE_MODULES',
      data: null,
    } as JResult)
  }
})

export default router
