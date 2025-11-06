import type { ColorHSL, ThemeMode, PaletteVariants } from './types';
import { hslToString } from './colorUtils';

/**
 * Default primary color (shadcn/ui default blue)
 * SPEC-TH-BC-022: Default color "221 83% 53%"
 */
export const DEFAULT_PRIMARY_COLOR: ColorHSL = {
  h: 221,
  s: 83,
  l: 53
};

/**
 * Generate palette variants from brand color
 * SPEC-TH-BC-013:016: Generate primary and primary-foreground
 *
 * @param brandColor - The primary brand color
 * @param mode - Theme mode (light or dark)
 * @returns Palette variants as CSS custom property values
 *
 * @example
 * const palette = generatePalette({ h: 221, s: 83, l: 53 }, 'light');
 * // { primary: "221 83% 53%", primaryForeground: "221 63% 10%" }
 */
export function generatePalette(
  brandColor: ColorHSL,
  mode: ThemeMode
): PaletteVariants {
  const primary = hslToString(brandColor);
  const foreground = generateForeground(brandColor, mode);

  return {
    primary,
    primaryForeground: hslToString(foreground)
  };
}

/**
 * Generate foreground color for primary background
 * SPEC-TH-BC-015: Must guarantee adequate contrast (WCAG AA)
 *
 * Strategy:
 * - Light mode: Very dark text (L=10%) for contrast on medium background
 * - Dark mode: Very light text (L=98%) for contrast on dark background
 * - Desaturate slightly for better readability
 *
 * @param background - The primary color (background)
 * @param mode - Theme mode
 * @returns Foreground color with high contrast
 *
 * @example
 * generateForeground({ h: 221, s: 83, l: 53 }, 'light')
 * // { h: 221, s: 63, l: 10 }
 */
export function generateForeground(
  background: ColorHSL,
  mode: ThemeMode
): ColorHSL {
  if (mode === 'light') {
    // Light mode: Dark text on colored background
    return {
      h: background.h,
      s: Math.max(background.s - 20, 0), // Slightly desaturate
      l: 10  // Very dark for high contrast
    };
  } else {
    // Dark mode: Light text on colored background
    return {
      h: background.h,
      s: Math.max(background.s - 20, 0), // Slightly desaturate
      l: 98  // Very light for high contrast
    };
  }
}
