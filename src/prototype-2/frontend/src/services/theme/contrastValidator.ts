/**
 * WCAG contrast validation and auto-adjustment
 * Based on SPEC-theming.md SPEC-TH-AC-001:007
 */

import type { HSL, RGB, ContrastResult } from '../../types/theme';
import { convertHSLToRGB } from './colorConversion';

/**
 * Calculate relative luminance of RGB color
 * Per WCAG formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 *
 * @param rgb - RGB color object
 * @returns Relative luminance (0-1)
 */
function calculateLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Per WCAG formula: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 *
 * @param foreground - Foreground RGB color
 * @param background - Background RGB color
 * @returns Contrast ratio (1-21)
 */
export function calculateContrast(foreground: RGB, background: RGB): number {
  const l1 = calculateLuminance(foreground);
  const l2 = calculateLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate if contrast meets WCAG level
 *
 * @param foreground - Foreground RGB color
 * @param background - Background RGB color
 * @param level - WCAG level ('AA' or 'AAA')
 * @param largeText - Is text large (18pt+ or 14pt+ bold)
 * @returns Contrast validation result
 */
export function validateContrast(
  foreground: RGB,
  background: RGB,
  level: 'AA' | 'AAA' = 'AA',
  largeText: boolean = false
): ContrastResult {
  const ratio = calculateContrast(foreground, background);

  // WCAG AA requirements
  const aaThreshold = largeText ? 3.0 : 4.5;
  const aaaThreshold = largeText ? 4.5 : 7.0;

  let passes = false;
  let resultLevel: 'AA' | 'AAA' | 'fail' = 'fail';

  if (ratio >= aaaThreshold) {
    passes = true;
    resultLevel = 'AAA';
  } else if (ratio >= aaThreshold) {
    passes = level === 'AA';
    resultLevel = 'AA';
  }

  return { ratio, passes, level: resultLevel };
}

/**
 * Adjust color lightness to meet contrast requirement
 * Iteratively adjusts lightness until target contrast is met
 *
 * @param color - Color to adjust
 * @param background - Background color to contrast against
 * @param targetRatio - Target contrast ratio (default: 4.5 for WCAG AA)
 * @param maxIterations - Maximum adjustment attempts
 * @returns Adjusted HSL color
 */
export function adjustForContrast(
  color: HSL,
  background: HSL,
  targetRatio: number = 4.5,
  maxIterations: number = 20
): HSL {
  let adjusted = { ...color };
  const bgRGB = convertHSLToRGB(background);

  for (let i = 0; i < maxIterations; i++) {
    const fgRGB = convertHSLToRGB(adjusted);
    const currentRatio = calculateContrast(fgRGB, bgRGB);

    if (currentRatio >= targetRatio) {
      return adjusted; // Target met
    }

    // Adjust lightness based on background
    // If background is dark, increase lightness
    // If background is light, decrease lightness
    const bgLuminance = calculateLuminance(bgRGB);

    if (bgLuminance < 0.5) {
      // Dark background - make foreground lighter
      adjusted.l = Math.min(100, adjusted.l + 5);
    } else {
      // Light background - make foreground darker
      adjusted.l = Math.max(0, adjusted.l - 5);
    }

    // Prevent infinite loop on extreme cases
    if (adjusted.l === 0 || adjusted.l === 100) {
      console.warn('Could not meet contrast requirement, reached lightness boundary');
      return adjusted;
    }
  }

  console.warn(`Contrast adjustment did not converge after ${maxIterations} iterations`);
  return adjusted;
}

/**
 * Get optimal foreground color for given background
 * Returns either very light or very dark depending on background
 *
 * @param background - Background HSL color
 * @returns Optimal foreground HSL color
 */
export function getOptimalForeground(background: HSL): HSL {
  const bgRGB = convertHSLToRGB(background);
  const luminance = calculateLuminance(bgRGB);

  // If background is dark (luminance < 0.5), use light foreground
  // Otherwise use dark foreground
  if (luminance < 0.5) {
    return { h: background.h, s: 10, l: 98 }; // Very light, desaturated
  } else {
    return { h: background.h, s: 10, l: 10 }; // Very dark, desaturated
  }
}
