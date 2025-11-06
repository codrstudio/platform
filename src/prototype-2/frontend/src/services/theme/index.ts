/**
 * Theme services public API
 * Exports all theme-related utilities
 */

// Color conversion
export {
  convertHexToHSL,
  convertHSLToHex,
  convertHSLToRGB,
  convertRGBToHSL,
  formatHSLForCSS,
  parseHSLFromCSS,
} from './colorConversion';

// Palette generation
export {
  generatePalette,
  generateSemanticColors,
} from './paletteGenerator';

// Contrast validation
export {
  calculateContrast,
  validateContrast,
  adjustForContrast,
  getOptimalForeground,
} from './contrastValidator';

// CSS generation
export {
  generateCSSVariables,
  applyPalette,
  removePalette,
  getCSSVariable,
} from './cssGenerator';

// Theme storage (already exists)
export {
  saveTheme,
  loadTheme,
  saveBrandColor,
  loadBrandColor,
  removeBrandColor,
} from './themeStorage';
