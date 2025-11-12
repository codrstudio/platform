// components/gamification/JourneyIndexModal.tsx
/**
 * Modal de Índice Completo da Jornada NIC
 *
 * Mostra todas as 14 etapas organizadas por fase.
 * Indica progresso visual e permite navegação direta.
 */

import { X, Check, Circle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useJourneyProgress } from '../../hooks/useJourneyProgress'
import { JOURNEY_MAP } from '../../utils/journeyMap'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function JourneyIndexModal({ isOpen, onClose }: Props) {
  const { visitedPages, completionPercentage, isPageVisited } = useJourneyProgress()

  if (!isOpen) return null

  // Agrupar steps por fase
  const stepsByPhase = {
    descoberta: JOURNEY_MAP.filter(s => s.phase === 'descoberta'),
    exploracao: JOURNEY_MAP.filter(s => s.phase === 'exploracao'),
    dominio: JOURNEY_MAP.filter(s => s.phase === 'dominio'),
    maestria: JOURNEY_MAP.filter(s => s.phase === 'maestria')
  }

  const phaseLabels = {
    descoberta: 'Descoberta',
    exploracao: 'Exploração',
    dominio: 'Domínio',
    maestria: 'Maestria'
  }

  const phaseColors = {
    descoberta: 'bg-blue-500',
    exploracao: 'bg-green-500',
    dominio: 'bg-yellow-500',
    maestria: 'bg-purple-500'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-nic-primary-dark rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-nic-accent-light to-nic-accent-dark text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold">🗺️ Índice da Jornada NIC</h2>
              <p className="text-sm text-white/80 mt-1">
                {visitedPages.length} de 14 etapas concluídas ({Math.round(completionPercentage)}%)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nic-accent-light to-nic-accent-dark transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-6 py-4">
            <div className="space-y-6">
              {Object.entries(stepsByPhase).map(([phase, steps]) => {
                const visitedCount = steps.filter(s => isPageVisited(s.id)).length
                const phaseProgress = (visitedCount / steps.length) * 100

                return (
                  <div key={phase} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    {/* Phase Header */}
                    <div className="bg-gray-50 dark:bg-nic-secondary-dark px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${phaseColors[phase as keyof typeof phaseColors]}`} />
                          {phaseLabels[phase as keyof typeof phaseLabels]}
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {visitedCount}/{steps.length}
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${phaseColors[phase as keyof typeof phaseColors]} transition-all duration-300`}
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Steps List */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {steps.map((step) => {
                        const visited = isPageVisited(step.id)
                        const targetUrl = step.section ? `${step.path}#${step.section}` : step.path

                        return (
                          <div
                            key={step.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-nic-secondary-dark transition-colors group"
                          >
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {visited ? (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                              )}
                            </div>

                            {/* Step Label - Clicável */}
                            <Link
                              to={targetUrl}
                              onClick={onClose}
                              className={`flex-1 text-sm ${
                                visited
                                  ? 'text-gray-700 dark:text-gray-300'
                                  : 'text-gray-900 dark:text-white font-medium'
                              } hover:text-nic-accent-light dark:hover:text-nic-accent-dark transition-colors`}
                            >
                              {step.label}
                            </Link>

                            {/* Botões de ação */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Info/Guia */}
                              <Link
                                to={`/guide/${step.id}`}
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Ver guia completo"
                              >
                                <span className="text-base">ℹ️</span>
                              </Link>

                              {/* Ir para etapa */}
                              <Link
                                to={targetUrl}
                                onClick={onClose}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Ir para etapa"
                              >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-nic-secondary-dark px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              💡 Dica: Clique em qualquer etapa para navegar diretamente
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
