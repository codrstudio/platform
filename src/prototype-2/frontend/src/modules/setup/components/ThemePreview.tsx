/**
 * ThemePreview Component
 *
 * Shows real-time theme preview in both light and dark modes.
 * Generates palettes on-the-fly from preview color and displays side-by-side previews.
 *
 * Based on Task 2.2.5 plan
 */

import { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  convertHexToHSL,
  generatePalette,
  generateSemanticColors,
  generateCSSVariables,
} from '../../../services/theme';
import { PreviewCard } from './PreviewCard';

interface ThemePreviewProps {
  previewColor: string; // HEX color string
}

export function ThemePreview({ previewColor }: ThemePreviewProps) {
  // Debounced color for palette generation
  const [debouncedColor, setDebouncedColor] = useState<string>(previewColor);

  // Generated palettes
  const [lightPalette, setLightPalette] = useState<Record<string, string> | null>(null);
  const [darkPalette, setDarkPalette] = useState<Record<string, string> | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce color changes
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedColor(previewColor);
    }, 150); // 150ms debounce

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [previewColor]);

  // Generate palettes when debounced color changes
  useEffect(() => {
    if (!debouncedColor) {
      return;
    }

    // Validate HEX format
    const hexPattern = /^#?([A-Fa-f0-9]{6})$/;
    if (!hexPattern.test(debouncedColor)) {
      setError('Invalid color format');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Normalize HEX
      const normalized = debouncedColor.startsWith('#')
        ? debouncedColor
        : `#${debouncedColor}`;

      // Convert to HSL
      const hsl = convertHexToHSL(normalized);

      // Generate palettes for both themes
      const lightPaletteData = generatePalette(hsl, 'light');
      const darkPaletteData = generatePalette(hsl, 'dark');

      // Generate semantic colors (theme-independent)
      const semanticColors = generateSemanticColors('light'); // Mode doesn't matter for semantic

      // Merge palettes with semantic colors
      const completeLightPalette = { ...lightPaletteData, ...semanticColors };
      const completeDarkPalette = { ...darkPaletteData, ...semanticColors };

      // Convert HSL palettes to CSS variable strings
      const lightCSSVars = generateCSSVariables(completeLightPalette);
      const darkCSSVars = generateCSSVariables(completeDarkPalette);

      setLightPalette(lightCSSVars);
      setDarkPalette(darkCSSVars);
      setIsLoading(false);
    } catch (err) {
      console.error('[ThemePreview] Failed to generate palette:', err);
      setError('Unable to generate palette');
      setLightPalette(null);
      setDarkPalette(null);
      setIsLoading(false);
    }
  }, [debouncedColor]);

  // Error state UI
  if (error) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-12"
        role="region"
        aria-label="Theme preview"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Preview unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state UI
  if (isLoading || !lightPalette || !darkPalette) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-12"
        role="region"
        aria-label="Theme preview"
        aria-busy="true"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-2 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating preview...</p>
        </div>
      </div>
    );
  }

  // Normal state - show previews
  return (
    <div role="region" aria-label="Theme preview">
      <div className="grid gap-6 md:grid-cols-2">
        <PreviewCard theme="light" palette={lightPalette} />
        <PreviewCard theme="dark" palette={darkPalette} />
      </div>
    </div>
  );
}
