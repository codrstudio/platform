/**
 * Journey Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-JOURNEY-C-*: Core concepts
 * - SPEC-JOURNEY-UI-*: User interface components
 * - SPEC-JOURNEY-P-*: Progress tracking
 */

import { journeyManifest } from './manifest';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Hooks
export { useJourney } from './hooks/useJourney';

// Types
export type {
  StepType,
  StepStatus,
  CompletionAction,
  StepModal,
  JourneyStep,
  JourneySection,
  CompletionCTA,
  Journey,
  JourneyProgress,
  GuidePosition,
  FloatingGuideConfig,
  JourneyConfig,
  StepWithStatus
} from './types';

// Module Exports
export const journeyModule: ModuleExports = {
  manifest: journeyManifest
  // Note: Journey does not provide routes - it's a floating component
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(journeyModule);
