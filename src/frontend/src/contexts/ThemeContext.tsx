// Theme Context
// Based on SPEC-theming.md

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ThemeMode, ResolvedTheme, BrandColor, ThemeContextValue } from '@/types/theme'
import {
  getStoredTheme,
  setStoredTheme,
  getStoredBrandColor,
  setStoredBrandColor,
  getSystemTheme,
  applyTheme,
  applyBrandColor,
  hexToHSL,
} from '@/lib/theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  realmId?: string
  portalId?: string
}

/**
 * ThemeProvider Component
 *
 * Manages theme mode (light/dark/system) and brand color
 * SPEC-TH-CO-001 to SPEC-TH-CO-009
 * BREAKING CHANGE: settingsKey replaced with realmId + portalId (Realm System)
 */
export function ThemeProvider({ children, realmId = 'default', portalId = '' }: ThemeProviderProps) {
  // SPEC-TH-LD-008: Get theme from localStorage (realm level only)
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredTheme(realmId))

  // SPEC-TH-BC-009: Get brand color from localStorage (3-level resolution)
  const [brandColor, setBrandColorState] = useState<BrandColor>(() =>
    getStoredBrandColor(realmId, portalId || undefined)
  )

  // SPEC-TH-LD-014: Resolve "system" to actual theme
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (mode === 'system') {
      return getSystemTheme()
    }
    return mode
  })

  /**
   * Set theme mode
   * SPEC-TH-LD-004: Instant update without reload
   * SPEC-TH-HC-020: Theme mode is realm-level only
   */
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    setStoredTheme(realmId, newMode) // SPEC-TH-LD-008

    // Resolve system theme
    if (newMode === 'system') {
      setResolvedTheme(getSystemTheme())
    } else {
      setResolvedTheme(newMode)
    }
  }

  /**
   * Set brand color (realm level)
   * SPEC-TH-BC-020: Instant update
   * SPEC-TH-HC-021: Applies to all portals in realm
   */
  const setBrandColor = (color: BrandColor) => {
    setBrandColorState(color)
    setStoredBrandColor(realmId, color) // SPEC-TH-BC-009
    applyBrandColor(color)
  }

  /**
   * Set brand color from HEX
   * SPEC-TH-BC-007
   */
  const setBrandColorFromHex = (hex: string) => {
    const hsl = hexToHSL(hex)
    setBrandColor(hsl)
  }

  /**
   * Apply theme on mount and when resolved theme changes
   * SPEC-TH-LD-012
   */
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  /**
   * Apply brand color on mount
   * SPEC-TH-BC-017
   */
  useEffect(() => {
    applyBrandColor(brandColor)
  }, [brandColor])

  /**
   * Listen to system theme changes
   * SPEC-TH-LD-015, SPEC-TH-LD-017
   */
  useEffect(() => {
    if (mode !== 'system') {
      return
    }

    // SPEC-TH-LD-016: Use matchMedia
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
    }

    // SPEC-TH-LD-017: Listen to changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mode])

  /**
   * Keyboard shortcut: Ctrl+Shift+D to cycle through themes
   * SPEC-TH-AC-015a to SPEC-TH-AC-015e
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // SPEC-TH-AC-015a: Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault() // SPEC-TH-AC-015b

        // SPEC-TH-AC-015c: Cycle through light → dark → system → light
        const themeSequence: ThemeMode[] = ['light', 'dark', 'system']
        const currentIndex = themeSequence.indexOf(mode)
        const nextIndex = (currentIndex + 1) % themeSequence.length
        const nextMode = themeSequence[nextIndex]

        setMode(nextMode)

        // SPEC-TH-AC-015e: Visual feedback (optional toast)
        // Toast is imported in components that need it
      }
    }

    // SPEC-TH-AC-015d: Global registration
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mode])

  /**
   * Sync theme across tabs
   * SPEC-TH-LD-010
   * SPEC-TH-HC-025: Portal customizations persist across realm changes
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Theme mode changed (realm level)
      if (e.key === `realm:${realmId}:theme` && e.newValue) {
        const newMode = e.newValue as ThemeMode
        setModeState(newMode)

        if (newMode === 'system') {
          setResolvedTheme(getSystemTheme())
        } else {
          setResolvedTheme(newMode)
        }
      }

      // Brand color changed (realm level)
      if (e.key === `realm:${realmId}:brand-color` && e.newValue) {
        const hsl = hexToHSL(e.newValue)
        setBrandColorState(hsl)
        applyBrandColor(hsl)
      }

      // Portal brand color override changed
      if (portalId && e.key === `portal:${portalId}:brand-color`) {
        if (e.newValue) {
          const hsl = hexToHSL(e.newValue)
          setBrandColorState(hsl)
          applyBrandColor(hsl)
        } else {
          // Portal override removed, fall back to realm color
          const realmColor = getStoredBrandColor(realmId)
          setBrandColorState(realmColor)
          applyBrandColor(realmColor)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [realmId, portalId])

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedTheme,
        brandColor,
        realmId,
        portalId,
        setMode,
        setBrandColor,
        setBrandColorFromHex,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
