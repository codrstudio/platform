// contexts/JourneyProgressContext.tsx
/**
 * Context Provider para Jornada de Descoberta
 *
 * Gerencia todo o estado do progresso do usuário na jornada,
 * incluindo persistência em localStorage e sincronização entre abas.
 */

import { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { JourneyProgress, JourneyProgressContextType, JourneyStep } from '@/types/journey'
import {
  calculateProgress,
  getNextStep,
  getCurrentPhase,
  isJourneyComplete as checkJourneyComplete,
  identifyJourneyStep,
  findStepById
} from '@/utils/journeyMap'
import { storageService } from '@/services/storage'

const STORAGE_KEY = 'journey-progress'

/**
 * Contexto global do progresso da jornada
 */
export const JourneyProgressContext = createContext<JourneyProgressContextType | undefined>(undefined)

interface Props {
  children: ReactNode
}

/**
 * Estado inicial do progresso (primeira visita)
 */
const getInitialProgress = (): JourneyProgress => ({
  visitedPages: [],
  lastVisited: '',
  completionPercentage: 0,
  timestamp: Date.now(),
  currentPhase: 'descoberta',
  achievementShown: false,
  widgetDismissed: false,
  welcomeShown: false,
  settings: {
    showProgressBar: true,
    showNextStepWidget: true
  }
})

/**
 * Carrega progresso do storage com validação
 */
const loadProgressFromStorage = (): JourneyProgress => {
  const stored = storageService.get<JourneyProgress>(STORAGE_KEY)

  if (!stored) {
    return getInitialProgress()
  }

  // Validação básica de estrutura
  if (!Array.isArray(stored.visitedPages)) {
    console.warn('Invalid progress data in storage, resetting...')
    return getInitialProgress()
  }

  return stored
}

/**
 * Salva progresso no storage (debounce gerenciado pelo storageService)
 */
const saveProgressToStorage = (progress: JourneyProgress): void => {
  storageService.set(STORAGE_KEY, progress)
}

/**
 * Provider do contexto de progresso da jornada
 */
export function JourneyProgressProvider({ children }: Props) {
  const [progress, setProgress] = useState<JourneyProgress>(loadProgressFromStorage)

  // ==================== SINCRONIZAÇÃO ENTRE ABAS ====================

  useEffect(() => {
    /**
     * Listener para mudanças no storage (sincronização entre abas)
     * Gerenciado pelo storageService
     */
    const unsubscribe = storageService.subscribe<JourneyProgress>(
      STORAGE_KEY,
      (newProgress) => {
        if (newProgress) {
          setProgress(newProgress)
        }
      }
    )

    return unsubscribe
  }, [])

  // ==================== SALVAR PROGRESSO AO MUDAR ====================

  useEffect(() => {
    saveProgressToStorage(progress)
  }, [progress])

  // ==================== FUNÇÕES DO CONTEXT ====================

  /**
   * Marca uma página como visitada
   */
  const markPageVisited = useCallback((pageId: string) => {
    setProgress(prev => {
      // Já visitada? Ignorar
      if (prev.visitedPages.includes(pageId)) return prev

      const newVisitedPages = [...prev.visitedPages, pageId]
      const newPercentage = calculateProgress(newVisitedPages)
      const newPhase = getCurrentPhase(newPercentage)

      return {
        ...prev,
        visitedPages: newVisitedPages,
        lastVisited: pageId,
        completionPercentage: newPercentage,
        currentPhase: newPhase,
        timestamp: Date.now()
      }
    })
  }, [])

  /**
   * Verifica se uma página foi visitada
   */
  const isPageVisited = useCallback(
    (pageId: string): boolean => {
      return progress.visitedPages.includes(pageId)
    },
    [progress.visitedPages]
  )

  /**
   * Retorna próxima etapa recomendada
   */
  const getNextRecommendedStep = useCallback((): JourneyStep | null => {
    return getNextStep(progress.visitedPages)
  }, [progress.visitedPages])

  /**
   * Retorna a etapa atual baseada em pathname e hash
   * Usado pelo widget para mostrar informações da página atual
   */
  const getCurrentStep = useCallback((pathname: string, hash: string = ''): JourneyStep | null => {
    const stepId = identifyJourneyStep(pathname, hash)
    if (!stepId) return null
    return findStepById(stepId) || null
  }, [])

  /**
   * Reinicia a jornada completamente
   */
  const resetJourney = useCallback(() => {
    const initialProgress = getInitialProgress()
    setProgress(initialProgress)
    storageService.remove(STORAGE_KEY)
  }, [])

  /**
   * Dispensa globalmente o widget de próxima etapa
   */
  const dismissWidget = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      widgetDismissed: true,
      timestamp: Date.now()
    }))
  }, [])

  /**
   * Reabre o widget após ter sido dispensado
   */
  const undismissWidget = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      widgetDismissed: false,
      timestamp: Date.now()
    }))
  }, [])

  /**
   * Marca que a mensagem de boas-vindas foi exibida
   */
  const markWelcomeShown = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      welcomeShown: true,
      timestamp: Date.now()
    }))
  }, [])

  /**
   * Marca que o modal de conquista já foi exibido
   */
  const markAchievementShown = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      achievementShown: true,
      timestamp: Date.now()
    }))
  }, [])

  /**
   * Atualiza configurações de exibição
   */
  const updateSettings = useCallback((newSettings: Partial<JourneyProgress['settings']>) => {
    setProgress(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      },
      timestamp: Date.now()
    }))
  }, [])

  /**
   * Verifica se jornada está completa
   */
  const isJourneyComplete = useCallback((): boolean => {
    return checkJourneyComplete(progress.visitedPages)
  }, [progress.visitedPages])

  // ==================== CONTEXT VALUE COM MEMOIZAÇÃO ====================

  /**
   * Value do context com useMemo para evitar re-renders desnecessários
   */
  const contextValue = useMemo<JourneyProgressContextType>(
    () => ({
      progress,
      markPageVisited,
      isPageVisited,
      getNextRecommendedStep,
      getCurrentStep,
      resetJourney,
      dismissWidget,
      undismissWidget,
      markWelcomeShown,
      markAchievementShown,
      updateSettings,
      isJourneyComplete,
      // Atalhos para facilitar consumo
      completionPercentage: progress.completionPercentage,
      currentPhase: progress.currentPhase,
      settings: progress.settings
    }),
    [
      progress,
      markPageVisited,
      isPageVisited,
      getNextRecommendedStep,
      getCurrentStep,
      resetJourney,
      dismissWidget,
      undismissWidget,
      markWelcomeShown,
      markAchievementShown,
      updateSettings,
      isJourneyComplete
    ]
  )

  return (
    <JourneyProgressContext.Provider value={contextValue}>
      {children}
    </JourneyProgressContext.Provider>
  )
}
