/**
 * Rate Limiter para Console Nativo
 *
 * Throttle simples que evita spam de logs repetidos,
 * mantendo o stack trace nativo do browser.
 */

interface RateLimiterState {
  lastCallTime: number
  suppressedCount: number
}

/**
 * Cria um console com rate limiting
 *
 * @param windowMs - Janela de tempo em ms (padrão: 10s)
 * @returns Console com rate limiting que preserva stack trace
 *
 * @example
 * const rlConsole = createRateLimitedConsole(10000)
 * rlConsole.log('reconnect', '[SSE] Reconnecting...', { attempt: 3 })
 */
export function createRateLimitedConsole(windowMs: number = 10000) {
  const state = new Map<string, RateLimiterState>()

  const shouldLog = (key: string): boolean => {
    const now = Date.now()
    const current = state.get(key)

    if (!current || now - current.lastCallTime >= windowMs) {
      // Window expirou ou primeira chamada
      const suppressed = current?.suppressedCount || 0
      state.set(key, {
        lastCallTime: now,
        suppressedCount: 0
      })

      // Mostra quantas mensagens foram suprimidas
      if (suppressed > 0) {
        console.log(`⚠️ ${suppressed} mensagens suprimidas nos últimos ${windowMs}ms`)
      }

      return true
    }

    // Dentro da janela - suprimir
    current.suppressedCount++
    state.set(key, current)
    return false
  }

  return {
    log: (key: string, ...args: any[]) => {
      if (shouldLog(key)) {
        console.log(...args)
      }
    },

    info: (key: string, ...args: any[]) => {
      if (shouldLog(key)) {
        console.info(...args)
      }
    },

    warn: (key: string, ...args: any[]) => {
      if (shouldLog(key)) {
        console.warn(...args)
      }
    },

    error: (key: string, ...args: any[]) => {
      if (shouldLog(key)) {
        console.error(...args)
      }
    },

    /**
     * Força flush de contadores (útil para debugging)
     */
    flush: () => {
      for (const [key, s] of state.entries()) {
        if (s.suppressedCount > 0) {
          console.log(`[Rate Limiter] ${key}: ${s.suppressedCount} suprimidas`)
        }
      }
      state.clear()
    }
  }
}

/**
 * Throttle genérico para qualquer função
 */
export function createThrottler<T extends (...args: any[]) => void>(
  fn: T,
  windowMs: number
): T & { getSuppressedCount: () => number } {
  let lastCallTime = 0
  let suppressedCount = 0

  const throttled = ((...args: any[]) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime

    if (timeSinceLastCall >= windowMs) {
      fn(...args)
      lastCallTime = now
      suppressedCount = 0
    } else {
      suppressedCount++
    }
  }) as T & { getSuppressedCount: () => number }

  throttled.getSuppressedCount = () => suppressedCount

  return throttled
}
