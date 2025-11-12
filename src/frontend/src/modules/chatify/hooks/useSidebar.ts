/**
 * useSidebar - Hook para gerenciamento de sidebar
 *
 * Migrado de examples/chat/src/contexts/SidebarContext.tsx
 * Convertido para hook puro (sem Context)
 *
 * Features:
 * - Persiste estado expandido/colapsado no localStorage (apenas desktop)
 * - Detecta mobile via resize listener
 * - Em mobile: sidebar inicia fechada
 * - Em desktop: sidebar inicia expandida (ou restaura do localStorage)
 */

import { useState, useEffect } from 'react'

interface UseSidebarReturn {
  isExpanded: boolean
  toggleSidebar: () => void
  isMobile: boolean
  closeSidebar: () => void
  openSidebar: () => void
}

const MOBILE_BREAKPOINT = 1024 // lg do Tailwind
const STORAGE_KEY = 'chatify-sidebar-expanded'

export function useSidebar(): UseSidebarReturn {
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

  return {
    isExpanded,
    toggleSidebar,
    isMobile,
    closeSidebar,
    openSidebar,
  }
}
