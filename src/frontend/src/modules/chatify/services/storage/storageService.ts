// services/storage/storageService.ts
/**
 * StorageService - Facade centralizado para persistência
 *
 * Singleton que encapsula o StorageDriver e fornece API simplificada
 * para todos os contextos da aplicação.
 *
 * Benefícios:
 * - API única e consistente para todos os contextos
 * - Troca de driver transparente (localStorage → servidor)
 * - Listeners para sincronização entre abas
 * - Type-safe com TypeScript generics
 *
 * @example
 * ```ts
 * import { storageService } from '@/services/storage'
 *
 * // Salvar dados
 * storageService.set('journey-progress', progressData)
 *
 * // Recuperar dados
 * const progress = storageService.get<JourneyProgress>('journey-progress')
 *
 * // Escutar mudanças (sincronização entre abas)
 * storageService.subscribe('journey-progress', (newValue) => {
 *   setProgress(newValue)
 * })
 * ```
 */

import type { StorageDriver } from './StorageDriver'
import { LocalStorageDriver } from './LocalStorageDriver'

type StorageListener<T> = (value: T | null) => void

class StorageService {
  private driver: StorageDriver
  private listeners: Map<string, Set<StorageListener<any>>> = new Map()

  constructor() {
    // Driver padrão: LocalStorageDriver com namespace "nic-chat-"
    this.driver = new LocalStorageDriver({
      namespace: 'nic-chat-',
      debounceMs: 1000, // Debounce de 1s para writes frequentes
      onError: (error, operation) => {
        console.error(`[StorageService] Error in ${operation}:`, error)
      }
    })

    // Listener global para storage events (sincronização entre abas)
    this.setupStorageListener()
  }

  /**
   * Permite trocar o driver (útil para testes ou migração para servidor)
   */
  setDriver(driver: StorageDriver): void {
    this.driver = driver
  }

  /**
   * Recupera um valor do storage
   */
  get<T>(key: string): T | null {
    return this.driver.get<T>(key)
  }

  /**
   * Salva um valor no storage
   */
  set<T>(key: string, value: T): void {
    this.driver.set(key, value)
    // Notificar listeners locais imediatamente
    this.notifyListeners(key, value)
  }

  /**
   * Remove um item do storage
   */
  remove(key: string): void {
    this.driver.remove(key)
    this.notifyListeners(key, null)
  }

  /**
   * Limpa todo o storage
   */
  clear(): void {
    this.driver.clear()
    // Notificar todos os listeners
    this.listeners.forEach((_, key) => {
      this.notifyListeners(key, null)
    })
  }

  /**
   * Verifica se uma chave existe
   */
  has(key: string): boolean {
    return this.driver.has(key)
  }

  /**
   * Inscreve um listener para mudanças em uma chave específica
   * Retorna função de cleanup
   */
  subscribe<T>(key: string, listener: StorageListener<T>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }

    const listeners = this.listeners.get(key)!
    listeners.add(listener)

    // Retornar função de unsubscribe
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(key)
      }
    }
  }

  /**
   * Notifica todos os listeners de uma chave
   */
  private notifyListeners<T>(key: string, value: T | null): void {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(listener => listener(value))
    }
  }

  /**
   * Configura listener para eventos de storage (sincronização entre abas)
   */
  private setupStorageListener(): void {
    // Storage event nativo (disparado por outras abas)
    window.addEventListener('storage', (event) => {
      // Ignorar eventos que não são do nosso namespace
      if (!event.key || !event.key.startsWith('nic-chat-')) {
        return
      }

      // Extrair chave sem namespace
      const key = event.key.replace('nic-chat-', '')

      // Parsear novo valor
      let value = null
      if (event.newValue) {
        try {
          value = JSON.parse(event.newValue)
        } catch (error) {
          console.error('[StorageService] Error parsing storage event:', error)
        }
      }

      // Notificar listeners
      this.notifyListeners(key, value)
    })

    // Custom event para sincronização na mesma aba
    window.addEventListener('local-storage-change', ((event: CustomEvent) => {
      if (!event.detail?.key || !event.detail.key.startsWith('nic-chat-')) {
        return
      }

      const key = event.detail.key.replace('nic-chat-', '')
      const value = event.detail.value

      // Notificar listeners
      this.notifyListeners(key, value)
    }) as EventListener)
  }
}

/**
 * Instância singleton do StorageService
 * Exportada para uso em toda a aplicação
 */
export const storageService = new StorageService()
