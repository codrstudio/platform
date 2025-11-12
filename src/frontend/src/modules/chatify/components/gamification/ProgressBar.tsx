// components/gamification/ProgressBar.tsx
/**
 * Barra de Progresso Global NIC
 *
 * Exibe uma barra horizontal fina no topo da página indicando o progresso
 * do usuário na jornada de descoberta, com cores diferentes por fase.
 *
 * - Descoberta (0-25%): Azul
 * - Exploração (26-50%): Verde
 * - Domínio (51-75%): Amarelo
 * - Maestria (76-99%): Roxo
 * - Completo (100%): Verde-sucesso
 *
 * Acessibilidade WCAG AA:
 * - role="progressbar"
 * - aria-valuenow, aria-valuemin, aria-valuemax
 * - aria-label descritivo
 *
 * Performance:
 * - Transição suave via CSS (500ms ease-out)
 * - GPU-accelerated (transform + opacity)
 * - Oculta em mobile (<768px) para economizar recursos
 */

import { useJourneyProgress } from '../../hooks/useJourneyProgress'

export function ProgressBar() {
  const { completionPercentage, currentPhase, settings } = useJourneyProgress()

  // Não renderizar se desabilitado nas configurações
  if (!settings.showProgressBar) return null

  /**
   * Cores por fase (Tailwind classes) - Adaptadas para NIC
   */
  const phaseColors = {
    descoberta: 'bg-blue-600',
    exploracao: 'bg-green-600',
    dominio: 'bg-yellow-600',
    maestria: 'bg-purple-600',
    completo: 'bg-emerald-600'
  } as const

  /**
   * Textos descritivos por fase para screen readers
   */
  const phaseLabels = {
    descoberta: 'Fase de Descoberta',
    exploracao: 'Fase de Exploração',
    dominio: 'Fase de Domínio',
    maestria: 'Fase de Maestria',
    completo: 'Jornada Completa'
  } as const

  return (
    <div
      className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 hidden md:block"
      role="progressbar"
      aria-valuenow={completionPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progresso da jornada: ${completionPercentage}% - ${phaseLabels[currentPhase]}`}
      title={`Jornada de Descoberta NIC\n${completionPercentage}% completo\n${phaseLabels[currentPhase]}`}
    >
      <div
        className={`h-full ${phaseColors[currentPhase]} transition-all duration-500 ease-out`}
        style={{ width: `${completionPercentage}%` }}
      />
    </div>
  )
}
