import crypto from 'crypto';
import { publishEvent } from './sse.service.js';
import type { PlatformEvent } from '../types/event.types.js';

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
   *
   * @param scope - Escopo da invalidação: 'global' | 'favicon' | 'manifest' | 'assets'
   * @returns Novo epoch gerado
   */
  async refreshEpoch(scope: 'global' | 'favicon' | 'manifest' | 'assets' = 'global'): Promise<string> {
    const oldEpoch = this.currentEpoch;
    this.currentEpoch = crypto.randomUUID();
    console.log('[CacheEpoch] Refreshed:', oldEpoch, '->', this.currentEpoch, '| Scope:', scope);

    // Publicar evento SSE de invalidação de cache
    const timestamp = new Date().toISOString();
    const event: PlatformEvent = {
      type: 'cache-invalidate',
      id: `cache-invalidate-${Date.now()}`,
      timestamp,
      target: 'global',
      data: {
        newEpoch: this.currentEpoch,
        oldEpoch,
        scope,
        timestamp,
      },
    };

    try {
      await publishEvent(event, 'platform:events');
      console.log('[CacheEpoch] SSE event published:', event.type, '| Scope:', scope);
    } catch (error) {
      console.error('[CacheEpoch] Failed to publish SSE event:', error);
      // Continue mesmo se SSE falhar - epoch ainda foi atualizado
    }

    return this.currentEpoch;
  }
}

// Singleton instance
export const cacheEpochService = new CacheEpochService();
