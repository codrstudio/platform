import type { ColorHSL } from './types';
import { hslToRGB } from './colorUtils';

/**
 * Apply sRGB gamma correction to color channel
 * WCAG spec: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 *
 * @param value - sRGB channel value (0-1)
 * @returns Gamma-corrected value
 */
export function gammaCorrect(value: number): number {
  if (value <= 0.03928) {
    return value / 12.92;
  } else {
    return Math.pow((value + 0.055) / 1.055, 2.4);
  }
}

/**
 * Calculate relative luminance of RGB color
 * WCAG spec: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 *
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are gamma-corrected values (0-1)
 *
 * @param rgb - RGB values (0-255 or 0-1)
 * @returns Relative luminance (0-1)
 */
export function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  // Normalize to 0-1 if needed
  let { r, g, b } = rgb;
  if (r > 1 || g > 1 || b > 1) {
    r /= 255;
    g /= 255;
    b /= 255;
  }

  // Apply gamma correction
  const R = gammaCorrect(r);
  const G = gammaCorrect(g);
  const B = gammaCorrect(b);

  // Calculate luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate contrast ratio between two luminance values
 * WCAG spec: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter color and L2 is the darker color
 *
 * @param lum1 - Luminance of first color (0-1)
 * @param lum2 - Luminance of second color (0-1)
 * @returns Contrast ratio (1-21)
 *
 * @example
 * calculateContrastRatio(1.0, 0.0); // 21 (white vs black)
 * calculateContrastRatio(0.5, 0.5); // 1 (same color)
 */
export function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get luminance of a ColorHSL object
 * Convenience function that handles HSL → RGB → Luminance conversion
 *
 * @param color - Color in HSL format
 * @returns Relative luminance (0-1)
 */
export function getColorLuminance(color: ColorHSL): number {
  const rgb = hslToRGB(color);
  return calculateLuminance(rgb);
}
