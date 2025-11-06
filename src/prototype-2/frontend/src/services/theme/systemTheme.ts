/**
 * System theme detection utilities
 * Based on SPEC-theming.md SPEC-TH-LD-016:018
 */

/**
 * Detect current system theme preference
 *
 * @returns 'dark' if system prefers dark, 'light' otherwise
 */
export function detectSystemTheme(): 'light' | 'dark' {
  // Check if matchMedia is supported
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'; // Default fallback
  }

  try {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return darkModeQuery.matches ? 'dark' : 'light';
  } catch (error) {
    console.error('Failed to detect system theme:', error);
    return 'light';
  }
}

/**
 * Watch for system theme changes
 * Returns cleanup function to stop watching
 *
 * @param callback - Called when system theme changes
 * @returns Cleanup function
 */
export function watchSystemTheme(
  callback: (theme: 'light' | 'dark') => void
): () => void {
  // Guard for SSR
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // No-op cleanup
  }

  try {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler for change event
    const handler = (event: MediaQueryListEvent) => {
      callback(event.matches ? 'dark' : 'light');
    };

    // Modern API (addEventListener)
    darkModeQuery.addEventListener('change', handler);

    // Cleanup function
    return () => {
      darkModeQuery.removeEventListener('change', handler);
    };
  } catch (error) {
    console.error('Failed to watch system theme:', error);
    return () => {};
  }
}
