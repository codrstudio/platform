/**
 * useTheme - Hook para gerenciamento de tema (light/dark)
 *
 * Migrado de examples/chat/src/contexts/ThemeContext.tsx
 * Convertido para hook puro (sem Context)
 *
 * Features:
 * - Persiste preferência no localStorage
 * - Detecta preferência do sistema (prefers-color-scheme)
 * - Aplica classe 'dark' no documentElement
 */

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface UseThemeReturn {
  theme: Theme
  toggleTheme: () => void
}

const STORAGE_KEY = 'chatify-theme'

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar preferência salva no localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved) return saved

    // Verificar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}
