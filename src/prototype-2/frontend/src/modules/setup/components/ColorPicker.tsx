/**
 * ColorPicker Component
 *
 * Allows users to select and configure brand color for a portal.
 * Features:
 * - Visual color picker (react-colorful)
 * - HEX text input with validation
 * - Contrast validation with WCAG AA guidelines
 * - Suggested color adjustments for better accessibility
 * - Reset to default functionality
 * - Real-time preview support
 *
 * Based on Task 2.2.4 plan
 */

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check, AlertTriangle, RotateCcw } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeProvider';
import {
  convertHexToHSL,
  convertHSLToRGB,
  convertHSLToHex,
  validateContrast,
  adjustForContrast,
} from '../../../services/theme';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { ThemePreview } from './ThemePreview';

const DEFAULT_BRAND_COLOR = '#3b82f6'; // Tailwind blue-500

export function ColorPicker() {
  const { brandColor, setBrandColor } = useTheme();

  // Temporary color being edited (before save)
  const [tempColor, setTempColor] = useState<string>(brandColor || DEFAULT_BRAND_COLOR);

  // Validation state
  const [warning, setWarning] = useState<string | null>(null);
  const [suggestedColor, setSuggestedColor] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Success feedback
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync tempColor when brandColor changes externally
  useEffect(() => {
    if (brandColor) {
      setTempColor(brandColor);
    }
  }, [brandColor]);

  // Validate HEX format
  const isValidHex = (hex: string): boolean => {
    // Accept with or without #
    const hexPattern = /^#?([A-Fa-f0-9]{6})$/;
    return hexPattern.test(hex);
  };

  // Normalize HEX (ensure # prefix and uppercase)
  const normalizeHex = (hex: string): string => {
    const cleaned = hex.replace('#', '').toUpperCase();
    return `#${cleaned}`;
  };

  // Validate contrast and suggest adjustments
  useEffect(() => {
    if (!isValidHex(tempColor)) {
      setWarning(null);
      setSuggestedColor(null);
      return;
    }

    try {
      const normalized = normalizeHex(tempColor);
      const colorHSL = convertHexToHSL(normalized);
      const colorRGB = convertHSLToRGB(colorHSL);

      // Define light and dark backgrounds
      const lightBgHSL = { h: 0, s: 0, l: 100 }; // White
      const darkBgHSL = { h: 0, s: 0, l: 4 }; // Near black

      const lightBgRGB = convertHSLToRGB(lightBgHSL);
      const darkBgRGB = convertHSLToRGB(darkBgHSL);

      // Check contrast in both themes
      const lightContrast = validateContrast(colorRGB, lightBgRGB, 'AA', false);
      const darkContrast = validateContrast(colorRGB, darkBgRGB, 'AA', false);

      if (!lightContrast.passes || !darkContrast.passes) {
        // Find which theme has the problem
        const problemTheme = !lightContrast.passes ? 'light' : 'dark';
        const contrast = !lightContrast.passes ? lightContrast : darkContrast;
        const problemBg = !lightContrast.passes ? lightBgHSL : darkBgHSL;

        // Get suggested adjustment
        const adjustedHSL = adjustForContrast(colorHSL, problemBg, 4.5);
        const adjustedHex = convertHSLToHex(adjustedHSL);
        setSuggestedColor(adjustedHex);
        setWarning(
          `This color may have insufficient contrast in ${problemTheme} mode (${contrast.ratio.toFixed(1)}:1). ` +
          `WCAG AA requires at least 4.5:1 for normal text.`
        );
      } else {
        setWarning(null);
        setSuggestedColor(null);
      }
    } catch (error) {
      console.error('[ColorPicker] Contrast validation failed:', error);
      setWarning(null);
      setSuggestedColor(null);
    }
  }, [tempColor]);

  // Handle color picker change
  const handlePickerChange = (color: string) => {
    // react-colorful returns hex without #
    const normalized = normalizeHex(color);
    setTempColor(normalized);
    setInputError(null);
  };

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempColor(value);

    if (value && !isValidHex(value)) {
      setInputError('Invalid HEX color format. Use format #rrggbb or rrggbb');
    } else {
      setInputError(null);
    }
  };

  // Apply color
  const handleApply = () => {
    if (!isValidHex(tempColor)) {
      setInputError('Please enter a valid HEX color');
      return;
    }

    try {
      const normalized = normalizeHex(tempColor);
      setBrandColor(normalized);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('[ColorPicker] Failed to apply color:', error);
      setInputError('Failed to apply color. Please try again.');
    }
  };

  // Reset to default
  const handleReset = () => {
    if (confirm('Reset to default blue color?')) {
      setBrandColor(null);
      setTempColor(DEFAULT_BRAND_COLOR);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // Use suggested color
  const handleUseSuggested = () => {
    if (suggestedColor) {
      setTempColor(suggestedColor);
      setWarning(null);
      setSuggestedColor(null);
    }
  };

  // Dismiss warning
  const handleDismissWarning = () => {
    setWarning(null);
    setSuggestedColor(null);
  };

  // Get color for picker (without #)
  const pickerColor = tempColor.replace('#', '');

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Brand Color</h3>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-800 dark:bg-green-950 dark:text-green-200">
          <Check className="h-4 w-4" />
          <p className="text-sm">Brand color applied successfully!</p>
        </div>
      )}

      {/* Warning Banner */}
      {warning && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{warning}</p>
              {suggestedColor && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium">Suggested:</span>
                  <div
                    className="h-6 w-6 rounded border border-yellow-300 dark:border-yellow-700"
                    style={{ backgroundColor: suggestedColor }}
                    aria-label={`Suggested color: ${suggestedColor}`}
                  />
                  <span className="font-mono text-sm">{suggestedColor}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {suggestedColor && (
              <button
                onClick={handleUseSuggested}
                className="text-sm font-medium text-yellow-800 hover:underline dark:text-yellow-200"
              >
                Use Suggested
              </button>
            )}
            <button
              onClick={handleDismissWarning}
              className="text-sm font-medium text-yellow-800 hover:underline dark:text-yellow-200"
            >
              Use Anyway
            </button>
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div className="space-y-4">
        <div className="mx-auto w-full max-w-[350px]">
          <HexColorPicker
            color={pickerColor}
            onChange={handlePickerChange}
            aria-label="Select brand color"
            style={{ width: '100%', height: '280px' }}
          />
        </div>

        {/* HEX Input */}
        <div className="space-y-2">
          <Label htmlFor="hex-input">Color</Label>
          <Input
            id="hex-input"
            type="text"
            value={tempColor}
            onChange={handleInputChange}
            placeholder="#3b82f6"
            aria-label="Brand color HEX value"
            aria-describedby="hex-hint"
            className="font-mono"
          />
          {inputError ? (
            <p className="text-sm text-destructive" role="alert">
              {inputError}
            </p>
          ) : (
            <p id="hex-hint" className="text-sm text-muted-foreground">
              Enter a HEX color code (e.g., #3b82f6)
            </p>
          )}
        </div>

        {/* Current Color Display */}
        <div className="flex items-center gap-3">
          <Label>Current:</Label>
          <div
            className="h-8 w-8 rounded border border-border"
            style={{ backgroundColor: brandColor || DEFAULT_BRAND_COLOR }}
            aria-label={`Current brand color: ${brandColor || DEFAULT_BRAND_COLOR}`}
          />
          <span className="font-mono text-sm">{brandColor || DEFAULT_BRAND_COLOR}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleReset}
          variant="outline"
          aria-label="Reset brand color to default"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
        <Button
          onClick={handleApply}
          disabled={!!inputError}
          className="ml-auto"
        >
          <Check className="mr-2 h-4 w-4" />
          Apply Color
        </Button>
      </div>

      {/* Real-time Theme Preview */}
      <div className="mt-6 border-t pt-6">
        <h4 className="mb-4 text-sm font-semibold">Preview</h4>
        <ThemePreview previewColor={tempColor} />
      </div>
    </div>
  );
}
