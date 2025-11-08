/**
 * LoadingOverlay Component
 *
 * Full-screen or container-level loading overlay with spinner and message.
 *
 * SPEC Compliance: SPEC-LOAD-SP-*
 */

import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';
import type { LoadingOverlayConfig } from '../types';

export interface LoadingOverlayProps extends LoadingOverlayConfig {
  /**
   * Whether the overlay is visible
   */
  visible: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * LoadingOverlay component
 *
 * Usage:
 * ```tsx
 * // Fullscreen overlay
 * <LoadingOverlay visible={isLoading} message="Loading data..." />
 *
 * // Container overlay
 * <div className="relative">
 *   <LoadingOverlay
 *     visible={isLoading}
 *     position="container"
 *     message="Processing..."
 *   />
 *   <Content />
 * </div>
 *
 * // Transparent overlay
 * <LoadingOverlay visible={isLoading} transparent />
 * ```
 */
export function LoadingOverlay({
  visible,
  position = 'fullscreen',
  spinner = {},
  message,
  backdrop = true,
  transparent = false,
  className
}: LoadingOverlayProps) {
  if (!visible) return null;

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-4 z-50',
    {
      // Position
      'fixed inset-0': position === 'fullscreen',
      'absolute inset-0': position === 'container',
      // Backdrop
      'bg-background/80': backdrop && !transparent,
      'bg-background/50 backdrop-blur-sm': backdrop && transparent,
      'bg-transparent': !backdrop
    },
    className
  );

  return (
    <div className={containerClasses}>
      <Spinner
        size={spinner.size || 'lg'}
        variant={spinner.variant || 'primary'}
        label={spinner.label}
        showLabel={false}
      />
      {message && (
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Page loading overlay (fullscreen)
 */
export function PageLoader({
  message = 'Loading page...',
  visible = true
}: {
  message?: string;
  visible?: boolean;
}) {
  return (
    <LoadingOverlay
      visible={visible}
      position="fullscreen"
      message={message}
      backdrop
    />
  );
}

/**
 * Section loading overlay (container)
 */
export function SectionLoader({
  message,
  visible = true,
  className
}: {
  message?: string;
  visible?: boolean;
  className?: string;
}) {
  return (
    <LoadingOverlay
      visible={visible}
      position="container"
      message={message}
      backdrop
      transparent
      className={className}
    />
  );
}
