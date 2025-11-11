import { Link } from 'react-router-dom'
import { Moon, Sun, Settings } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface BottomControlsProps {
  isExpanded?: boolean
}

/**
 * Bottom Controls - Sidebar
 * Tema + Configurações em layout vertical
 */
export function BottomControls({ isExpanded = true }: BottomControlsProps) {
  const { theme, toggleTheme } = useTheme()
  const themeLabel = theme === 'light' ? 'Light' : 'Dark'
  const ThemeIcon = theme === 'light' ? Moon : Sun

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-nic-primary-dark transition-colors text-left"
        title={`Tema: ${themeLabel}`}
        aria-label={`Alternar tema (atual: ${themeLabel})`}
      >
        <ThemeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
        {isExpanded && (
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tema
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {themeLabel}
            </span>
          </div>
        )}
      </button>

      {/* Settings */}
      <Link
        to="/admin"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-nic-primary-dark transition-colors"
        title="Configurações"
        aria-label="Ir para configurações"
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
        {isExpanded && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Configurações
          </span>
        )}
      </Link>
    </div>
  )
}
