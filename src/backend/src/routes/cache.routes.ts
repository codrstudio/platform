import { Router, Request, Response } from 'express';
import { cacheEpochService } from '../services/cache-epoch.service';
import { JResult } from '../types/jqel.types';
import { publishEvent } from '../services/sse.service';

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

/**
 * POST /api/cache/invalidate
 *
 * Invalida todos os caches do sistema gerando um novo epoch.
 * Publica evento Redis para notificar clientes conectados via SSE.
 *
 * TODO: Adicionar autenticação (admin only)
 *
 * Response:
 * {
 *   code: 200,
 *   data: {
 *     oldEpoch: string,
 *     newEpoch: string,
 *     timestamp: string
 *   }
 * }
 */
router.post('/invalidate', async (_req: Request, res: Response) => {
  const oldEpoch = cacheEpochService.getCurrentEpoch();
  const newEpoch = cacheEpochService.refreshEpoch();

  // Publicar evento SSE para todos os clientes conectados
  await publishEvent({
    type: 'cache-invalidate',
    id: `cache-invalidate-${Date.now()}`,
    timestamp: new Date().toISOString(),
    target: 'global',
    data: {
      oldEpoch,
      newEpoch,
      scope: 'global',
    },
  });

  const result: JResult<{
    oldEpoch: string;
    newEpoch: string;
    timestamp: string;
  }> = {
    code: 200,
    data: {
      oldEpoch,
      newEpoch,
      timestamp: new Date().toISOString(),
    },
  };

  res.json(result);
});

export default router;
