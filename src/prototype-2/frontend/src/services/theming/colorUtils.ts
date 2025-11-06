import type { ColorHSL } from './types';
import { ColorParseError } from './types';

/**
 * Convert HEX color to HSL
 *
 * @param hex - Color in #rrggbb format
 * @returns ColorHSL object
 * @throws ColorParseError if invalid hex
 *
 * @example
 * hexToHSL('#3b82f6') // { h: 221, s: 83, l: 53 }
 */
export function hexToHSL(hex: string): ColorHSL {
  // Remove # prefix
  hex = hex.replace(/^#/, '');

  // Validate format
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new ColorParseError(hex, 'Invalid HEX format. Expected #rrggbb');
  }

  // Parse to RGB (0-255 range)
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return rgbToHSL(r, g, b);
}

/**
 * Convert RGB to HSL
 * Algorithm from: https://gist.github.com/mjackson/5311256
 *
 * @param r - Red (0-255 or 0-1)
 * @param g - Green (0-255 or 0-1)
 * @param b - Blue (0-255 or 0-1)
 * @returns ColorHSL object
 *
 * @example
 * rgbToHSL(59, 130, 246) // { h: 221, s: 83, l: 53 }
 */
export function rgbToHSL(r: number, g: number, b: number): ColorHSL {
  // Normalize to 0-1 if needed
  if (r > 1 || g > 1 || b > 1) {
    r /= 255;
    g /= 255;
    b /= 255;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 * Algorithm from: https://gist.github.com/mjackson/5311256
 *
 * @param color - ColorHSL object
 * @returns RGB object with values 0-255
 *
 * @example
 * hslToRGB({ h: 221, s: 83, l: 53 }) // { r: 59, g: 130, b: 246 }
 */
export function hslToRGB(color: ColorHSL): { r: number; g: number; b: number } {
  const h = color.h / 360;
  const s = color.s / 100;
  const l = color.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // Achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Format ColorHSL as CSS custom property value
 * SPEC-TH-BC-006: Format must be "hue saturation% lightness%"
 *
 * @param color - ColorHSL object
 * @returns String like "221 83% 53%"
 *
 * @example
 * hslToString({ h: 221, s: 83, l: 53 }) // "221 83% 53%"
 */
export function hslToString(color: ColorHSL): string {
  return `${color.h} ${color.s}% ${color.l}%`;
}

/**
 * Parse color string (HEX, RGB, or HSL) to ColorHSL
 *
 * @param input - Color string
 * @returns ColorHSL object
 * @throws ColorParseError if format unrecognized
 *
 * @example
 * parseColor('#3b82f6')           // { h: 221, s: 83, l: 53 }
 * parseColor('rgb(59, 130, 246)') // { h: 221, s: 83, l: 53 }
 * parseColor('221 83% 53%')       // { h: 221, s: 83, l: 53 }
 */
export function parseColor(input: string): ColorHSL {
  input = input.trim();

  // HEX format: #rrggbb
  if (input.startsWith('#')) {
    return hexToHSL(input);
  }

  // HSL format: "221 83% 53%" or "hsl(221, 83%, 53%)"
  const hslMatch = input.match(/^(?:hsl\()?(\d+)\s*,?\s*(\d+)%?\s*,?\s*(\d+)%?\)?$/);
  if (hslMatch) {
    return {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3])
    };
  }

  // RGB format: "rgb(r, g, b)"
  const rgbMatch = input.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return rgbToHSL(
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3])
    );
  }

  throw new ColorParseError(input, 'Unrecognized color format. Expected HEX (#rrggbb), RGB (rgb(r,g,b)), or HSL');
}

/**
 * Adjust lightness of a color
 *
 * @param color - Base color
 * @param delta - Change in lightness (-100 to +100)
 * @returns New ColorHSL with adjusted lightness
 *
 * @example
 * adjustLightness({ h: 221, s: 83, l: 53 }, 20) // { h: 221, s: 83, l: 73 }
 */
export function adjustLightness(color: ColorHSL, delta: number): ColorHSL {
  return {
    ...color,
    l: clamp(color.l + delta, 0, 100)
  };
}

/**
 * Adjust saturation of a color
 *
 * @param color - Base color
 * @param delta - Change in saturation (-100 to +100)
 * @returns New ColorHSL with adjusted saturation
 *
 * @example
 * adjustSaturation({ h: 221, s: 83, l: 53 }, -20) // { h: 221, s: 63, l: 53 }
 */
export function adjustSaturation(color: ColorHSL, delta: number): ColorHSL {
  return {
    ...color,
    s: clamp(color.s + delta, 0, 100)
  };
}

/**
 * Clamp value to range
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
