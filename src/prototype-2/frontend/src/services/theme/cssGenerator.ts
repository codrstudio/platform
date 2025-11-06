/**
 * CSS custom property generator and injector
 * Based on SPEC-theming.md SPEC-TH-CS-001:008
 */

import type { ThemePalette } from '../../types/theme';
import { formatHSLForCSS } from './colorConversion';

/**
 * Generate CSS variable declarations from palette
 *
 * @param palette - Theme palette
 * @returns Object mapping CSS variable names to values
 */
export function generateCSSVariables(palette: ThemePalette): Record<string, string> {
  return {
    '--background': formatHSLForCSS(palette.background),
    '--foreground': formatHSLForCSS(palette.foreground),
    '--primary': formatHSLForCSS(palette.primary),
    '--primary-foreground': formatHSLForCSS(palette.primaryForeground),
    '--secondary': formatHSLForCSS(palette.secondary),
    '--secondary-foreground': formatHSLForCSS(palette.secondaryForeground),
    '--muted': formatHSLForCSS(palette.muted),
    '--muted-foreground': formatHSLForCSS(palette.mutedForeground),
    '--accent': formatHSLForCSS(palette.accent),
    '--accent-foreground': formatHSLForCSS(palette.accentForeground),
    '--destructive': formatHSLForCSS(palette.destructive),
    '--destructive-foreground': formatHSLForCSS(palette.destructiveForeground),
    '--border': formatHSLForCSS(palette.border),
    '--input': formatHSLForCSS(palette.input),
    '--ring': formatHSLForCSS(palette.ring),
    // Semantic colors (if provided)
    ...(palette.success && { '--success': formatHSLForCSS(palette.success) }),
    ...(palette.successForeground && { '--success-foreground': formatHSLForCSS(palette.successForeground) }),
    ...(palette.warning && { '--warning': formatHSLForCSS(palette.warning) }),
    ...(palette.warningForeground && { '--warning-foreground': formatHSLForCSS(palette.warningForeground) }),
    ...(palette.error && { '--error': formatHSLForCSS(palette.error) }),
    ...(palette.errorForeground && { '--error-foreground': formatHSLForCSS(palette.errorForeground) }),
    ...(palette.info && { '--info': formatHSLForCSS(palette.info) }),
    ...(palette.infoForeground && { '--info-foreground': formatHSLForCSS(palette.infoForeground) }),
  };
}

/**
 * Apply palette to document root
 * Injects CSS custom properties into :root
 *
 * @param palette - Theme palette to apply
 */
export function applyPalette(palette: ThemePalette): void {
  try {
    const variables = generateCSSVariables(palette);
    const root = document.documentElement;

    // Apply each CSS variable
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    console.log(`Applied ${palette.mode} theme palette`);
  } catch (error) {
    console.error('Failed to apply palette:', error);
  }
}

/**
 * Remove all theme-related CSS variables
 * Used for cleanup or theme reset
 */
export function removePalette(): void {
  try {
    const root = document.documentElement;
    const properties = [
      '--background',
      '--foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--destructive',
      '--destructive-foreground',
      '--border',
      '--input',
      '--ring',
      '--success',
      '--success-foreground',
      '--warning',
      '--warning-foreground',
      '--error',
      '--error-foreground',
      '--info',
      '--info-foreground',
    ];

    properties.forEach(property => {
      root.style.removeProperty(property);
    });

    console.log('Removed theme palette');
  } catch (error) {
    console.error('Failed to remove palette:', error);
  }
}

/**
 * Get current CSS variable value
 * Useful for debugging or fallback detection
 *
 * @param variableName - CSS variable name (with or without --)
 * @returns Current value or null if not set
 */
export function getCSSVariable(variableName: string): string | null {
  try {
    const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || null;
  } catch (error) {
    console.error('Failed to get CSS variable:', error);
    return null;
  }
}
