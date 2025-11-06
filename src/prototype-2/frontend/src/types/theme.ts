// Theme type definitions
// Based on SPEC-theming.md

/**
 * Theme mode options
 * - light: Light theme
 * - dark: Dark theme
 * - system: Automatically match OS/browser preference
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme context value provided to consuming components
 */
export interface ThemeContextValue {
  /**
   * Resolved theme (never "system")
   * This is the actual theme currently applied to the UI
   */
  theme: 'light' | 'dark';

  /**
   * User's theme preference (may be "system")
   * This is what the user explicitly selected
   */
  rawTheme: ThemeMode;

  /**
   * Brand color in HSL format (e.g., "221 83% 53%")
   * null means use default theme color
   */
  brandColor: string | null;

  /**
   * Portal's settings key used for localStorage keys
   * Format: {settingsKey}:theme and {settingsKey}:brand-color
   */
  settingsKey: string;

  /**
   * Update theme mode preference
   * @param mode - New theme mode (light/dark/system)
   */
  setTheme: (mode: ThemeMode) => void;

  /**
   * Update brand color
   * @param color - HSL color string or null to reset to default
   */
  setBrandColor: (color: string | null) => void;
}

/**
 * ThemeProvider component props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
}

/**
 * RGB color representation (for contrast calculations)
 */
export interface RGB {
  r: number; // Red: 0-255
  g: number; // Green: 0-255
  b: number; // Blue: 0-255
}

/**
 * Complete theme palette
 */
export interface ThemePalette {
  mode: 'light' | 'dark';
  background: HSL;
  foreground: HSL;
  primary: HSL;
  primaryForeground: HSL;
  secondary: HSL;
  secondaryForeground: HSL;
  muted: HSL;
  mutedForeground: HSL;
  accent: HSL;
  accentForeground: HSL;
  destructive: HSL;
  destructiveForeground: HSL;
  border: HSL;
  input: HSL;
  ring: HSL;
  // Semantic colors (fixed, not generated from brand)
  success?: HSL;
  successForeground?: HSL;
  warning?: HSL;
  warningForeground?: HSL;
  error?: HSL;
  errorForeground?: HSL;
  info?: HSL;
  infoForeground?: HSL;
}

/**
 * Contrast validation result
 */
export interface ContrastResult {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'fail';
}
