/**
 * useTheme Hook
 *
 * Access theme context from components.
 *
 * References:
 * - SPEC-theming.md (SPEC-TH-AP-020)
 */

import { useContext } from 'react';
import { ThemeContext } from '@/providers/ThemeProvider';

/**
 * Hook to access theme context
 * SPEC-TH-AP-020: useTheme() hook for components
 *
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
