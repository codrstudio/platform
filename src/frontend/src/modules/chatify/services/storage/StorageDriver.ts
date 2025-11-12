// services/storage/StorageDriver.ts
/**
 * Interface abstrata para drivers de persistência
 *
 * Permite trocar facilmente entre localStorage (browser) e servidor (API)
 * sem alterar código dos contextos que usam persistência.
 *
 * @example
 * ```ts
 * // Usar localStorage (padrão)
 * const driver = new LocalStorageDriver()
 *
 * // Futuro: trocar para servidor
 * const driver = new ServerStorageDriver(apiClient)
 * ```
 */
export interface StorageDriver {
  /**
   * Recupera um valor do storage
   * @param key - Chave do item
   * @returns Valor deserializado ou null se não existir
   */
  get<T>(key: string): T | null

  /**
   * Salva um valor no storage
   * @param key - Chave do item
   * @param value - Valor a ser serializado e salvo
   */
  set<T>(key: string, value: T): void

  /**
   * Remove um item do storage
   * @param key - Chave do item
   */
  remove(key: string): void

  /**
   * Limpa todo o storage (usado para reset completo)
   */
  clear(): void

  /**
   * Verifica se uma chave existe no storage
   * @param key - Chave do item
   */
  has(key: string): boolean
}

/**
 * Opções de configuração para drivers de storage
 */
export interface StorageDriverOptions {
  /**
   * Prefixo para namespace das chaves (ex: "nic-chat-")
   * Evita colisões com outras aplicações no mesmo domínio
   */
  namespace?: string

  /**
   * Tempo de debounce em ms para operações de escrita (opcional)
   * Útil para evitar writes excessivos em estados que mudam rapidamente
   */
  debounceMs?: number

  /**
   * Callback chamado quando ocorre erro de storage
   * Útil para logging/monitoring
   */
  onError?: (error: Error, operation: 'get' | 'set' | 'remove' | 'clear') => void
}
