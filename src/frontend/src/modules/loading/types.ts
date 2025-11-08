/**
 * Loading Module Types
 *
 * Types for skeleton loading, spinners, and loading overlays.
 */

/**
 * Skeleton variant types
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

/**
 * Skeleton animation types
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

/**
 * Spinner size presets
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spinner variant types
 */
export type SpinnerVariant = 'default' | 'primary' | 'secondary' | 'accent';

/**
 * Loading overlay position
 */
export type OverlayPosition = 'fullscreen' | 'container';

/**
 * Skeleton configuration
 */
export interface SkeletonConfig {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  count?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Spinner configuration
 */
export interface SpinnerConfig {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

/**
 * Loading overlay configuration
 */
export interface LoadingOverlayConfig {
  position?: OverlayPosition;
  spinner?: SpinnerConfig;
  message?: string;
  backdrop?: boolean;
  transparent?: boolean;
  className?: string;
}

/**
 * Loading state hook return type
 */
export interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

/**
 * Module configuration
 */
export interface LoadingModuleConfig {
  defaultSkeletonAnimation?: SkeletonAnimation;
  defaultSpinnerSize?: SpinnerSize;
  defaultSpinnerVariant?: SpinnerVariant;
  showLabels?: boolean;
}
