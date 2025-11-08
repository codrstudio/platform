/**
 * Loading Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-LOAD-SK-*: Skeleton loading states
 * - SPEC-LOAD-SP-*: Spinner indicators
 */

import { loadingManifest } from './manifest';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Hooks
export { useLoading } from './hooks/useLoading';

// Types
export type {
  SkeletonVariant,
  SkeletonAnimation,
  SpinnerSize,
  SpinnerVariant,
  OverlayPosition,
  SkeletonConfig,
  SpinnerConfig,
  LoadingOverlayConfig,
  LoadingState,
  LoadingModuleConfig
} from './types';

// Module Exports
export const loadingModule: ModuleExports = {
  manifest: loadingManifest
  // Note: Loading module is a component library - no routes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(loadingModule);
