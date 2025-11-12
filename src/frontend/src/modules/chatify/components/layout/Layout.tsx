import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useJourneyProgress } from '../../hooks/useJourneyProgress'
import { useSidebar } from '../../hooks/useSidebar'
import { identifyJourneyStep } from '../../utils/journeyMap'

interface LayoutProps {
  children: ReactNode
}

/**
 * Layout Principal Chatify
 * Sidebar + Conteúdo + Tracking automático de jornada
 * Hamburger menu flutuante (mobile only)
 *
 * IMPORTANTE: Este componente NÃO inclui BrowserRouter.
 * Ele é usado dentro do PortalRouter que já fornece o contexto de roteamento.
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { markPageVisited } = useJourneyProgress()
  const { isMobile, isExpanded, openSidebar, closeSidebar } = useSidebar()

  // Detectar se está na página de chat
  const isChatPage = location.pathname.endsWith('/chat')

  // Tracking automático ao trocar de página
  useEffect(() => {
    const currentPath = location.pathname
    const currentSection = location.hash.replace('#', '')

    const stepId = identifyJourneyStep(currentPath, currentSection)
    if (stepId) {
      markPageVisited(stepId)
    }
  }, [location.pathname, location.hash, markPageVisited])

  // Auto-close sidebar em mobile ao navegar
  useEffect(() => {
    if (isMobile && isExpanded) {
      closeSidebar()
    }
  }, [location.pathname]) // Apenas pathname, não incluir closeSidebar para evitar loop

  // Tecla ESC fecha sidebar em mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && isExpanded) {
        closeSidebar()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMobile, isExpanded, closeSidebar])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-nic-primary-dark">
      <Sidebar />

      {/* Main content - overflow condicional: hidden para Chat, scroll para outras páginas */}
      <main className={`flex-1 relative bg-gray-100 dark:bg-nic-primary-dark ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Hamburger Menu Mobile */}
        {isMobile && !isExpanded && (
          <button
            onClick={openSidebar}
            className="fixed top-4 left-4 z-30 lg:hidden p-3 bg-white dark:bg-nic-secondary-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-nic-primary-dark transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {children}
      </main>
    </div>
  )
}
