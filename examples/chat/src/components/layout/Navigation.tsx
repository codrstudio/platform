import { Link, useLocation } from 'react-router-dom'
import { Home, MessageSquare } from 'lucide-react'

/**
 * Menu de navegação NIC Chat (Sidebar)
 * Layout vertical: Home, Chat
 * Responsivo: Expandido (ícone + texto) / Colapsado (apenas ícone com tooltip)
 */

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
]

interface NavigationProps {
  isExpanded?: boolean
}

export function Navigation({ isExpanded = true }: NavigationProps) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-2">
      {navLinks.map(link => {
        const isActive = location.pathname === link.path
        const Icon = link.icon

        return (
          <Link
            key={link.path}
            to={link.path}
            title={!isExpanded ? link.label : undefined}
            className={`
              flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-sm
              ${isActive
                ? 'bg-nic-accent-light dark:bg-nic-accent-dark text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-nic-primary-dark'
              }
              ${!isExpanded && 'justify-center'}
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="truncate">{link.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
