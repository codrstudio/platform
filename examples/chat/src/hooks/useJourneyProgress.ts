// hooks/useJourneyProgress.ts
/**
 * Hook para acessar o contexto de progresso da jornada
 *
 * @throws Error se usado fora do JourneyProgressProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { completionPercentage, markPageVisited } = useJourneyProgress()
 *
 *   useEffect(() => {
 *     markPageVisited('descoberta-home')
 *   }, [])
 *
 *   return <div>Progresso: {completionPercentage}%</div>
 * }
 * ```
 */

import { useContext } from 'react'
import { JourneyProgressContext } from '@/contexts/JourneyProgressContext'
import { JourneyProgressContextType } from '@/types/journey'

export function useJourneyProgress(): JourneyProgressContextType {
  const context = useContext(JourneyProgressContext)

  if (!context) {
    throw new Error(
      'useJourneyProgress must be used within JourneyProgressProvider. ' +
      'Wrap your component tree with <JourneyProgressProvider>.'
    )
  }

  return context
}
