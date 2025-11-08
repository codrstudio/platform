import { Request, Response, NextFunction } from 'express';

/**
 * Middleware Clear-Site-Data
 *
 * Adiciona header HTTP Clear-Site-Data para forçar limpeza de cache no browser.
 *
 * Baseado em:
 * - Chrome DevRel: https://developer.chrome.com/docs/workbox/remove-buggy-service-workers
 * - MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data
 *
 * IMPORTANTE: Este header é um "kill switch" para emergências.
 * Só deve ser ativado via variável de ambiente FORCE_CACHE_CLEAR=true.
 *
 * Valores suportados:
 * - "cache" - Limpa HTTP cache e Service Worker cache
 * - "cookies" - Limpa cookies
 * - "storage" - Limpa localStorage, sessionStorage, IndexedDB
 * - "*" - Limpa tudo (uso não recomendado)
 */
export const clearSiteDataMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Ler flag do ambiente
  const forceClear = process.env.FORCE_CACHE_CLEAR === 'true';

  if (forceClear) {
    // Adicionar header Clear-Site-Data
    res.setHeader('Clear-Site-Data', '"cache"');

    console.warn('[ClearSiteData] Header added to response', {
      path: req.path,
      method: req.method,
    });
  }

  next();
};
