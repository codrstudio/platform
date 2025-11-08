/**
 * Skeleton Component
 *
 * Animated placeholder that mimics content layout during loading.
 * Based on shadcn/ui Skeleton component.
 *
 * SPEC Compliance: SPEC-LOAD-SK-*
 */

import { cn } from '@/lib/utils';
import type { SkeletonConfig } from '../types';

export interface SkeletonProps extends SkeletonConfig {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Skeleton component for loading placeholders
 *
 * Usage:
 * ```tsx
 * // Text skeleton
 * <Skeleton variant="text" width="200px" height="20px" />
 *
 * // Circular avatar skeleton
 * <Skeleton variant="circular" width="40px" height="40px" />
 *
 * // Rectangular image skeleton
 * <Skeleton variant="rectangular" width="100%" height="200px" />
 *
 * // Multiple skeletons
 * <Skeleton variant="text" count={3} />
 * ```
 */
export function Skeleton({
  variant = 'rectangular',
  animation = 'pulse',
  count = 1,
  width,
  height,
  className
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-muted',
    {
      // Animations
      'animate-pulse': animation === 'pulse',
      'animate-shimmer': animation === 'wave',
      // Variants
      'rounded-md': variant === 'rectangular' || variant === 'rounded',
      'rounded-full': variant === 'circular',
      'rounded-sm h-4': variant === 'text'
    },
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  // Render multiple skeletons
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={baseClasses} style={style} />
        ))}
      </div>
    );
  }

  // Render single skeleton
  return <div className={baseClasses} style={style} />;
}

/**
 * Preset skeleton layouts
 */
export const SkeletonPresets = {
  /**
   * Card skeleton with avatar, title, and description
   */
  Card: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height="16px" />
          <Skeleton variant="text" width="40%" height="12px" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height="200px" />
      <Skeleton variant="text" count={3} />
    </div>
  ),

  /**
   * List item skeleton
   */
  ListItem: () => (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width="32px" height="32px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" height="14px" />
        <Skeleton variant="text" width="50%" height="12px" />
      </div>
    </div>
  ),

  /**
   * Table row skeleton
   */
  TableRow: () => (
    <div className="flex items-center gap-4">
      <Skeleton variant="rectangular" width="40px" height="40px" />
      <Skeleton variant="text" width="150px" height="14px" />
      <Skeleton variant="text" width="100px" height="14px" />
      <Skeleton variant="text" width="80px" height="14px" />
      <Skeleton variant="text" width="120px" height="14px" />
    </div>
  ),

  /**
   * Form skeleton
   */
  Form: () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="100px" height="14px" />
          <Skeleton variant="rectangular" width="100%" height="40px" />
        </div>
      ))}
      <Skeleton variant="rectangular" width="120px" height="40px" />
    </div>
  )
};
