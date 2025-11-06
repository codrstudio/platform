/**
 * Semantic Color System
 *
 * Provides standardized, accessible colors for semantic states across the platform.
 * SPEC-TH-CS-001:020: Success, warning, error, info colors
 *
 * ## Key Principles
 *
 * 1. **Fixed Colors**: Semantic colors are NOT customizable (unlike brand colors)
 * 2. **Always Paired with Icons**: Never rely on color alone (accessibility)
 * 3. **WCAG AA Validated**: All foreground/background pairs pass contrast requirements
 * 4. **Cross-Portal Consistency**: Same colors in all portals
 *
 * ## Color Meanings
 *
 * - **Success (Green)**: Positive outcomes, completed actions, success messages
 * - **Warning (Orange)**: Caution, attention needed, non-critical issues
 * - **Error (Red)**: Failures, critical issues, destructive actions
 * - **Info (Blue)**: Neutral information, help text, tips
 *
 * ## Usage Example
 *
 * ```typescript
 * import { generateSemanticColors } from './services/theming';
 *
 * // In ThemeProvider or similar
 * const semanticColors = generateSemanticColors('light');
 *
 * // Apply to CSS variables
 * document.documentElement.style.setProperty('--success', semanticColors.success);
 * document.documentElement.style.setProperty('--success-foreground', semanticColors.successForeground);
 * // ... repeat for warning, error, info
 * ```
 *
 * ## Component Usage
 *
 * ```tsx
 * import { CheckCircle } from 'lucide-react';
 *
 * // Toast notification with semantic color
 * <div className="bg-success text-success-foreground">
 *   <CheckCircle className="w-5 h-5" />
 *   <span>Operation completed successfully</span>
 * </div>
 * ```
 *
 * ## Icon Pairing (SPEC-TH-IC-004:008)
 *
 * Always pair semantic colors with icons:
 * - Success: CheckCircle, Check, ThumbsUp
 * - Warning: AlertTriangle, AlertCircle
 * - Error: XCircle, AlertOctagon
 * - Info: Info, HelpCircle
 */

import type { ColorHSL, ThemeMode, SemanticColorName, SemanticColorPalette } from './types';
import { hslToString } from './colorUtils';
import { generateForeground } from './paletteGenerator';
import { validateContrast, adjustToMeetContrast } from './wcagValidator';

/**
 * Semantic color constants
 * SPEC-TH-CS-004: Semantic colors NOT customizable (fixed platform colors)
 */

// Success (Green) - SPEC-TH-CS-005:007
export const SUCCESS_COLOR_LIGHT: ColorHSL = {
  h: 142,  // Green
  s: 76,   // High saturation for vibrancy
  l: 36    // Dark enough for light backgrounds
};

export const SUCCESS_COLOR_DARK: ColorHSL = {
  h: 142,
  s: 70,   // Slightly less saturated
  l: 50    // Lighter for dark backgrounds
};

// Warning (Orange) - SPEC-TH-CS-008:010
export const WARNING_COLOR_LIGHT: ColorHSL = {
  h: 38,   // Orange (between yellow and red)
  s: 92,   // High saturation
  l: 50    // Medium lightness
};

export const WARNING_COLOR_DARK: ColorHSL = {
  h: 38,
  s: 84,   // Slightly less saturated
  l: 55    // Lighter for dark backgrounds
};

// Error/Destructive (Red) - SPEC-TH-CS-011:013
export const ERROR_COLOR_LIGHT: ColorHSL = {
  h: 0,    // Pure red hue
  s: 84,   // High but not 100% (too vibrant)
  l: 60    // Lighter red for readability
};

export const ERROR_COLOR_DARK: ColorHSL = {
  h: 0,
  s: 76,   // Slightly less saturated
  l: 65    // Lighter for dark backgrounds
};

// Info (Blue) - SPEC-TH-CS-014:016
export const INFO_COLOR_LIGHT: ColorHSL = {
  h: 210,  // Sky blue
  s: 79,   // High saturation
  l: 46    // Medium-dark for light backgrounds
};

export const INFO_COLOR_DARK: ColorHSL = {
  h: 210,
  s: 70,   // Slightly less saturated
  l: 56    // Lighter for dark backgrounds (adjusted for WCAG)
};

/**
 * Get semantic color for a specific state and mode
 *
 * @param name - Semantic color name
 * @param mode - Theme mode
 * @returns ColorHSL for the semantic color
 */
export function getSemanticColor(
  name: SemanticColorName,
  mode: ThemeMode
): ColorHSL {
  switch (name) {
    case 'success':
      return mode === 'light' ? SUCCESS_COLOR_LIGHT : SUCCESS_COLOR_DARK;
    case 'warning':
      return mode === 'light' ? WARNING_COLOR_LIGHT : WARNING_COLOR_DARK;
    case 'error':
      return mode === 'light' ? ERROR_COLOR_LIGHT : ERROR_COLOR_DARK;
    case 'info':
      return mode === 'light' ? INFO_COLOR_LIGHT : INFO_COLOR_DARK;
  }
}

/**
 * Generate complete semantic color palette
 * SPEC-TH-CS-001:020: All semantic colors with validated contrast
 *
 * @param mode - Theme mode (light or dark)
 * @returns Complete semantic color palette as CSS custom property values
 *
 * @example
 * const semanticColors = generateSemanticColors('light');
 * // {
 * //   success: "142 76% 36%",
 * //   successForeground: "0 0% 100%",
 * //   warning: "38 92% 50%",
 * //   ...
 * // }
 */
export function generateSemanticColors(mode: ThemeMode): SemanticColorPalette {
  // Generate each semantic color with validated foreground
  const success = getSemanticColor('success', mode);
  const successFg = generateValidatedForeground(success, mode);

  const warning = getSemanticColor('warning', mode);
  const warningFg = generateValidatedForeground(warning, mode);

  const error = getSemanticColor('error', mode);
  const errorFg = generateValidatedForeground(error, mode);

  const info = getSemanticColor('info', mode);
  const infoFg = generateValidatedForeground(info, mode);

  return {
    // Success
    success: hslToString(success),
    successForeground: hslToString(successFg),

    // Warning
    warning: hslToString(warning),
    warningForeground: hslToString(warningFg),

    // Error/Destructive
    error: hslToString(error),
    errorForeground: hslToString(errorFg),
    destructive: hslToString(error),         // Alias for shadcn/ui
    destructiveForeground: hslToString(errorFg),

    // Info
    info: hslToString(info),
    infoForeground: hslToString(infoFg)
  };
}

/**
 * Generate foreground color with WCAG AA validation
 * Internal helper function
 *
 * @param background - Semantic background color
 * @param mode - Theme mode
 * @returns Validated foreground color
 */
function generateValidatedForeground(
  background: ColorHSL,
  mode: ThemeMode
): ColorHSL {
  // Generate initial foreground (from Task 1.6.4)
  let foreground = generateForeground(background, mode);

  // Validate WCAG AA compliance (from Task 1.6.5)
  const validation = validateContrast(background, foreground, 'AA-normal');

  // Auto-adjust if fails (should rarely happen with our chosen colors)
  if (!validation.passes) {
    foreground = adjustToMeetContrast(background, foreground, 'AA-normal');
  }

  return foreground;
}

/**
 * Get recommended Lucide icon for semantic state
 * SPEC-TH-IC-004:008: Icons reinforce semantic colors
 *
 * @param name - Semantic color name
 * @returns Recommended icon name from lucide-react
 *
 * @example
 * import { CheckCircle } from 'lucide-react';
 * const iconName = getSemanticIcon('success'); // "CheckCircle"
 */
export function getSemanticIcon(name: SemanticColorName): string {
  switch (name) {
    case 'success':
      return 'CheckCircle'; // or 'Check', 'ThumbsUp'
    case 'warning':
      return 'AlertTriangle'; // or 'AlertCircle'
    case 'error':
      return 'XCircle'; // or 'AlertOctagon'
    case 'info':
      return 'Info'; // or 'HelpCircle'
  }
}
