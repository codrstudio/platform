/**
 * Theme System Types
 *
 * References:
 * - SPEC-theming.md (All SPEC-TH-* requirements)
 */

/**
 * SPEC-TH-LD-005: Theme mode values
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * SPEC-TH-BC-005: Brand color in HSL format
 * Format: "hue saturation% lightness%" (ex: "221 83% 53%")
 */
export type BrandColorHSL = string;

/**
 * SPEC-TH-SK-001 to SPEC-TH-SK-014: Settings key for theme sharing
 */
export interface ThemeSettings {
  /** Current theme mode */
  mode: ThemeMode;
  /** Brand color in HSL format */
  brandColor: BrandColorHSL | null;
  /** Settings key for theme sharing across portals */
  settingsKey: string;
}

/**
 * Color palette generated from brand color
 * SPEC-TH-BC-013 to SPEC-TH-BC-016
 */
export interface ColorPalette {
  primary: string;
  primaryForeground: string;
  // Additional palette colors can be added here
}

/**
 * SPEC-TH-AC-001 to SPEC-TH-AC-008: WCAG contrast validation
 */
export interface ContrastValidation {
  isValid: boolean;
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  suggested?: string; // Suggested adjustment if invalid
}

/**
 * Theme context value
 * SPEC-TH-AP-017 to SPEC-TH-AP-020
 */
export interface ThemeContextValue {
  /** Current resolved theme ('light' or 'dark', never 'system') */
  theme: 'light' | 'dark';
  /** Raw theme setting (can be 'system') */
  rawTheme: ThemeMode;
  /** Brand color in HSL format */
  brandColor: BrandColorHSL | null;
  /** Settings key for theme sharing */
  settingsKey: string;
  /** Set theme mode */
  setTheme: (mode: ThemeMode) => void;
  /** Set brand color */
  setBrandColor: (color: BrandColorHSL | null) => void;
  /** Set settings key */
  setSettingsKey: (key: string) => void;
  /** Generate palette from color */
  generatePalette: (color: BrandColorHSL) => ColorPalette;
  /** Validate contrast */
  validateContrast: (color: BrandColorHSL, background: BrandColorHSL) => ContrastValidation;
}
