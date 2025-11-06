import type { ColorHSL, ContrastLevel, ValidationResult } from './types';
import { calculateContrastRatio, getColorLuminance } from './contrastUtils';

/**
 * WCAG contrast ratio requirements
 * Source: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT = 3.0;
export const WCAG_AAA_NORMAL_TEXT = 7.0;
export const WCAG_AAA_LARGE_TEXT = 4.5;

/**
 * Get required contrast ratio for a WCAG level
 */
function getRequiredRatio(level: ContrastLevel): number {
  switch (level) {
    case 'AA-normal': return WCAG_AA_NORMAL_TEXT;
    case 'AA-large': return WCAG_AA_LARGE_TEXT;
    case 'AAA-normal': return WCAG_AAA_NORMAL_TEXT;
    case 'AAA-large': return WCAG_AAA_LARGE_TEXT;
  }
}

/**
 * Validate contrast ratio between background and foreground colors
 * SPEC-TH-AC-001:004: WCAG 2.1 Level AA compliance
 *
 * @param background - Background color
 * @param foreground - Foreground (text) color
 * @param level - WCAG level to validate against (default: AA-normal)
 * @returns ValidationResult with pass/fail and details
 *
 * @example
 * const result = validateContrast(
 *   { h: 221, s: 83, l: 53 },  // Blue background
 *   { h: 0, s: 0, l: 100 },     // White text
 *   'AA-normal'
 * );
 * console.log(result.passes); // true
 * console.log(result.ratio);  // ~8.6
 */
export function validateContrast(
  background: ColorHSL,
  foreground: ColorHSL,
  level: ContrastLevel = 'AA-normal'
): ValidationResult {
  const bgLum = getColorLuminance(background);
  const fgLum = getColorLuminance(foreground);
  const ratio = calculateContrastRatio(bgLum, fgLum);
  const required = getRequiredRatio(level);

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimals
    required,
    level
  };
}

/**
 * Adjust foreground color to meet WCAG contrast requirement
 * SPEC-TH-AC-005:008: Auto-adjust if contrast insufficient
 *
 * Strategy:
 * - Try making foreground lighter first
 * - If can't achieve ratio, try making it darker
 * - Use binary search for efficiency
 *
 * @param background - Background color (unchanged)
 * @param foreground - Foreground color to adjust
 * @param level - Target WCAG level
 * @returns Adjusted foreground color that meets contrast ratio
 *
 * @example
 * const adjusted = adjustToMeetContrast(
 *   { h: 221, s: 83, l: 53 },  // Blue background
 *   { h: 221, s: 63, l: 70 },  // Light blue text (might fail)
 *   'AA-normal'
 * );
 * // Returns adjusted color with L=95 or similar
 */
export function adjustToMeetContrast(
  background: ColorHSL,
  foreground: ColorHSL,
  level: ContrastLevel = 'AA-normal'
): ColorHSL {
  const targetRatio = getRequiredRatio(level);
  const bgLum = getColorLuminance(background);

  // Determine if we need lighter or darker foreground
  const needsLighter = bgLum < 0.5;

  if (needsLighter) {
    // Try making foreground lighter
    const lightness = findMinimumLightness(background, targetRatio, 'lighter');
    if (lightness !== null) {
      return { ...foreground, l: lightness };
    }
  }

  // Try making foreground darker
  const lightness = findMinimumLightness(background, targetRatio, 'darker');
  if (lightness !== null) {
    return { ...foreground, l: lightness };
  }

  // Fallback: Pure white or pure black
  return needsLighter
    ? { ...foreground, l: 100 }
    : { ...foreground, l: 0 };
}

/**
 * Binary search to find minimum lightness that meets contrast ratio
 * Internal utility function
 *
 * @param background - Background color
 * @param targetRatio - Required contrast ratio
 * @param direction - Make foreground lighter or darker
 * @returns Lightness value (0-100) or null if impossible
 */
function findMinimumLightness(
  background: ColorHSL,
  targetRatio: number,
  direction: 'lighter' | 'darker'
): number | null {
  const bgLum = getColorLuminance(background);

  let min = direction === 'lighter' ? 50 : 0;
  let max = direction === 'lighter' ? 100 : 50;
  let result: number | null = null;

  // Binary search
  for (let i = 0; i < 20; i++) { // Max 20 iterations (enough for 0.1% precision)
    const mid = (min + max) / 2;
    const testColor = { ...background, l: mid };
    const fgLum = getColorLuminance(testColor);
    const ratio = calculateContrastRatio(bgLum, fgLum);

    if (ratio >= targetRatio) {
      result = mid;
      if (direction === 'lighter') {
        max = mid; // Try to find lower lightness
      } else {
        min = mid; // Try to find higher lightness
      }
    } else {
      if (direction === 'lighter') {
        min = mid; // Need more lightness
      } else {
        max = mid; // Need less lightness
      }
    }
  }

  return result !== null ? Math.round(result) : null;
}

/**
 * Get user-friendly description of validation result
 * Useful for UI feedback
 *
 * @param result - ValidationResult from validateContrast()
 * @returns Human-readable message
 */
export function getValidationMessage(result: ValidationResult): string {
  if (result.passes) {
    return `Passes ${result.level} (${result.ratio}:1 contrast ratio)`;
  } else {
    const diff = (result.required - result.ratio).toFixed(2);
    return `Fails ${result.level}. Needs ${diff} more contrast (current: ${result.ratio}:1, required: ${result.required}:1)`;
  }
}
