// Theme Types
// Based on SPEC-theming.md

/**
 * Theme Mode
 * SPEC-TH-LD-005
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Resolved Theme (after system resolution)
 * SPEC-TH-LD-013
 */
export type ResolvedTheme = 'light' | 'dark'

/**
 * Brand Color in HSL format
 * SPEC-TH-BC-005, SPEC-TH-BC-006
 */
export interface BrandColor {
  hue: number
  saturation: number
  lightness: number
}

/**
 * Theme Configuration
 */
export interface ThemeConfig {
  mode: ThemeMode
  brandColor: BrandColor
}

/**
 * Theme Context Value
 */
export interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  brandColor: BrandColor
  settingsKey: string
  setMode: (mode: ThemeMode) => void
  setBrandColor: (color: BrandColor) => void
  setBrandColorFromHex: (hex: string) => void
}

/**
 * Default Brand Color (blue)
 * SPEC-TH-BC-022
 */
export const DEFAULT_BRAND_COLOR: BrandColor = {
  hue: 221,
  saturation: 83,
  lightness: 53,
}
