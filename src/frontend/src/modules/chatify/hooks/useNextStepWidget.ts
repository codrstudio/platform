/**
 * useNextStepWidget - Hook para controlar visibilidade do NextStepWidget
 *
 * Migrado de examples/chat/src/contexts/NextStepWidgetContext.tsx
 * Convertido para hook puro (sem Context)
 *
 * Features:
 * - Persistência da visibilidade no storageService
 * - Sincronização entre abas
 * - Controle de visibilidade temporária do widget
 *
 * NOTA: Este hook gerencia apenas a visibilidade temporária do widget.
 * Para dispensar PERMANENTEMENTE o widget, use `dismissWidget()` do useJourneyProgress.
 */

import { useState, useEffect } from 'react'
import { storageService } from '../services/storage'

interface UseNextStepWidgetReturn {
  isVisible: boolean
  show: () => void
  hide: () => void
  toggle: () => void
}

const STORAGE_KEY = 'next-step-widget-visible'

export function useNextStepWidget(): UseNextStepWidgetReturn {
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

  return { isVisible, show, hide, toggle }
}
