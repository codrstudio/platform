// components/gamification/NextStepWidget.tsx
/**
 * Widget Flutuante de Guia Contextual NIC
 *
 * Dois estados:
 * 1. Boas-vindas (primeira vez): Explica o que é a jornada
 * 2. Guia contextual: Mostra informações da página atual + próxima etapa
 *    - Título da página atual
 *    - Descrição breve do que é a página
 *    - Botão "Ver Documentação" (com ícone BookOpen)
 *    - Botão "Próxima Etapa" (se houver próxima)
 *
 * Controle de visibilidade:
 * - hide(): Oculta temporariamente (reaparece no auto-show ou toggle manual)
 * - dismiss(): Dispensa PERMANENTEMENTE (não reaparece nunca mais até undismiss)
 *
 * Botão toggle sempre visível para abrir/fechar manualmente.
 */

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, ArrowRight, BookOpen } from 'lucide-react'
import { useJourneyProgress } from '../../hooks/useJourneyProgress'
import { useNextStepWidget } from '../../hooks/useNextStepWidget'

export function NextStepWidget() {
  const location = useLocation()
  const {
    getNextRecommendedStep,
    getCurrentStep,
    progress,
    markWelcomeShown,
    dismissWidget,
    settings
  } = useJourneyProgress()
  const { isVisible, hide, show } = useNextStepWidget()
  const [hasAutoShown, setHasAutoShown] = useState(false)

  const nextStep = getNextRecommendedStep()
  const currentStep = getCurrentStep(location.pathname, location.hash)
  const isWelcomeState = !progress.welcomeShown

  // Auto-show após 30s OU scroll >70% (apenas na primeira vez)
  useEffect(() => {
    if (hasAutoShown || isVisible || !nextStep || progress.completionPercentage >= 100) {
      return
    }

    // Timer de 30s
    const timer = setTimeout(() => {
      show()
      setHasAutoShown(true)
    }, 30000)

    // Scroll >70%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercent > 70) {
        show()
        setHasAutoShown(true)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasAutoShown, isVisible, nextStep, progress.completionPercentage, show])

  // Função para aceitar o tour (garante que widget continua visível)
  const handleStartTour = () => {
    markWelcomeShown()
    show()
  }

  // Função para dispensar PERMANENTEMENTE o widget
  const handleDismiss = () => {
    dismissWidget()
    hide()
  }

  // Não renderizar se:
  // 1. Widget foi dispensado permanentemente (usuário clicou no X)
  // 2. Desabilitado nas configurações
  // 3. Jornada completa
  // 4. Não há próxima etapa
  if (
    progress.widgetDismissed ||
    !settings.showNextStepWidget ||
    !nextStep ||
    progress.completionPercentage >= 100
  ) {
    return null
  }

  // Construir URL completo (com section se aplicável)
  const targetUrl = nextStep.section ? `${nextStep.path}#${nextStep.section}` : nextStep.path

  return (
    <>
      {/* Widget - Estado 1: Boas-vindas (primeira vez) */}
      {isVisible && isWelcomeState && (
        <div className="fixed bottom-4 left-4 z-[100] max-w-sm animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-gradient-to-br from-nic-accent-light to-nic-accent-dark text-white rounded-xl shadow-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                <h3 className="font-bold text-base">
                  Bem-vindo à Jornada NIC! 🎯
                </h3>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Dispensar guia permanentemente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-white/90 mb-4 leading-relaxed">
              Este é o <strong>guia interativo</strong> que vai te mostrar todas as funcionalidades do NIC Chat.
              Acompanhe seu progresso e descubra tudo que preparamos para você!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleStartTour}
                className="flex-1 bg-white text-nic-accent-light py-2 px-4 rounded-lg hover:bg-white/90 transition-colors text-sm font-semibold flex items-center justify-center gap-1"
              >
                Começar Tour <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-white/90 hover:text-white text-sm font-medium"
              >
                Não mostrar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget - Estado 2: Guia da página atual + próxima etapa */}
      {isVisible && !isWelcomeState && currentStep && (
        <div className="fixed bottom-4 left-4 z-[100] max-w-sm animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-white dark:bg-nic-primary-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            {/* Cabeçalho com botão fechar */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                📍 Você está em: {currentStep.label}
              </h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Dispensar widget permanentemente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Descrição da página atual */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {currentStep.description || 'Explore esta seção para conhecer mais funcionalidades.'}
            </p>

            {/* Botões de ação */}
            <div className="flex flex-col gap-2">
              {/* Botão Ver Documentação */}
              <Link
                to={`/guide/${currentStep.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Ver documentação completa desta página"
              >
                <BookOpen className="w-4 h-4" />
                Ver Documentação
              </Link>

              {/* Botão Próxima Etapa (apenas se houver) */}
              {nextStep && (
                <Link
                  to={targetUrl}
                  className="flex items-center justify-center gap-2 bg-nic-accent-light dark:bg-nic-accent-dark text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Próxima Etapa: {nextStep.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
