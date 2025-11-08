/**
 * Cache Validator Service
 *
 * Gerencia validação de cache usando Cache Epoch System.
 * Mantém epoch local sincronizado com servidor e invalida caches quando epoch muda.
 *
 * Baseado em: https://developer.chrome.com/docs/workbox/remove-buggy-service-workers
 */

const STORAGE_KEY = 'cache_epoch';

class CacheValidator {
  private currentEpoch: string | null = null;

  constructor() {
    // Carregar epoch do localStorage na inicialização
    this.currentEpoch = localStorage.getItem(STORAGE_KEY);
    console.log('[CacheValidator] Initialized with epoch:', this.currentEpoch || 'none');
  }

  /**
   * Retorna epoch atual armazenado localmente
   */
  getCurrentEpoch(): string | null {
    return this.currentEpoch;
  }

  /**
   * Atualiza epoch local com novo valor do servidor
   * Se epoch mudou, invalida todos os caches
   */
  updateEpoch(newEpoch: string): void {
    if (this.currentEpoch && this.currentEpoch !== newEpoch) {
      console.log('[CacheValidator] Epoch changed, invalidating cache');
      console.log('[CacheValidator] Old:', this.currentEpoch);
      console.log('[CacheValidator] New:', newEpoch);
      this.invalidateAll();
    }

    this.currentEpoch = newEpoch;
    localStorage.setItem(STORAGE_KEY, newEpoch);
  }

  /**
   * Verifica se epoch de um recurso é válido (igual ao epoch atual)
   */
  isValid(resourceEpoch: string | null): boolean {
    return resourceEpoch === this.currentEpoch;
  }

  /**
   * Invalida todos os caches do Service Worker
   * Chamado automaticamente quando epoch muda
   */
  async invalidateAll(): Promise<void> {
    console.log('[CacheValidator] Invalidating all caches');

    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log('[CacheValidator] Found caches:', cacheNames);

        await Promise.all(cacheNames.map((name) => caches.delete(name)));

        console.log('[CacheValidator] All caches deleted');
      } catch (error) {
        console.error('[CacheValidator] Error invalidating caches:', error);
      }
    } else {
      console.warn('[CacheValidator] Cache API not available');
    }
  }

  /**
   * Força limpeza manual de todos os caches
   * Útil para debugging ou operações administrativas
   */
  async clear(): Promise<void> {
    console.log('[CacheValidator] Manual cache clear requested');
    await this.invalidateAll();
    localStorage.removeItem(STORAGE_KEY);
    this.currentEpoch = null;
  }
}

// Singleton instance
export const cacheValidator = new CacheValidator();
