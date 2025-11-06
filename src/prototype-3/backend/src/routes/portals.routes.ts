/**
 * Portal Routes
 *
 * Provides REST endpoints for portal configuration management.
 * All portal data is stored in config/portals.json (file-based).
 */

import { Router } from 'express';
import { portalsService } from '../services/portals.service';
import type { Portal } from '../types/portal.types';

const router = Router();

/**
 * GET /api/portals
 * List all available portals
 */
router.get('/', async (req, res, next) => {
  try {
    const portals = await portalsService.getAllPortals();
    res.json({
      success: true,
      data: portals
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/portals/:portalId
 * Get a specific portal by ID
 */
router.get('/:portalId', async (req, res, next) => {
  try {
    const { portalId } = req.params;
    const portal = await portalsService.getPortalById(portalId);

    if (!portal) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PORTAL_NOT_FOUND',
          message: `Portal with ID '${portalId}' not found`
        }
      });
      return;
    }

    res.json({
      success: true,
      data: portal
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/portals
 * Create a new portal
 */
router.post('/', async (req, res, next) => {
  try {
    const portalData: Portal = req.body;

    // Basic validation
    if (!portalData.portalId || !portalData.name) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'portalId and name are required fields'
        }
      });
      return;
    }

    const newPortal = await portalsService.createPortal(portalData);
    res.status(201).json({
      success: true,
      data: newPortal
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/portals/:portalId
 * Update an existing portal
 */
router.put('/:portalId', async (req, res, next) => {
  try {
    const { portalId } = req.params;
    const updates: Partial<Portal> = req.body;

    const updatedPortal = await portalsService.updatePortal(portalId, updates);

    if (!updatedPortal) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PORTAL_NOT_FOUND',
          message: `Portal with ID '${portalId}' not found`
        }
      });
      return;
    }

    res.json({
      success: true,
      data: updatedPortal
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/portals/:portalId
 * Delete a portal
 */
router.delete('/:portalId', async (req, res, next) => {
  try {
    const { portalId } = req.params;
    const success = await portalsService.deletePortal(portalId);

    if (!success) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PORTAL_NOT_FOUND',
          message: `Portal with ID '${portalId}' not found`
        }
      });
      return;
    }

    res.json({
      success: true,
      data: { portalId }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
