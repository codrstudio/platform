/**
 * Theme palette generation from brand color
 * Based on SPEC-theming.md SPEC-TH-BC-013:016
 */

import type { HSL, ThemePalette } from '../../types/theme';
import { adjustForContrast, getOptimalForeground } from './contrastValidator';

/**
 * Generate complete theme palette from brand color
 *
 * @param brandColor - Base HSL color (primary)
 * @param mode - Theme mode (light or dark)
 * @returns Complete theme palette
 */
export function generatePalette(
  brandColor: HSL,
  mode: 'light' | 'dark'
): ThemePalette {
  const isLight = mode === 'light';

  // Base colors
  const background: HSL = isLight
    ? { h: 0, s: 0, l: 100 }      // White
    : { h: 222.2, s: 84, l: 4.9 }; // Very dark blue-gray

  const foreground: HSL = isLight
    ? { h: 222.2, s: 84, l: 4.9 }  // Very dark blue-gray
    : { h: 210, s: 40, l: 98 };    // Very light gray

  // Primary (brand color)
  // Keep same hue and saturation, adjust lightness for mode
  const primary: HSL = {
    h: brandColor.h,
    s: brandColor.s,
    l: isLight ? brandColor.l : Math.min(70, brandColor.l + 20), // Lighter in dark mode
  };

  // Ensure primary has good contrast with background
  const primaryAdjusted = adjustForContrast(primary, background, 3.0);

  // Primary foreground - optimal contrast with primary
  const primaryForeground = getOptimalForeground(primaryAdjusted);

  // Secondary (desaturated variant)
  const secondary: HSL = isLight
    ? { h: 210, s: 40, l: 96.1 }
    : { h: 217.2, s: 32.6, l: 17.5 };

  const secondaryForeground: HSL = isLight
    ? { h: 222.2, s: 47.4, l: 11.2 }
    : { h: 210, s: 40, l: 98 };

  // Muted (very desaturated)
  const muted: HSL = isLight
    ? { h: 210, s: 40, l: 96.1 }
    : { h: 217.2, s: 32.6, l: 17.5 };

  const mutedForeground: HSL = isLight
    ? { h: 215.4, s: 16.3, l: 46.9 }
    : { h: 215, s: 20.2, l: 65.1 };

  // Accent (slightly rotated hue)
  const accent: HSL = isLight
    ? { h: 210, s: 40, l: 96.1 }
    : { h: 217.2, s: 32.6, l: 17.5 };

  const accentForeground: HSL = isLight
    ? { h: 222.2, s: 47.4, l: 11.2 }
    : { h: 210, s: 40, l: 98 };

  // Destructive (red)
  const destructive: HSL = isLight
    ? { h: 0, s: 84.2, l: 60.2 }
    : { h: 0, s: 62.8, l: 30.6 };

  const destructiveForeground: HSL = isLight
    ? { h: 210, s: 40, l: 98 }
    : { h: 210, s: 40, l: 98 };

  // Border, input, ring
  const border: HSL = isLight
    ? { h: 214.3, s: 31.8, l: 91.4 }
    : { h: 217.2, s: 32.6, l: 17.5 };

  const input: HSL = border; // Same as border

  const ring: HSL = primaryAdjusted; // Same as primary

  return {
    mode,
    background,
    foreground,
    primary: primaryAdjusted,
    primaryForeground,
    secondary,
    secondaryForeground,
    muted,
    mutedForeground,
    accent,
    accentForeground,
    destructive,
    destructiveForeground,
    border,
    input,
    ring,
  };
}

/**
 * Generate semantic color palette (success, warning, error, info)
 * These are fixed colors, not derived from brand color
 *
 * @param mode - Theme mode (light or dark)
 * @returns Semantic color palette
 */
export function generateSemanticColors(mode: 'light' | 'dark'): Pick<
  ThemePalette,
  'success' | 'successForeground' | 'warning' | 'warningForeground' | 'error' | 'errorForeground' | 'info' | 'infoForeground'
> {
  const isLight = mode === 'light';

  return {
    // Success - Green
    success: isLight
      ? { h: 142, s: 76, l: 36 }  // Green 600
      : { h: 142, s: 71, l: 45 },  // Green 500
    successForeground: isLight
      ? { h: 138, s: 76, l: 97 }  // Green 50
      : { h: 138, s: 76, l: 97 },

    // Warning - Yellow/Orange
    warning: isLight
      ? { h: 38, s: 92, l: 50 }   // Orange 500
      : { h: 43, s: 96, l: 56 },   // Yellow 400
    warningForeground: isLight
      ? { h: 33, s: 100, l: 96 }  // Orange 50
      : { h: 48, s: 96, l: 89 },

    // Error - Red (same as destructive)
    error: isLight
      ? { h: 0, s: 84, l: 60 }    // Red 500
      : { h: 0, s: 63, l: 31 },    // Red 700
    errorForeground: isLight
      ? { h: 0, s: 86, l: 97 }    // Red 50
      : { h: 0, s: 86, l: 97 },

    // Info - Blue
    info: isLight
      ? { h: 221, s: 83, l: 53 }  // Blue 500
      : { h: 217, s: 91, l: 60 },  // Blue 400
    infoForeground: isLight
      ? { h: 214, s: 95, l: 93 }  // Blue 50
      : { h: 214, s: 95, l: 93 },
  };
}
