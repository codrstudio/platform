import crypto from 'crypto';

/**
 * Cache Epoch Service
 *
 * Gerencia versionamento global de cache usando GUIDs.
 * Cada reinício do servidor gera um novo epoch, invalidando caches anteriores.
 *
 * Baseado em: https://developer.chrome.com/docs/workbox/remove-buggy-service-workers
 */
class CacheEpochService {
  private currentEpoch: string;

  constructor() {
    this.currentEpoch = crypto.randomUUID();
    console.log('[CacheEpoch] Initialized:', this.currentEpoch);
  }

  /**
   * Retorna o epoch atual
   */
  getCurrentEpoch(): string {
    return this.currentEpoch;
  }

  /**
   * Força geração de novo epoch, invalidando todos os caches
   * Usado quando há deploy crítico ou mudanças que exigem invalidação imediata
   */
  refreshEpoch(): string {
    const oldEpoch = this.currentEpoch;
    this.currentEpoch = crypto.randomUUID();
    console.log('[CacheEpoch] Refreshed:', oldEpoch, '->', this.currentEpoch);
    return this.currentEpoch;
  }
}

// Singleton instance
export const cacheEpochService = new CacheEpochService();
