/**
 * ThemeToggle - UI component for theme switching
 * Based on SPEC-theming.md SPEC-TH-AP-007:011
 */

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import type { ThemeMode } from '../../types/theme';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: typeof Sun;
}

const options: ThemeOption[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

/**
 * Simple button-based theme toggle
 * Cycles through light → dark → system
 */
export function ThemeToggleButton() {
  const { rawTheme, setTheme } = useTheme();

  const handleToggle = () => {
    // Cycle through modes
    const currentIndex = options.findIndex(opt => opt.mode === rawTheme);
    const nextIndex = (currentIndex + 1) % options.length;
    setTheme(options[nextIndex].mode);
  };

  const current = options.find(opt => opt.mode === rawTheme) || options[0];
  const Icon = current.icon;

  return (
    <button
      onClick={handleToggle}
      className="rounded-md p-2 hover:bg-accent transition-colors"
      aria-label={`Current theme: ${current.label}. Click to cycle.`}
      title={`Theme: ${current.label}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/**
 * Dropdown-based theme selector
 * Shows all options with current selection
 */
export function ThemeToggleDropdown() {
  const { rawTheme, setTheme } = useTheme();

  return (
    <div className="relative inline-block">
      <select
        value={rawTheme}
        onChange={(e) => setTheme(e.target.value as ThemeMode)}
        className="
          rounded-md border border-input bg-background px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-ring
          cursor-pointer
        "
        aria-label="Select theme"
      >
        {options.map(({ mode, label }) => (
          <option key={mode} value={mode}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Default export - simple button toggle
 */
export default ThemeToggleButton;
