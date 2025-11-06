/**
 * Color in HSL format
 * SPEC-TH-BC-005: Brand color MUST be stored in HSL format
 */
export interface ColorHSL {
  h: number;   // Hue: 0-360 degrees
  s: number;   // Saturation: 0-100 percent
  l: number;   // Lightness: 0-100 percent
}

export type ThemeMode = 'light' | 'dark';

/**
 * Generated palette variants for a theme mode
 * SPEC-TH-BC-013: Must generate primary and primary-foreground
 */
export interface PaletteVariants {
  primary: string;           // HSL string: "hue saturation% lightness%"
  primaryForeground: string; // HSL string for text on primary
}

/**
 * Error thrown when color parsing fails
 */
export class ColorParseError extends Error {
  input: string;

  constructor(input: string, message?: string) {
    super(message || `Failed to parse color: ${input}`);
    this.name = 'ColorParseError';
    this.input = input;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ColorParseError);
    }
  }

  static isColorParseError(error: unknown): error is ColorParseError {
    return error instanceof ColorParseError;
  }
}

/**
 * WCAG contrast levels
 * SPEC-TH-AC-001: Platform MUST follow WCAG 2.1 Level AA
 */
export type ContrastLevel =
  | 'AA-normal'   // 4.5:1 - Normal text
  | 'AA-large'    // 3:1 - Large text (18pt or 14pt bold)
  | 'AAA-normal'  // 7:1 - Enhanced normal text
  | 'AAA-large';  // 4.5:1 - Enhanced large text

/**
 * Result of WCAG contrast validation
 * SPEC-TH-AC-002:004: Contrast requirements
 */
export interface ValidationResult {
  /** Whether the contrast ratio meets the required level */
  passes: boolean;

  /** Actual contrast ratio calculated */
  ratio: number;

  /** Required contrast ratio for the level */
  required: number;

  /** WCAG level validated against */
  level: ContrastLevel;

  /** Suggested adjustment if validation fails */
  adjustment?: {
    originalLightness: number;
    adjustedLightness: number;
    direction: 'lighter' | 'darker';
  };
}

/**
 * Semantic color names
 * SPEC-TH-CS-001:004: Success, warning, error, info
 */
export type SemanticColorName = 'success' | 'warning' | 'error' | 'info';

/**
 * Complete semantic color palette for a theme mode
 * SPEC-TH-CS-005:016: All semantic colors with foregrounds
 */
export interface SemanticColorPalette {
  /** Success state (green) - SPEC-TH-CS-005:007 */
  success: string;
  successForeground: string;

  /** Warning state (yellow/orange) - SPEC-TH-CS-008:010 */
  warning: string;
  warningForeground: string;

  /** Error/Destructive state (red) - SPEC-TH-CS-011:013 */
  error: string;
  errorForeground: string;
  destructive: string;          // Alias for shadcn/ui compatibility
  destructiveForeground: string;

  /** Info state (blue) - SPEC-TH-CS-014:016 */
  info: string;
  infoForeground: string;
}
