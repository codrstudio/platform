// services/storage/LocalStorageDriver.ts
/**
 * Implementação de StorageDriver usando localStorage do browser
 *
 * Features:
 * - Serialização/deserialização JSON automática
 * - Namespace para evitar colisões
 * - Debounce opcional para writes frequentes
 * - Error handling com fallbacks
 * - Sincronização entre abas via storage events
 */

import type { StorageDriver, StorageDriverOptions } from './StorageDriver'

export class LocalStorageDriver implements StorageDriver {
  private namespace: string
  private debounceMs: number
  private onError?: (error: Error, operation: 'get' | 'set' | 'remove' | 'clear') => void
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(options: StorageDriverOptions = {}) {
    this.namespace = options.namespace ?? 'nic-chat-'
    this.debounceMs = options.debounceMs ?? 0
    this.onError = options.onError
  }

  /**
   * Constrói a chave completa com namespace
   */
  private getFullKey(key: string): string {
    return `${this.namespace}${key}`
  }

  /**
   * Recupera e deserializa um valor do localStorage
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.getFullKey(key)
      const item = localStorage.getItem(fullKey)

      if (item === null) {
        return null
      }

      return JSON.parse(item) as T
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onError?.(err, 'get')
      console.error(`[LocalStorageDriver] Error getting key "${key}":`, err)
      return null
    }
  }

  /**
   * Serializa e salva um valor no localStorage
   * Se debounce configurado, agrupa writes da mesma chave
   */
  set<T>(key: string, value: T): void {
    const fullKey = this.getFullKey(key)

    // Função que executa o write
    const performWrite = () => {
      try {
        const serialized = JSON.stringify(value)
        localStorage.setItem(fullKey, serialized)

        // Disparar evento customizado para sincronização na mesma aba
        // (storage event nativo só dispara em outras abas)
        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key: fullKey, value }
          })
        )
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.onError?.(err, 'set')
        console.error(`[LocalStorageDriver] Error setting key "${key}":`, err)
      }
    }

    // Com debounce: agendar write
    if (this.debounceMs > 0) {
      // Limpar timer anterior se existir
      const existingTimer = this.debounceTimers.get(fullKey)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Criar novo timer
      const timer = setTimeout(() => {
        performWrite()
        this.debounceTimers.delete(fullKey)
      }, this.debounceMs)

      this.debounceTimers.set(fullKey, timer)
    } else {
      // Sem debounce: write imediato
      performWrite()
    }
  }

  /**
   * Remove um item do localStorage
   */
  remove(key: string): void {
    try {
      const fullKey = this.getFullKey(key)
      localStorage.removeItem(fullKey)

      // Disparar evento customizado
      window.dispatchEvent(
        new CustomEvent('local-storage-change', {
          detail: { key: fullKey, value: null }
        })
      )
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onError?.(err, 'remove')
      console.error(`[LocalStorageDriver] Error removing key "${key}":`, err)
    }
  }

  /**
   * Limpa TODAS as chaves do namespace (não todo o localStorage!)
   */
  clear(): void {
    try {
      const keysToRemove: string[] = []

      // Iterar localStorage e encontrar chaves do namespace
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.namespace)) {
          keysToRemove.push(key)
        }
      }

      // Remover todas as chaves do namespace
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Disparar evento customizado
      window.dispatchEvent(
        new CustomEvent('local-storage-change', {
          detail: { key: 'clear', value: null }
        })
      )
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onError?.(err, 'clear')
      console.error('[LocalStorageDriver] Error clearing storage:', err)
    }
  }

  /**
   * Verifica se uma chave existe no localStorage
   */
  has(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key)
      return localStorage.getItem(fullKey) !== null
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onError?.(err, 'get')
      console.error(`[LocalStorageDriver] Error checking key "${key}":`, err)
      return false
    }
  }

  /**
   * Força flush de todos os writes pendentes (útil antes de navegação)
   */
  flush(): void {
    this.debounceTimers.forEach((timer, key) => {
      clearTimeout(timer)
      // Executar write imediato
      const shortKey = key.replace(this.namespace, '')
      const value = this.get(shortKey)
      if (value !== null) {
        this.set(shortKey, value)
      }
    })
    this.debounceTimers.clear()
  }
}
