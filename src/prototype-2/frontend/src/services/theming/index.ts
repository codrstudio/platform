// Main exports
export { generatePalette, DEFAULT_PRIMARY_COLOR } from './paletteGenerator';
export { parseColor, hslToString, hexToHSL, rgbToHSL, hslToRGB, adjustLightness, adjustSaturation } from './colorUtils';

// WCAG validation exports
export {
  validateContrast,
  adjustToMeetContrast,
  getValidationMessage,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AA_LARGE_TEXT,
  WCAG_AAA_NORMAL_TEXT,
  WCAG_AAA_LARGE_TEXT
} from './wcagValidator';

export {
  calculateContrastRatio,
  getColorLuminance
} from './contrastUtils';

// Semantic colors
export {
  generateSemanticColors,
  getSemanticColor,
  getSemanticIcon,
  SUCCESS_COLOR_LIGHT,
  SUCCESS_COLOR_DARK,
  WARNING_COLOR_LIGHT,
  WARNING_COLOR_DARK,
  ERROR_COLOR_LIGHT,
  ERROR_COLOR_DARK,
  INFO_COLOR_LIGHT,
  INFO_COLOR_DARK
} from './semanticColors';

// Type exports
export type { ColorHSL, ThemeMode, PaletteVariants, ContrastLevel, ValidationResult, SemanticColorName, SemanticColorPalette } from './types';
export { ColorParseError } from './types';
