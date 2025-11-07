// Theme Toggle Component
// Based on SPEC-theming.md

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeMode } from '@/types/theme'

/**
 * ThemeToggle Component
 *
 * Allows user to switch between light, dark, and system themes
 * SPEC-TH-LD-*, SPEC-TH-AC-*
 */
export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const themes: Array<{ mode: ThemeMode; icon: React.ReactNode; label: string }> = [
    { mode: 'light', icon: <Sun className="h-5 w-5" />, label: 'Tema claro' },
    { mode: 'dark', icon: <Moon className="h-5 w-5" />, label: 'Tema escuro' },
    { mode: 'system', icon: <Monitor className="h-5 w-5" />, label: 'Tema do sistema' },
  ]

  const handleToggle = () => {
    // Cycle through themes: light → dark → system → light
    const currentIndex = themes.findIndex((t) => t.mode === mode)
    const nextIndex = (currentIndex + 1) % themes.length
    setMode(themes[nextIndex].mode)
  }

  const currentTheme = themes.find((t) => t.mode === mode) || themes[0]

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Alternar tema. Tema atual: ${currentTheme.label}`}
      title={currentTheme.label}
    >
      {currentTheme.icon}
      <span className="text-sm font-medium">{currentTheme.label}</span>
    </button>
  )
}

/**
 * ThemeToggleCompact Component
 *
 * Compact version showing only icon
 */
export function ThemeToggleCompact() {
  const { mode, setMode } = useTheme()

  const themes: Array<{ mode: ThemeMode; icon: React.ReactNode; label: string }> = [
    { mode: 'light', icon: <Sun className="h-5 w-5" />, label: 'Tema claro' },
    { mode: 'dark', icon: <Moon className="h-5 w-5" />, label: 'Tema escuro' },
    { mode: 'system', icon: <Monitor className="h-5 w-5" />, label: 'Tema do sistema' },
  ]

  const handleToggle = () => {
    const currentIndex = themes.findIndex((t) => t.mode === mode)
    const nextIndex = (currentIndex + 1) % themes.length
    setMode(themes[nextIndex].mode)
  }

  const currentTheme = themes.find((t) => t.mode === mode) || themes[0]

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center justify-center p-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Alternar tema. Tema atual: ${currentTheme.label}`}
      title={currentTheme.label}
    >
      {currentTheme.icon}
    </button>
  )
}
