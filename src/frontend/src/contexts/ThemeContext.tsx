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
  settingsKey?: string
}

/**
 * ThemeProvider Component
 *
 * Manages theme mode (light/dark/system) and brand color
 * SPEC-TH-CO-001 to SPEC-TH-CO-009
 */
export function ThemeProvider({ children, settingsKey = 'default' }: ThemeProviderProps) {
  // SPEC-TH-LD-008: Get theme from localStorage
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredTheme(settingsKey))

  // SPEC-TH-BC-009: Get brand color from localStorage
  const [brandColor, setBrandColorState] = useState<BrandColor>(() =>
    getStoredBrandColor(settingsKey)
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
   */
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    setStoredTheme(settingsKey, newMode) // SPEC-TH-LD-008

    // Resolve system theme
    if (newMode === 'system') {
      setResolvedTheme(getSystemTheme())
    } else {
      setResolvedTheme(newMode)
    }
  }

  /**
   * Set brand color
   * SPEC-TH-BC-020: Instant update
   */
  const setBrandColor = (color: BrandColor) => {
    setBrandColorState(color)
    setStoredBrandColor(settingsKey, color) // SPEC-TH-BC-009
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
   * Sync theme across tabs
   * SPEC-TH-LD-010
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${settingsKey}:theme` && e.newValue) {
        const newMode = e.newValue as ThemeMode
        setModeState(newMode)

        if (newMode === 'system') {
          setResolvedTheme(getSystemTheme())
        } else {
          setResolvedTheme(newMode)
        }
      }

      if (e.key === `${settingsKey}:brand-color` && e.newValue) {
        const hsl = hexToHSL(e.newValue)
        setBrandColorState(hsl)
        applyBrandColor(hsl)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [settingsKey])

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedTheme,
        brandColor,
        settingsKey,
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
