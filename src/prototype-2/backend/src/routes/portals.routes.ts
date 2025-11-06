import { Router, Request, Response } from 'express';
import { PortalsService } from '../services/portals.service.js';

const router = Router();

/**
 * GET /api/1/portals
 * Returns all portal configurations
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const portals = await PortalsService.getAllPortals();
    res.json(portals);
  } catch (error) {
    console.error('Error fetching portals:', error);
    res.status(500).json({ error: 'Failed to fetch portals' });
  }
});

/**
 * GET /api/1/portals/:portalId
 * Returns configuration for a specific portal
 */
router.get('/:portalId', async (req: Request, res: Response) => {
  try {
    const { portalId } = req.params;
    const portal = await PortalsService.getPortalById(portalId);

    if (!portal) {
      return res.status(404).json({ error: 'Portal not found' });
    }

    return res.json(portal);
  } catch (error) {
    console.error('Error fetching portal:', error);
    return res.status(500).json({ error: 'Failed to fetch portal' });
  }
});

export default router;
