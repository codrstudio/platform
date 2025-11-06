/**
 * Theme Storage Service
 * Encapsulates localStorage operations for theme preferences
 * Based on SPEC-theming.md SPEC-TH-SK-008:010
 *
 * Key format: {settingsKey}:theme and {settingsKey}:brand-color
 * All operations wrapped in try-catch for graceful error handling
 */

import type { ThemeMode } from '../../types/theme';

/**
 * Load theme preference from localStorage
 * @param settingsKey - Portal's settings key
 * @returns ThemeMode if found, null otherwise
 */
export function loadTheme(settingsKey: string): ThemeMode | null {
  try {
    const key = `${settingsKey}:theme`;
    const value = localStorage.getItem(key);

    // Validate that the value is a valid ThemeMode
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }

    return null;
  } catch (error) {
    console.error('localStorage.getItem failed for theme:', error);
    return null;
  }
}

/**
 * Save theme preference to localStorage
 * @param settingsKey - Portal's settings key
 * @param theme - Theme mode to save
 */
export function saveTheme(settingsKey: string, theme: ThemeMode): void {
  try {
    const key = `${settingsKey}:theme`;
    localStorage.setItem(key, theme);
  } catch (error) {
    console.error('localStorage.setItem failed for theme:', error);
    // Fail silently - theme will only be in-memory
  }
}

/**
 * Load brand color from localStorage
 * @param settingsKey - Portal's settings key
 * @returns HSL color string if found, null otherwise
 */
export function loadBrandColor(settingsKey: string): string | null {
  try {
    const key = `${settingsKey}:brand-color`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('localStorage.getItem failed for brand color:', error);
    return null;
  }
}

/**
 * Save brand color to localStorage
 * @param settingsKey - Portal's settings key
 * @param color - HSL color string to save
 */
export function saveBrandColor(settingsKey: string, color: string): void {
  try {
    const key = `${settingsKey}:brand-color`;
    localStorage.setItem(key, color);
  } catch (error) {
    console.error('localStorage.setItem failed for brand color:', error);
    // Fail silently - color will only be in-memory
  }
}

/**
 * Remove brand color from localStorage
 * @param settingsKey - Portal's settings key
 */
export function removeBrandColor(settingsKey: string): void {
  try {
    const key = `${settingsKey}:brand-color`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('localStorage.removeItem failed for brand color:', error);
  }
}
