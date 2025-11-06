/**
 * Theme Provider
 *
 * Manages theme state, persistence, and application across the app.
 *
 * References:
 * - SPEC-theming.md (All SPEC-TH-* requirements)
 * - SPEC-module-setup.md (SPEC-MS-TE-*)
 */

import { createContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode, BrandColorHSL, ThemeContextValue } from '@/types/theme';
import { generatePalette, validateContrast as validateContrastFn, generateSemanticColors } from '@/services/theme/paletteGenerator';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** Settings key for theme persistence (SPEC-TH-SK-001) */
  settingsKey?: string;
}

/**
 * Theme Provider Component
 * SPEC-TH-AP-017 to SPEC-TH-AP-020: React Context for theme management
 */
export function ThemeProvider({ children, settingsKey: initialSettingsKey = 'default' }: ThemeProviderProps) {
  const [settingsKey, setSettingsKeyState] = useState(initialSettingsKey);
  const [rawTheme, setRawTheme] = useState<ThemeMode>('system');
  const [brandColor, setBrandColorState] = useState<BrandColorHSL | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // SPEC-TH-SK-008: Generate storage keys with settings-key prefix
  const getStorageKey = (config: string) => `${settingsKey}:${config}`;

  // SPEC-TH-LD-007, SPEC-TH-LD-016 to SPEC-TH-LD-018: Detect system theme
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme mode to actual theme
  const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
    // SPEC-TH-LD-013: "system" resolves to "light" or "dark"
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode;
  };

  // SPEC-TH-AP-001 to SPEC-TH-AP-006: Initialize theme before first render
  useEffect(() => {
    // SPEC-TH-LD-008 to SPEC-TH-LD-011: Load from localStorage
    const savedTheme = localStorage.getItem(getStorageKey('theme')) as ThemeMode | null;
    const savedBrandColor = localStorage.getItem(getStorageKey('brand-color'));

    // SPEC-TH-LD-006: Invalid values fallback to "system"
    const initialTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system';

    setRawTheme(initialTheme);
    setBrandColorState(savedBrandColor);

    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);

    // SPEC-TH-AP-005: Apply theme class immediately
    applyThemeClass(resolved);

    // SPEC-TH-AP-006: Apply custom properties
    if (savedBrandColor) {
      applyBrandColor(savedBrandColor, resolved);
    }
  }, [settingsKey]);

  // SPEC-TH-LD-015, SPEC-TH-LD-017, SPEC-TH-LD-018: Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (rawTheme === 'system') {
        const newTheme = getSystemTheme();
        setResolvedTheme(newTheme);
        applyThemeClass(newTheme);
        if (brandColor) {
          applyBrandColor(brandColor, newTheme);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [rawTheme, brandColor]);

  // SPEC-TH-LD-010: Sync theme between tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey('theme') && e.newValue) {
        const newTheme = e.newValue as ThemeMode;
        setRawTheme(newTheme);
        const resolved = resolveTheme(newTheme);
        setResolvedTheme(resolved);
        applyThemeClass(resolved);
      }

      if (e.key === getStorageKey('brand-color')) {
        const newColor = e.newValue;
        setBrandColorState(newColor);
        if (newColor) {
          applyBrandColor(newColor, resolvedTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [settingsKey, resolvedTheme]);

  // SPEC-TH-LD-012 to SPEC-TH-LD-013: Apply theme via CSS class
  const applyThemeClass = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  };

  // SPEC-TH-BC-017 to SPEC-TH-BC-020: Apply brand color via CSS custom properties
  const applyBrandColor = (color: BrandColorHSL, theme: 'light' | 'dark') => {
    const palette = generatePalette(color);
    const root = document.documentElement;

    // SPEC-TH-BC-018: Set --primary variable
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-foreground', palette.primaryForeground);

    // Apply semantic colors for current theme
    const semanticColors = generateSemanticColors(theme === 'dark');
    root.style.setProperty('--success', semanticColors.success);
    root.style.setProperty('--success-foreground', semanticColors.successForeground);
    root.style.setProperty('--warning', semanticColors.warning);
    root.style.setProperty('--warning-foreground', semanticColors.warningForeground);
    root.style.setProperty('--error', semanticColors.error);
    root.style.setProperty('--error-foreground', semanticColors.errorForeground);
    root.style.setProperty('--info', semanticColors.info);
    root.style.setProperty('--info-foreground', semanticColors.infoForeground);
  };

  // SPEC-TH-AP-007 to SPEC-TH-AP-011: Theme change handler
  const setTheme = (mode: ThemeMode) => {
    setRawTheme(mode);
    // SPEC-TH-LD-008 to SPEC-TH-LD-009: Save to localStorage
    localStorage.setItem(getStorageKey('theme'), mode);

    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);

    // SPEC-TH-AP-010: Update class immediately
    applyThemeClass(resolved);

    if (brandColor) {
      applyBrandColor(brandColor, resolved);
    }
  };

  // SPEC-TH-AP-012 to SPEC-TH-AP-016: Brand color change handler
  const setBrandColor = (color: BrandColorHSL | null) => {
    setBrandColorState(color);

    // SPEC-TH-AP-014: Save to localStorage
    if (color) {
      localStorage.setItem(getStorageKey('brand-color'), color);
      // SPEC-TH-AP-015: Update custom properties
      applyBrandColor(color, resolvedTheme);
    } else {
      localStorage.removeItem(getStorageKey('brand-color'));
      // Reset to default
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
    }
  };

  // SPEC-TH-SK-004: Settings key change handler
  const setSettingsKey = (key: string) => {
    setSettingsKeyState(key);
    // Theme will re-initialize via useEffect when settingsKey changes
  };

  const contextValue: ThemeContextValue = {
    theme: resolvedTheme,
    rawTheme,
    brandColor,
    settingsKey,
    setTheme,
    setBrandColor,
    setSettingsKey,
    generatePalette,
    validateContrast: validateContrastFn,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
