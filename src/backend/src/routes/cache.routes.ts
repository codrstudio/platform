import { Router, Request, Response } from 'express';
import { cacheEpochService } from '../services/cache-epoch.service';
import { JResult } from '../types/jqel.types';

const router = Router();

/**
 * GET /api/cache/epoch
 *
 * Retorna o epoch atual do servidor.
 * Frontend consulta esse endpoint na inicialização para sincronizar epoch.
 */
router.get('/epoch', (_req: Request, res: Response) => {
  const epoch = cacheEpochService.getCurrentEpoch();

  const result: JResult<{ epoch: string }> = {
    code: 200,
    data: { epoch },
  };

  res.json(result);
});

export default router;
