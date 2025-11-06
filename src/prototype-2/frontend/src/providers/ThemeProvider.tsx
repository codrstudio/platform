/**
 * ThemeProvider - Global theme management with React Context
 *
 * Based on SPEC-theming.md SPEC-TH-AP-001:020
 *
 * Features:
 * - Theme mode management (light/dark/system)
 * - System theme detection and watching
 * - localStorage persistence
 * - Dark class application to <html>
 * - CSS palette generation and application
 * - Cross-tab synchronization
 * - Prevention of flash-of-unstyled-content (FOUC)
 *
 * Usage:
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * Consuming components use the `useTheme()` hook to access theme state.
 */

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ThemeMode, ThemeContextValue, ThemeProviderProps } from '../types/theme';
import * as themeStorage from '../services/theme/themeStorage';
import { convertHexToHSL, generatePalette, applyPalette, generateSemanticColors } from '../services/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider component
 * Manages global theme state and provides theme methods to the application
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Settings key for localStorage (hardcoded for now, will be from portal config in future)
  const [settingsKey] = useState<string>('default');

  // Theme state
  const [rawTheme, setRawTheme] = useState<ThemeMode>('system'); // User's preference
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Resolved theme
  const [brandColor, setBrandColorState] = useState<string | null>(null);

  // Effect: Resolve "system" theme to actual light/dark
  useEffect(() => {
    if (rawTheme !== 'system') {
      // User explicitly selected light or dark
      setTheme(rawTheme);
      return;
    }

    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial theme
    updateTheme();

    // Listen for system preference changes
    mediaQuery.addEventListener('change', updateTheme);

    // Cleanup listener
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [rawTheme]);

  // Effect: Load theme preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = themeStorage.loadTheme(settingsKey);
    if (savedTheme) {
      console.log(`[Theme] Restored theme: ${savedTheme}`);
      setRawTheme(savedTheme);
    }

    const savedColor = themeStorage.loadBrandColor(settingsKey);
    if (savedColor) {
      console.log(`[Theme] Restored brand color: ${savedColor}`);
      setBrandColorState(savedColor);
    }
  }, [settingsKey]);

  // Effect: Apply dark class to HTML element
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Effect: Apply CSS palette when brand color or mode changes
  useEffect(() => {
    if (brandColor) {
      try {
        // Convert HEX to HSL (brandColor is stored as HEX in localStorage)
        const hsl = convertHexToHSL(brandColor);

        // Generate complete palette from brand color
        const palette = generatePalette(hsl, theme);

        // Add semantic colors (success, warning, error, info)
        const semanticColors = generateSemanticColors(theme);
        const completePalette = { ...palette, ...semanticColors };

        // Apply palette to document
        applyPalette(completePalette);
      } catch (error) {
        console.error('Failed to apply brand color palette:', error);
        // Continue with default theme - no user-visible error
      }
    }
    // Note: If no brand color, Tailwind's default theme will be used from CSS
  }, [brandColor, theme]);

  // Effect: Sync theme changes across tabs using storage event
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only respond to localStorage changes (not sessionStorage)
      if (event.storageArea !== localStorage) return;

      const themeKey = `${settingsKey}:theme`;
      const colorKey = `${settingsKey}:brand-color`;

      // Handle theme change from another tab
      if (event.key === themeKey) {
        const newTheme = event.newValue as ThemeMode | null;
        if (newTheme && (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system')) {
          console.log(`[Theme] Cross-tab sync - theme changed to: ${newTheme}`);
          setRawTheme(newTheme); // Update state (don't save again!)
        }
      }

      // Handle brand color change from another tab
      if (event.key === colorKey) {
        const newColor = event.newValue;
        console.log(`[Theme] Cross-tab sync - brand color changed to: ${newColor || 'null (removed)'}`);
        setBrandColorState(newColor); // Update state (don't save again!)
      }
    };

    // Add listener
    window.addEventListener('storage', handleStorageChange);
    console.log(`[Theme] Cross-tab sync enabled for settings key: ${settingsKey}`);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log(`[Theme] Cross-tab sync disabled for settings key: ${settingsKey}`);
    };
  }, [settingsKey]);

  // Handler: Update theme preference
  const handleSetTheme = (newTheme: ThemeMode) => {
    console.log(`[Theme] Setting theme to: ${newTheme}`);
    setRawTheme(newTheme);
    themeStorage.saveTheme(settingsKey, newTheme);
  };

  // Handler: Update brand color
  // Accepts HEX color format (e.g., "#3b82f6")
  // Conversion to HSL and palette generation happens in effect above
  const handleSetBrandColor = (color: string | null) => {
    console.log(`[Theme] Setting brand color to: ${color || 'null (removed)'}`);
    setBrandColorState(color);

    if (color) {
      themeStorage.saveBrandColor(settingsKey, color);
    } else {
      themeStorage.removeBrandColor(settingsKey);
    }
  };

  // Context value (optimized with useMemo to prevent unnecessary re-renders)
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      rawTheme,
      brandColor,
      settingsKey,
      setTheme: handleSetTheme,
      setBrandColor: handleSetBrandColor,
    }),
    [theme, rawTheme, brandColor, settingsKey]
    // Note: handleSetTheme and handleSetBrandColor are stable references
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * Throws error if used outside ThemeProvider
 *
 * @returns Theme context value with current theme state and setters
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Wrap your component tree with <ThemeProvider>.'
    );
  }

  return context;
}
