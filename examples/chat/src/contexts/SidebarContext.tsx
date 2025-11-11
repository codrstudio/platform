import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextValue {
  isExpanded: boolean
  toggleSidebar: () => void
  isMobile: boolean
  closeSidebar: () => void
  openSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

const MOBILE_BREAKPOINT = 1024 // lg do Tailwind
const STORAGE_KEY = 'nic-chat-sidebar-expanded'

interface SidebarProviderProps {
  children: ReactNode
}

/**
 * Provider do Sidebar
 * Gerencia estado expandido/colapsado + detecção mobile + localStorage
 */
export function SidebarProvider({ children }: SidebarProviderProps) {
  // Estado de expansão (desktop) - inicia expandido por padrão
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    // Se não tem valor salvo, inicia expandido
    return stored !== null ? stored === 'true' : true
  })

  // Detecção de mobile
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  // Listener de resize para detectar mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Persistir estado no localStorage (apenas desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem(STORAGE_KEY, String(isExpanded))
    }
  }, [isExpanded, isMobile])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsExpanded(prev => !prev)
  }

  // Fechar sidebar (útil para mobile)
  const closeSidebar = () => {
    setIsExpanded(false)
  }

  // Abrir sidebar (útil para mobile)
  const openSidebar = () => {
    setIsExpanded(true)
  }

  // Em mobile, sidebar inicia fechada
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false)
    } else {
      // Desktop: restaurar do localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      setIsExpanded(stored !== null ? stored === 'true' : true)
    }
  }, [isMobile])

  const value: SidebarContextValue = {
    isExpanded,
    toggleSidebar,
    isMobile,
    closeSidebar,
    openSidebar,
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

/**
 * Hook para usar o SidebarContext
 */
export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
