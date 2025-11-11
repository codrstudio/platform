// pages/Guide.tsx
/**
 * Página de Guia de Jornada
 *
 * Exibe o conteúdo Markdown completo de uma etapa com:
 * - Sidebar com índice de todas as etapas (desktop)
 * - Conteúdo principal renderizado com MarkdownContent
 * - Navegação anterior/próxima
 * - Header com breadcrumb
 * - Links para docs externos e vídeos
 */

import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, PlayCircle, Check, Circle, Clock } from 'lucide-react'
import { useJourneyContent } from '@/hooks/useJourneyContent'
import { useJourneyProgress } from '@/hooks/useJourneyProgress'
import { JOURNEY_MAP, findStepById } from '@/utils/journeyMap'
import { MarkdownContent } from '@/components/markdown/MarkdownContent'

export function Guide() {
  const { stepId } = useParams<{ stepId: string }>()
  const step = findStepById(stepId || '')
  const { metadata, markdown, isLoading, error } = useJourneyContent(step?.contentPath)
  const { markPageVisited, isPageVisited } = useJourneyProgress()

  // Marcar como visitado ao abrir guia
  useEffect(() => {
    if (step) {
      markPageVisited(step.id)
    }
  }, [step, markPageVisited])

  // Scroll to top ao navegar entre etapas
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [stepId])

  // Navegação anterior/próxima
  const currentIndex = JOURNEY_MAP.findIndex(s => s.id === stepId)
  const prevStep = currentIndex > 0 ? JOURNEY_MAP[currentIndex - 1] : null
  const nextStep = currentIndex < JOURNEY_MAP.length - 1 ? JOURNEY_MAP[currentIndex + 1] : null

  // Se step não existe, redirecionar para home
  if (!stepId || !step) {
    return <Navigate to="/" replace />
  }

  // Cores por fase
  const phaseColors: Record<string, string> = {
    descoberta: 'text-blue-600 dark:text-blue-400',
    exploracao: 'text-green-600 dark:text-green-400',
    dominio: 'text-yellow-600 dark:text-yellow-400',
    maestria: 'text-purple-600 dark:text-purple-400',
    completo: 'text-green-600 dark:text-green-400'
  }

  const phaseLabels: Record<string, string> = {
    descoberta: 'Descoberta',
    exploracao: 'Exploração',
    dominio: 'Domínio',
    maestria: 'Maestria',
    completo: 'Completo'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nic-primary-dark">
      {/* Header com breadcrumb */}
      <header className="bg-white dark:bg-nic-secondary-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Jornada</span>
                <span>/</span>
                <span className={`font-medium ${phaseColors[step.phase]}`}>
                  {phaseLabels[step.phase]}
                </span>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                  {metadata.title || step.label}
                </span>
              </div>
            </div>

            {/* Tempo estimado (mobile hidden) */}
            {metadata.estimatedTime && (
              <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{metadata.estimatedTime}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar (índice) - Desktop only */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                Índice da Jornada
              </h3>
              <nav className="space-y-0.5 text-sm">
                {JOURNEY_MAP.map(s => {
                  const isActive = s.id === stepId
                  const isVisited = isPageVisited(s.id)

                  return (
                    <Link
                      key={s.id}
                      to={`/guide/${s.id}`}
                      className={`block px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isActive
                          ? 'bg-nic-accent-light dark:bg-nic-accent-dark text-white font-medium'
                          : isVisited
                          ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isVisited ? (
                        <Check className="w-3.5 h-3.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{s.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Progress summary */}
              <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Progresso Total</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {JOURNEY_MAP.filter(s => isPageVisited(s.id)).length} / {JOURNEY_MAP.length}
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <main className="lg:col-span-3">
            <article className="bg-white dark:bg-nic-secondary-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">

              {/* Loading state */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-nic-accent-light dark:border-nic-accent-dark"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando conteúdo...</p>
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    ⚠️ Erro ao carregar conteúdo
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {error.message}
                  </p>
                </div>
              )}

              {/* Content loaded */}
              {!isLoading && !error && (
                <>
                  {/* Header do guia */}
                  <div className="mb-8">
                    <div className="flex items-start gap-4 mb-4">
                      {metadata.icon && <span className="text-5xl">{metadata.icon}</span>}
                      <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                          {metadata.title || step.label}
                        </h1>
                        {metadata.estimatedTime && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Tempo estimado: {metadata.estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Objetivos */}
                    {metadata.objectives && metadata.objectives.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400">🎯</span>
                          O que você vai aprender
                        </h3>
                        <ul className="space-y-2">
                          {metadata.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo Markdown */}
                  <MarkdownContent content={markdown} />

                  {/* Links externos */}
                  {(metadata.docsUrl || metadata.videoUrl) && (
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
                      {metadata.docsUrl && (
                        <a
                          href={metadata.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-nic-accent-light dark:bg-nic-accent-dark text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Documentação Completa
                        </a>
                      )}
                      {metadata.videoUrl && (
                        <a
                          href={metadata.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Assistir Tutorial
                        </a>
                      )}
                    </div>
                  )}

                  {/* Navegação anterior/próxima */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
                    {prevStep ? (
                      <Link
                        to={`/guide/${prevStep.id}`}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-nic-accent-light dark:hover:text-nic-accent-dark transition-colors group"
                      >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <div className="text-left">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Anterior</p>
                          <p className="font-medium text-sm">{prevStep.label}</p>
                        </div>
                      </Link>
                    ) : (
                      <div />
                    )}

                    {nextStep ? (
                      <Link
                        to={`/guide/${nextStep.id}`}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-nic-accent-light dark:hover:text-nic-accent-dark transition-colors group"
                      >
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Próxima</p>
                          <p className="font-medium text-sm">{nextStep.label}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          🎉 Jornada completa!
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </article>
          </main>
        </div>
      </div>
    </div>
  )
}
