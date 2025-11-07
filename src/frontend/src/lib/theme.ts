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
 * Convert HSL to HEX color
 * Inverse of hexToHSL
 */
export function hslToHex(color: BrandColor): string {
  const h = color.hue / 360
  const s = color.saturation / 100
  const l = color.lightness / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
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
 * Get theme mode from localStorage (3-level resolution)
 * SPEC-TH-HC-005: Portal → Realm → System
 * NOTE: Theme mode is NOT customizable per portal, always comes from realm
 */
export function getStoredTheme(realmId: string): ThemeMode {
  try {
    // Theme mode is ONLY at realm level (not portal level)
    const stored = localStorage.getItem(`realm:${realmId}:theme`)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage not available
  }
  return 'system' // SPEC-TH-HC-009: System default
}

/**
 * Set theme mode in localStorage (realm level only)
 * SPEC-TH-HC-020, SPEC-TH-HC-021
 */
export function setStoredTheme(realmId: string, mode: ThemeMode): void {
  try {
    localStorage.setItem(`realm:${realmId}:theme`, mode)
  } catch {
    // localStorage not available
  }
}

/**
 * Get brand color from localStorage (3-level resolution)
 * SPEC-TH-HC-005: Portal → Realm → System
 * SPEC-TH-HC-025: Portal customizations persist across realm changes
 */
export function getStoredBrandColor(realmId: string, portalId?: string): BrandColor {
  try {
    // Level 1: Check portal override (if portalId provided)
    // SPEC-TH-HC-022, SPEC-TH-HC-023
    if (portalId) {
      const portalColor = localStorage.getItem(`portal:${portalId}:brand-color`)
      if (portalColor) {
        return parseHSL(portalColor)
      }
    }

    // Level 2: Check realm config
    // SPEC-TH-HC-020, SPEC-TH-HC-021
    const realmColor = localStorage.getItem(`realm:${realmId}:brand-color`)
    if (realmColor) {
      return parseHSL(realmColor)
    }
  } catch {
    // localStorage not available
  }

  // Level 3: System default
  // SPEC-TH-HC-010
  return DEFAULT_BRAND_COLOR
}

/**
 * Set brand color in localStorage (realm level)
 * SPEC-TH-HC-020, SPEC-TH-HC-021
 */
export function setStoredBrandColor(realmId: string, color: BrandColor): void {
  try {
    localStorage.setItem(`realm:${realmId}:brand-color`, hslToString(color))
  } catch {
    // localStorage not available
  }
}

/**
 * Set brand color override for portal
 * SPEC-TH-HC-022, SPEC-TH-HC-023, SPEC-TH-HC-025
 * Portal-specific brand color (customization)
 */
export function setPortalBrandColor(portalId: string, color: BrandColor): void {
  try {
    localStorage.setItem(`portal:${portalId}:brand-color`, hslToString(color))
  } catch {
    // localStorage not available
  }
}

/**
 * Remove portal brand color override
 * Returns portal to using realm color
 * SPEC-TH-HC-019
 */
export function removePortalBrandColor(portalId: string): void {
  try {
    localStorage.removeItem(`portal:${portalId}:brand-color`)
  } catch {
    // localStorage not available
  }
}

/**
 * Check if portal has brand color override
 * SPEC-TH-HC-018
 */
export function hasPortalBrandColorOverride(portalId: string): boolean {
  try {
    return localStorage.getItem(`portal:${portalId}:brand-color`) !== null
  } catch {
    return false
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
