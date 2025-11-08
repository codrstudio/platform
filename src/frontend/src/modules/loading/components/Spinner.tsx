/**
 * Spinner Component
 *
 * Circular loading indicator in various sizes and styles.
 * Based on Lucide React Loader2 icon.
 *
 * SPEC Compliance: SPEC-LOAD-SP-*
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpinnerConfig } from '../types';

export interface SpinnerProps extends SpinnerConfig {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Spinner component for loading indicators
 *
 * Usage:
 * ```tsx
 * // Default spinner
 * <Spinner />
 *
 * // Small spinner
 * <Spinner size="sm" />
 *
 * // With label
 * <Spinner label="Loading..." showLabel />
 *
 * // Primary variant
 * <Spinner variant="primary" />
 * ```
 */
export function Spinner({
  size = 'md',
  variant = 'default',
  label = 'Loading',
  showLabel = false,
  className
}: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent'
  };

  const iconClasses = cn(
    'animate-spin',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className={iconClasses} />
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    );
  }

  return <Loader2 className={iconClasses} aria-label={label} />;
}

/**
 * Centered spinner with optional message
 */
export function SpinnerCentered({
  size = 'lg',
  variant = 'primary',
  label = 'Loading',
  showLabel = true,
  className
}: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      <Spinner size={size} variant={variant} />
      {showLabel && label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

/**
 * Inline spinner (for buttons, etc.)
 */
export function SpinnerInline({
  size = 'sm',
  variant = 'default',
  className
}: Omit<SpinnerProps, 'label' | 'showLabel'>) {
  return <Spinner size={size} variant={variant} className={className} />;
}
