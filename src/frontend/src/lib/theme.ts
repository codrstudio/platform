// Theme Utilities
// Based on SPEC-theming.md

import type { BrandColor, ThemeMode } from '@/types/theme'
import { DEFAULT_BRAND_COLOR } from '@/types/theme'

/**
 * Convert HEX color to HSL
 * SPEC-TH-BC-007
 */
export function hexToHSL(hex: string): BrandColor {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / delta + 2) / 6
        break
      case b:
        h = ((r - g) / delta + 4) / 6
        break
    }
  }

  return {
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  }
}

/**
 * Convert HSL to string format for CSS
 * SPEC-TH-BC-006: "hue saturation% lightness%"
 */
export function hslToString(color: BrandColor): string {
  return `${color.hue} ${color.saturation}% ${color.lightness}%`
}

/**
 * Parse HSL string to BrandColor
 */
export function parseHSL(hslString: string): BrandColor {
  const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  if (!match) {
    return DEFAULT_BRAND_COLOR
  }

  return {
    hue: parseInt(match[1]),
    saturation: parseInt(match[2]),
    lightness: parseInt(match[3]),
  }
}

/**
 * Calculate contrast ratio between two colors
 * Used for WCAG AA validation
 * SPEC-TH-AC-002
 */
export function calculateContrast(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Validate brand color contrast for accessibility
 * SPEC-TH-AC-005 to SPEC-TH-AC-008
 */
export function validateBrandColorContrast(
  color: BrandColor,
  isDark: boolean
): { valid: boolean; adjusted?: BrandColor } {
  const backgroundLightness = isDark ? 10 : 98 // Approximate background lightness
  const colorLightness = color.lightness

  const contrast = calculateContrast(colorLightness / 100, backgroundLightness / 100)
  const minContrast = 4.5 // WCAG AA for normal text

  if (contrast >= minContrast) {
    return { valid: true }
  }

  // Adjust lightness to meet contrast requirements
  let adjusted = { ...color }

  if (isDark) {
    // Dark theme: lighten the color
    adjusted.lightness = Math.min(90, color.lightness + 20)
  } else {
    // Light theme: darken the color
    adjusted.lightness = Math.max(30, color.lightness - 20)
  }

  return { valid: false, adjusted }
}

/**
 * Get theme from localStorage
 * SPEC-TH-LD-008, SPEC-TH-LD-009
 */
export function getStoredTheme(settingsKey: string): ThemeMode {
  try {
    const stored = localStorage.getItem(`${settingsKey}:theme`)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage not available
  }
  return 'system' // SPEC-TH-LD-006: fallback
}

/**
 * Set theme in localStorage
 * SPEC-TH-LD-008
 */
export function setStoredTheme(settingsKey: string, mode: ThemeMode): void {
  try {
    localStorage.setItem(`${settingsKey}:theme`, mode)
  } catch {
    // localStorage not available
  }
}

/**
 * Get brand color from localStorage
 * SPEC-TH-BC-009, SPEC-TH-BC-010
 */
export function getStoredBrandColor(settingsKey: string): BrandColor {
  try {
    const stored = localStorage.getItem(`${settingsKey}:brand-color`)
    if (stored) {
      return parseHSL(stored)
    }
  } catch {
    // localStorage not available
  }
  return DEFAULT_BRAND_COLOR // SPEC-TH-BC-021
}

/**
 * Set brand color in localStorage
 * SPEC-TH-BC-009
 */
export function setStoredBrandColor(settingsKey: string, color: BrandColor): void {
  try {
    localStorage.setItem(`${settingsKey}:brand-color`, hslToString(color))
  } catch {
    // localStorage not available
  }
}

/**
 * Detect system theme preference
 * SPEC-TH-LD-016
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  return mediaQuery.matches ? 'dark' : 'light'
}

/**
 * Apply theme to document
 * SPEC-TH-LD-012, SPEC-TH-LD-013
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement

  // Remove both classes first
  root.classList.remove('light', 'dark')

  // Add appropriate class
  root.classList.add(theme)
}

/**
 * Apply brand color to document
 * SPEC-TH-BC-017, SPEC-TH-BC-018
 */
export function applyBrandColor(color: BrandColor): void {
  const root = document.documentElement
  root.style.setProperty('--primary', hslToString(color))

  // Calculate foreground color (contrasting color for text)
  const foreground = color.lightness > 50 ? { ...color, lightness: 10 } : { ...color, lightness: 98 }
  root.style.setProperty('--primary-foreground', hslToString(foreground))
}
