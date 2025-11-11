import { useState, useEffect } from 'react'

/**
 * Hook para controlar estado do Chat Widget (minimizado/expandido)
 * Persiste estado no localStorage para manter entre navegações
 */

const STORAGE_KEY = 'chatWidgetMinimized'

export function useChatWidget() {
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : true
    } catch (error) {
      console.error('Erro ao carregar estado do widget:', error)
      return true // Default: minimizado
    }
  })

  // Persiste no localStorage quando mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isMinimized))
    } catch (error) {
      console.error('Erro ao salvar estado do widget:', error)
    }
  }, [isMinimized])

  const toggleMinimize = () => setIsMinimized(prev => !prev)
  const minimize = () => setIsMinimized(true)
  const expand = () => setIsMinimized(false)

  return {
    isMinimized,
    setIsMinimized,
    toggleMinimize,
    minimize,
    expand
  }
}

// Estado global para comunicação entre componentes
// Permite que componentes externos enviem mensagens para o chat
let globalMessageQueue: string[] = []
let globalMessageListener: ((message: string) => void) | null = null

export function useGlobalChatMessage() {
  const registerListener = (listener: (message: string) => void) => {
    globalMessageListener = listener
    // Processar mensagens enfileiradas
    globalMessageQueue.forEach(msg => listener(msg))
    globalMessageQueue = []
  }

  const unregisterListener = () => {
    globalMessageListener = null
  }

  const sendGlobalMessage = (message: string) => {
    if (globalMessageListener) {
      globalMessageListener(message)
    } else {
      // Enfileirar se listener ainda não registrado
      globalMessageQueue.push(message)
    }
  }

  return {
    registerListener,
    unregisterListener,
    sendGlobalMessage
  }
}
