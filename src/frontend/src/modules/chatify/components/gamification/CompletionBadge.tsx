// components/gamification/CompletionBadge.tsx
/**
 * Modal de Conquista 100% NIC
 *
 * Exibe modal de celebração quando usuário completa a jornada.
 * Mostra apenas uma vez (salva em localStorage).
 */

import { useState, useEffect } from 'react'
import { useJourneyProgress } from '../../hooks/useJourneyProgress'
import { ConfettiEffect } from './ConfettiEffect'

export function CompletionBadge() {
  const { isJourneyComplete, progress, markAchievementShown } = useJourneyProgress()
  const [showModal, setShowModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isJourneyComplete() && !progress.achievementShown) {
      setShowConfetti(true)
      setShowModal(true)

      // Parar confete após 2s
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }, [isJourneyComplete, progress.achievementShown])

  const handleClose = () => {
    setShowModal(false)
    markAchievementShown()
  }

  if (!showModal) return null

  return (
    <>
      {showConfetti && <ConfettiEffect />}

      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
        onClick={handleClose}
      >
        <div
          className="bg-white dark:bg-nic-primary-dark rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4 animate-bounce">🎉</div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Parabéns, Expert NIC!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você concluiu toda a jornada de descoberta do NIC Chat e agora domina todos os recursos!
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-nic-accent-light dark:bg-nic-accent-dark text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Começar a Usar! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
