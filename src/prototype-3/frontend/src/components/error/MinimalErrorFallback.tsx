/**
 * Minimal Error Fallback Component
 *
 * Ultra-compact error display for tight spaces (e.g., table cells, badges).
 * Shows only an icon or a brief message.
 *
 * Implements:
 * - SPEC-error-handling.md (minimal error indication)
 */

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export interface MinimalErrorFallbackProps {
  /**
   * Error to display
   */
  error: Error;
  /**
   * Display mode
   */
  mode?: 'icon' | 'text' | 'both';
  /**
   * Custom message
   */
  message?: string;
  /**
   * Show tooltip on hover
   */
  showTooltip?: boolean;
}

/**
 * Minimal Error Fallback
 *
 * Used in constrained spaces where a full error display is not appropriate.
 */
export function MinimalErrorFallback({
  error,
  mode = 'both',
  message,
  showTooltip = true,
}: MinimalErrorFallbackProps): ReactNode {
  const displayMessage = message || 'Error';
  const tooltipText = error.message || 'An error occurred';

  const content = (
    <div className="inline-flex items-center gap-1 text-red-600">
      {(mode === 'icon' || mode === 'both') && <AlertCircle className="h-4 w-4" />}
      {(mode === 'text' || mode === 'both') && (
        <span className="text-xs font-medium">{displayMessage}</span>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <div title={tooltipText} className="cursor-help">
        {content}
      </div>
    );
  }

  return content;
}
