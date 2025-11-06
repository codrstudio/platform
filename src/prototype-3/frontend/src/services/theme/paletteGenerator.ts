/**
 * Color Palette Generator
 *
 * Generates color palettes from brand color with WCAG AA contrast validation.
 *
 * References:
 * - SPEC-theming.md (SPEC-TH-BC-*, SPEC-TH-CS-*, SPEC-TH-AC-*)
 */

import type { BrandColorHSL, ColorPalette, ContrastValidation } from '@/types/theme';

/**
 * Parse HSL string to components
 * SPEC-TH-BC-006: Format "hue saturation% lightness%"
 */
function parseHSL(hsl: string): { h: number; s: number; l: number } {
  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) {
    throw new Error(`Invalid HSL format: ${hsl}. Expected "hue saturation% lightness%"`);
  }
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
  };
}

/**
 * Format HSL components to string
 * SPEC-TH-SH-015 to SPEC-TH-SH-017: HSL format without wrapper
 */
function formatHSL(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

/**
 * Convert HSL to RGB for contrast calculation
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Convert HEX to HSL
 * SPEC-TH-BC-007: Frontend can accept HEX and convert to HSL
 */
export function hexToHSL(hex: string): BrandColorHSL {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return formatHSL(
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  );
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(hsl: BrandColorHSL): string {
  const { h, s, l } = parseHSL(hsl);
  const rgb = hslToRgb(h, s, l);

  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calculate relative luminance for contrast ratio
 * SPEC-TH-AC-002 to SPEC-TH-AC-004: WCAG contrast requirements
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * SPEC-TH-AC-001: WCAG 2.1 Level AA compliance
 */
function getContrastRatio(color1: string, color2: string): number {
  const hsl1 = parseHSL(color1);
  const hsl2 = parseHSL(color2);

  const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l);
  const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate contrast ratio meets WCAG AA standards
 * SPEC-TH-AC-002: Normal text 4.5:1, Large text 3:1
 */
export function validateContrast(
  color: BrandColorHSL,
  background: BrandColorHSL
): ContrastValidation {
  const ratio = getContrastRatio(color, background);

  let level: 'AAA' | 'AA' | 'Fail';
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  } else {
    level = 'Fail';
  }

  // SPEC-TH-AC-006: Auto-adjust if insufficient
  let suggested: string | undefined;
  if (level === 'Fail') {
    suggested = adjustForContrast(color, background);
  }

  return {
    isValid: level !== 'Fail',
    ratio: Math.round(ratio * 100) / 100,
    level,
    suggested,
  };
}

/**
 * Adjust lightness to meet WCAG AA contrast
 * SPEC-TH-AC-006: Auto-adjust lightness if contrast insufficient
 */
function adjustForContrast(color: BrandColorHSL, background: BrandColorHSL): string {
  const { h, s, l } = parseHSL(color);
  const { l: bgL } = parseHSL(background);

  // If background is light, make color darker
  // If background is dark, make color lighter
  let newL = l;

  if (bgL > 50) {
    // Light background - darken color
    while (newL > 0) {
      const testColor = formatHSL(h, s, newL);
      const ratio = getContrastRatio(testColor, background);
      if (ratio >= 4.5) break;
      newL -= 5;
    }
  } else {
    // Dark background - lighten color
    while (newL < 100) {
      const testColor = formatHSL(h, s, newL);
      const ratio = getContrastRatio(testColor, background);
      if (ratio >= 4.5) break;
      newL += 5;
    }
  }

  return formatHSL(h, s, Math.max(0, Math.min(100, newL)));
}

/**
 * Generate color palette from brand color
 * SPEC-TH-BC-013 to SPEC-TH-BC-016: Palette generation
 */
export function generatePalette(brandColor: BrandColorHSL): ColorPalette {
  const { h, l } = parseHSL(brandColor);

  // SPEC-TH-BC-013: Generate primary and primary-foreground
  const primary = brandColor;

  // Generate foreground with sufficient contrast
  // Light brand color -> dark foreground
  // Dark brand color -> light foreground
  const foregroundL = l > 50 ? 10 : 98;
  const primaryForeground = formatHSL(h, 40, foregroundL);

  return {
    primary,
    primaryForeground,
  };
}

/**
 * Generate semantic colors
 * SPEC-TH-CS-001 to SPEC-TH-CS-020: Semantic colors
 */
export function generateSemanticColors(isDark: boolean) {
  return {
    // SPEC-TH-CS-005 to SPEC-TH-CS-007: Success (green)
    success: isDark ? '142 71% 45%' : '142 76% 36%',
    successForeground: '144 61% 97%',

    // SPEC-TH-CS-008 to SPEC-TH-CS-010: Warning (yellow/orange)
    warning: '38 92% 50%',
    warningForeground: '48 96% 89%',

    // SPEC-TH-CS-011 to SPEC-TH-CS-013: Error (red)
    error: isDark ? '0 62.8% 30.6%' : '0 84.2% 60.2%',
    errorForeground: '0 0% 98%',

    // SPEC-TH-CS-014 to SPEC-TH-CS-016: Info (blue)
    info: '199 89% 48%',
    infoForeground: '198 93% 97%',
  };
}
