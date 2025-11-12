/**
 * useJourneyProgress - Hook para gerenciamento de progresso da jornada
 *
 * Migrado de examples/chat/src/contexts/JourneyProgressContext.tsx
 * Convertido para hook puro (sem Context)
 *
 * Features:
 * - Tracking automático de páginas visitadas
 * - Cálculo de porcentagem de conclusão
 * - Persistência no storageService
 * - Sincronização entre abas
 * - Sistema de conquistas/achievements
 * - Widget de próxima etapa
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { JourneyProgress, JourneyStep } from '../types'
import {
  calculateProgress,
  getNextStep,
  getCurrentPhase,
  isJourneyComplete as checkJourneyComplete,
  identifyJourneyStep,
  findStepById
} from '../utils/journeyMap'
import { storageService } from '../services/storage'

const STORAGE_KEY = 'journey-progress'

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

interface UseJourneyProgressReturn extends JourneyProgress {
  // Funções principais
  markPageVisited: (pageId: string) => void
  isPageVisited: (pageId: string) => boolean
  getNextRecommendedStep: () => JourneyStep | null
  getCurrentStep: (pathname: string, hash?: string) => JourneyStep | null
  resetJourney: () => void

  // Widget
  dismissWidget: () => void
  undismissWidget: () => void

  // UI State
  markWelcomeShown: () => void
  markAchievementShown: () => void
  updateSettings: (newSettings: Partial<JourneyProgress['settings']>) => void

  // Status
  isJourneyComplete: () => boolean
}

export function useJourneyProgress(): UseJourneyProgressReturn {
  const [progress, setProgress] = useState<JourneyProgress>(loadProgressFromStorage)

  // ==================== SINCRONIZAÇÃO ENTRE ABAS ====================

  useEffect(() => {
    /**
     * Listener para mudanças no storage (sincronização entre abas)
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
    storageService.set(STORAGE_KEY, progress)
  }, [progress])

  // ==================== FUNÇÕES ====================

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

  // ==================== RETURN COM MEMOIZAÇÃO ====================

  return useMemo<UseJourneyProgressReturn>(
    () => ({
      // Progress state
      ...progress,

      // Functions
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
}
