/**
 * Color conversion utilities
 * Handles HEX ” HSL ” RGB conversions
 *
 * Based on SPEC-theming.md SPEC-TH-BC-007:008
 */

import type { HSL, RGB } from '../../types/theme';

/**
 * Convert HEX color to HSL
 * Supports both #RGB and #RRGGBB formats
 *
 * @param hex - HEX color string (with or without #)
 * @returns HSL object
 * @throws Error if invalid HEX format
 */
export function convertHexToHSL(hex: string): HSL {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Validate HEX format
  if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleanHex)) {
    throw new Error(`Invalid HEX color: ${hex}`);
  }

  // Expand shorthand (e.g., #RGB ’ #RRGGBB)
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;

  // Parse RGB values
  const r = parseInt(fullHex.substring(0, 2), 16) / 255;
  const g = parseInt(fullHex.substring(2, 4), 16) / 255;
  const b = parseInt(fullHex.substring(4, 6), 16) / 255;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to HEX
 *
 * @param hsl - HSL color object
 * @returns HEX color string with #
 */
export function convertHSLToHex(hsl: HSL): string {
  const rgb = convertHSLToRGB(hsl);

  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert HSL to RGB
 * Needed for contrast calculations
 *
 * @param hsl - HSL color object
 * @returns RGB color object (0-255 range)
 */
export function convertHSLToRGB(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    // Achromatic (gray)
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to HSL
 *
 * @param rgb - RGB color object
 * @returns HSL color object
 */
export function convertRGBToHSL(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Format HSL as CSS variable value
 * Returns space-separated values without hsl() wrapper
 *
 * @param hsl - HSL color object
 * @returns CSS variable value (e.g., "221 83% 53%")
 */
export function formatHSLForCSS(hsl: HSL): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Parse CSS HSL value to HSL object
 *
 * @param cssValue - CSS HSL value (e.g., "221 83% 53%")
 * @returns HSL object
 */
export function parseHSLFromCSS(cssValue: string): HSL {
  const parts = cssValue.trim().split(/\s+/);

  if (parts.length !== 3) {
    throw new Error(`Invalid CSS HSL value: ${cssValue}`);
  }

  return {
    h: parseFloat(parts[0]),
    s: parseFloat(parts[1].replace('%', '')),
    l: parseFloat(parts[2].replace('%', '')),
  };
}
