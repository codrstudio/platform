/**
 * ThemeProvider - Global theme management with React Context
 *
 * Based on SPEC-theming.md SPEC-TH-AP-001:020
 *
 * Features (from 1.6.8):
 * - Theme mode management (light/dark/system)
 * - System theme detection and watching
 * - localStorage persistence
 * - Dark class application to <html>
 * - CSS palette generation and application
 * - Cross-tab synchronization
 * - Prevention of flash-of-unstyled-content (FOUC)
 *
 * NEW (1.6.9):
 * - Portal settings-key awareness
 * - Per-settings-key theme isolation
 * - Automatic theme reload on portal switch
 * - Settings-key based storage keys
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

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ThemeMode, ThemeContextValue, ThemeProviderProps } from '../types/theme';
import * as themeStorage from '../services/theme/themeStorage';
import { convertHexToHSL, generatePalette, applyPalette, generateSemanticColors } from '../services/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Extract portal ID from current URL pathname
 * Works without React Router hooks (can be used before Router is mounted)
 */
function getPortalIdFromPath(pathname: string): string {
  // Root path "/" maps to "main" portal
  if (pathname === '/') return 'main';

  // Other paths like "/setup" or "/setup/whatever" extract first segment
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] || 'main';
}

/**
 * ThemeProvider component with settings-key support
 * Manages global theme state and provides theme methods to the application
 *
 * NOTE: Does not depend on React Router - uses native window.location
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Determine portal ID from URL (without React Router hooks)
  const [portalId, setPortalId] = useState<string>(() =>
    getPortalIdFromPath(window.location.pathname)
  );

  // Listen for URL changes (for when user navigates between portals)
  useEffect(() => {
    const handleLocationChange = () => {
      const newPortalId = getPortalIdFromPath(window.location.pathname);
      if (newPortalId !== portalId) {
        setPortalId(newPortalId);
      }
    };

    // Listen to both popstate (back/forward) and custom navigation events
    window.addEventListener('popstate', handleLocationChange);

    // For client-side navigation, we'll check on interval (React Router doesn't fire popstate)
    const intervalId = setInterval(handleLocationChange, 500);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(intervalId);
    };
  }, [portalId]);

  // For now, use hardcoded settingsKey mapping
  // TODO: Load portal config via JQEL to get real settingsKey
  const settingsKey = useMemo(() => {
    // Hardcoded mapping until we can load portal config
    // Both main and setup use 'default' settings-key
    return 'default';
  }, [portalId]);

  // Track current settings-key to detect changes
  const [currentSettingsKey, setCurrentSettingsKey] = useState<string>('default');

  // Migration flag (run once per settings-key)
  const [migrated, setMigrated] = useState<Set<string>>(new Set());

  // Theme state
  const [rawTheme, setRawTheme] = useState<ThemeMode>(() => {
    // Initial load from 'default' settings-key
    return themeStorage.loadTheme('default') || 'system';
  });

  // Resolved theme (light/dark only, no 'system')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const initial = themeStorage.loadTheme('default') || 'system';
    if (initial === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return initial;
  });

  // Brand color state
  const [brandColor, setBrandColorState] = useState<string | null>(() => {
    // Initial load from 'default' settings-key
    return themeStorage.loadBrandColor('default');
  });

  /**
   * Load theme for current settings-key
   */
  const loadThemeForSettingsKey = useCallback((key: string) => {
    // Run migration once per settings-key
    if (!migrated.has(key)) {
      themeStorage.migrateGlobalTheme(key);
      setMigrated(prev => new Set(prev).add(key));
    }

    // Load theme mode
    const savedMode = themeStorage.loadTheme(key) || 'system';
    setRawTheme(savedMode);

    // Resolve mode
    if (savedMode !== 'system') {
      setTheme(savedMode);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }

    // Load brand color
    const savedColor = themeStorage.loadBrandColor(key);
    setBrandColorState(savedColor);

    console.log(`[Theme] Loaded theme for settings-key "${key}": mode=${savedMode}, color=${savedColor}`);
  }, [migrated]);

  /**
   * Detect settings-key changes and reload theme
   */
  useEffect(() => {
    if (settingsKey !== currentSettingsKey) {
      loadThemeForSettingsKey(settingsKey);
      setCurrentSettingsKey(settingsKey);
    }
  }, [settingsKey, currentSettingsKey, loadThemeForSettingsKey]);

  /**
   * Update theme mode (settings-key aware)
   */
  const handleSetTheme = useCallback((newMode: ThemeMode) => {
    console.log(`[Theme] Setting theme to: ${newMode}`);
    setRawTheme(newMode);
    themeStorage.saveTheme(currentSettingsKey, newMode);

    // Resolve immediately if not system
    if (newMode !== 'system') {
      setTheme(newMode);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  }, [currentSettingsKey]);

  /**
   * Update brand color (settings-key aware)
   */
  const handleSetBrandColor = useCallback((color: string | null) => {
    console.log(`[Theme] Setting brand color to: ${color || 'null (removed)'}`);
    setBrandColorState(color);

    if (color) {
      themeStorage.saveBrandColor(currentSettingsKey, color);
    } else {
      themeStorage.removeBrandColor(currentSettingsKey);
    }
  }, [currentSettingsKey]);

  /**
   * Effect: Resolve "system" theme to actual light/dark
   */
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

  /**
   * Effect: Apply dark class to HTML element
   */
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  /**
   * Effect: Apply CSS palette when brand color or mode changes
   */
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
        console.error('[Theme] Failed to apply brand color palette:', error);
        // Continue with default theme - no user-visible error
      }
    }
    // Note: If no brand color, Tailwind's default theme will be used from CSS
  }, [brandColor, theme]);

  /**
   * Effect: Cross-tab synchronization (settings-key filtered)
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key) return;

      // Extract settings-key from changed key
      const changedSettingsKey = themeStorage.extractSettingsKey(event.key);

      // Only apply if it matches current settings-key
      if (changedSettingsKey !== currentSettingsKey) {
        return;
      }

      // Handle theme mode change
      if (event.key === themeStorage.getThemeModeKey(currentSettingsKey)) {
        const newMode = event.newValue as ThemeMode | null;
        if (newMode === 'light' || newMode === 'dark' || newMode === 'system') {
          console.log(`[Theme] Cross-tab sync - theme changed to: ${newMode}`);
          setRawTheme(newMode);

          if (newMode !== 'system') {
            setTheme(newMode);
          } else {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setTheme(systemTheme);
          }
        }
      }

      // Handle brand color change
      if (event.key === themeStorage.getBrandColorKey(currentSettingsKey)) {
        console.log(`[Theme] Cross-tab sync - brand color changed to: ${event.newValue || 'null (removed)'}`);
        setBrandColorState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentSettingsKey]);

  // Context value (optimized with useMemo to prevent unnecessary re-renders)
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      rawTheme,
      brandColor,
      settingsKey: currentSettingsKey,
      setTheme: handleSetTheme,
      setBrandColor: handleSetBrandColor,
    }),
    [theme, rawTheme, brandColor, currentSettingsKey, handleSetTheme, handleSetBrandColor]
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
