/**
 * PreviewCard Component
 *
 * Individual theme preview card showing UI elements in either light or dark mode.
 * Displays representative UI patterns with applied palette in isolated scope.
 *
 * Based on Task 2.2.5 plan
 */

import { Sun, Moon, Check, AlertCircle, Info } from 'lucide-react';

interface PreviewCardProps {
  theme: 'light' | 'dark';
  palette: Record<string, string>;
  className?: string;
}

export function PreviewCard({ theme, palette, className = '' }: PreviewCardProps) {
  // Convert palette to CSS custom properties object
  const paletteStyles = Object.entries(palette).reduce((acc, [key, value]) => {
    acc[`--${key}` as any] = value;
    return acc;
  }, {} as Record<string, string>);

  const ThemeIcon = theme === 'light' ? Sun : Moon;
  const themeName = theme === 'light' ? 'Light Theme' : 'Dark Theme';

  return (
    <div
      className={`rounded-lg border bg-background p-6 ${theme === 'dark' ? 'dark' : ''} ${className}`}
      style={paletteStyles}
      aria-label={`${themeName} preview`}
    >
      {/* Theme Header */}
      <div className="mb-4 flex items-center gap-2 border-b pb-3">
        <ThemeIcon className="h-5 w-5 text-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{themeName}</h3>
      </div>

      {/* Preview Content */}
      <div className="space-y-4">
        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Heading 1</h1>
          <h2 className="text-xl font-semibold text-foreground">Heading 2</h2>
        </div>

        {/* Body Text */}
        <p className="text-base text-foreground">
          This is body text showing how the theme looks with your chosen brand color.
          The text should be clearly readable with good contrast.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Primary Button
          </button>
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Secondary Button
          </button>
        </div>

        {/* Card Component */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 font-semibold text-card-foreground">Card Component</h3>
          <p className="text-sm text-muted-foreground">
            With some content inside to show card styling and text hierarchy.
          </p>
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Input field example"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          readOnly
        />

        {/* Semantic Colors */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>Success message</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span>Warning message</span>
          </div>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>Error message</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span>Info message</span>
          </div>
        </div>
      </div>
    </div>
  );
}
