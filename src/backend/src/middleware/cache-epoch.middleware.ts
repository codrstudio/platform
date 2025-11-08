import { Request, Response, NextFunction } from 'express';
import { cacheEpochService } from '../services/cache-epoch.service';

/**
 * Cache Epoch Middleware
 *
 * Adiciona header X-Cache-Epoch em todos os responses.
 * Frontend usa esse header para validar se recursos cacheados são válidos.
 *
 * Quando epoch muda (servidor reinicia ou invalidação manual),
 * clientes detectam e limpam caches obsoletos.
 */
export const cacheEpochMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const currentEpoch = cacheEpochService.getCurrentEpoch();
  res.setHeader('X-Cache-Epoch', currentEpoch);
  next();
};
