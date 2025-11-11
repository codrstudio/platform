// contexts/NextStepWidgetContext.tsx
/**
 * Context para controlar visibilidade do NextStepWidget
 *
 * Features:
 * - Persistência da visibilidade no storage
 * - Sincronização entre abas
 * - Permite que componentes externos (como FloatingActionStack) controlem o toggle
 *
 * NOTA: Este context gerencia apenas a visibilidade temporária do widget.
 * Para dispensar PERMANENTEMENTE o widget, use `dismissWidget()` do JourneyProgressContext.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { storageService } from '@/services/storage'

interface NextStepWidgetContextType {
  isVisible: boolean
  show: () => void
  hide: () => void
  toggle: () => void
}

const NextStepWidgetContext = createContext<NextStepWidgetContextType | undefined>(undefined)

const STORAGE_KEY = 'next-step-widget-visible'

export function NextStepWidgetProvider({ children }: { children: ReactNode }) {
  // Inicializar estado do storage (padrão: false = oculto)
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const stored = storageService.get<boolean>(STORAGE_KEY)
    return stored ?? false
  })

  // Sincronizar com storage quando mudar
  useEffect(() => {
    storageService.set(STORAGE_KEY, isVisible)
  }, [isVisible])

  // Listener para sincronização entre abas
  useEffect(() => {
    const unsubscribe = storageService.subscribe<boolean>(
      STORAGE_KEY,
      (newValue) => {
        if (newValue !== null) {
          setIsVisible(newValue)
        }
      }
    )

    return unsubscribe
  }, [])

  const show = () => setIsVisible(true)
  const hide = () => setIsVisible(false)
  const toggle = () => setIsVisible(prev => !prev)

  return (
    <NextStepWidgetContext.Provider value={{ isVisible, show, hide, toggle }}>
      {children}
    </NextStepWidgetContext.Provider>
  )
}

export function useNextStepWidget() {
  const context = useContext(NextStepWidgetContext)
  if (!context) {
    throw new Error('useNextStepWidget must be used within NextStepWidgetProvider')
  }
  return context
}
