import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Navigation } from './Navigation'
import { BottomControls } from './BottomControls'
import { useTheme } from '../../hooks/useTheme'
import { useSidebar } from '../../hooks/useSidebar'
import logoLight from '../../assets/nic-logo-light.svg'
import logoDark from '../../assets/nic-logo-dark.svg'

/**
 * Sidebar Chatify
 * Estrutura: Logo + Toggle (top) + Menu (middle, scrollável) + Controls (bottom, fixo)
 * Responsivo: Desktop (colapsável) + Mobile (overlay)
 */
export function Sidebar() {
  const { theme } = useTheme()
  const { isExpanded, toggleSidebar, isMobile } = useSidebar()
  const currentLogo = theme === 'light' ? logoLight : logoDark

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Fechar sidebar"
        />
      )}

      <aside
        className={`
          fixed lg:relative z-50 h-screen flex flex-col
          bg-white dark:bg-nic-secondary-dark border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobile && !isExpanded ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* TOP - Logo + Toggle */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
          {/* Logo - SEMPRE visível, clique alterna expansão */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-nic-primary-dark transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
            title={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            <img
              src={currentLogo}
              alt="NIC Logo"
              className="h-10 w-auto"
            />
          </button>

          {/* Texto "Chatify" - só quando expandido, link para home */}
          {isExpanded && (
            <Link
              to="/"
              className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <span className="font-bold text-lg text-gray-900 dark:text-white truncate">
                Chatify
              </span>
            </Link>
          )}

          {/* Botão de reduzir - só aparece quando expandido */}
          {isExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-nic-primary-dark transition-colors flex-shrink-0"
              aria-label="Recolher sidebar"
              aria-expanded={isExpanded}
            >
              {isMobile ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>

        {/* MIDDLE - Navigation com scroll */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <Navigation isExpanded={isExpanded} />
        </nav>

        {/* BOTTOM - Controles fixos na base */}
        <BottomControls isExpanded={isExpanded} />
      </aside>
    </>
  )
}
