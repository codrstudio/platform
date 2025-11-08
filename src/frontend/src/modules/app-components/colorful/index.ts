/**
 * react-colorful - Color picker
 *
 * Re-exporta componentes do react-colorful.
 *
 * @see https://omgovich.github.io/react-colorful/
 */

export {
  HexColorPicker,
  HexColorInput,
  RgbColorPicker,
  RgbaColorPicker,
  HslColorPicker,
  HslaColorPicker,
  HsvColorPicker,
  HsvaColorPicker,
} from 'react-colorful';

// Types para cores
export type HexColor = string;
export type RgbColor = { r: number; g: number; b: number };
export type RgbaColor = { r: number; g: number; b: number; a: number };
export type HslColor = { h: number; s: number; l: number };
export type HslaColor = { h: number; s: number; l: number; a: number };
export type HsvColor = { h: number; s: number; v: number };
export type HsvaColor = { h: number; s: number; v: number; a: number };
