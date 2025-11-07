/**
 * Journey Module Types
 *
 * SPEC Compliance:
 * - SPEC-JOURNEY-C-*: Core concepts
 * - SPEC-JOURNEY-D-*: Data structures
 * - SPEC-JOURNEY-P-*: Progress tracking
 */

/**
 * Step type
 * SPEC-JOURNEY-D-003
 */
export type StepType = 'page' | 'action';

/**
 * Step status
 * SPEC-JOURNEY-C-007
 */
export type StepStatus = 'pending' | 'active' | 'completed';

/**
 * Completion CTA action
 * SPEC-JOURNEY-D-001
 */
export type CompletionAction = 'navigate' | 'external' | 'none';

/**
 * Step modal configuration
 * SPEC-JOURNEY-D-003
 */
export interface StepModal {
  title: string;
  content: string; // Markdown supported
  links?: Array<{
    text: string;
    url: string;
  }>;
}

/**
 * Journey step
 * SPEC-JOURNEY-D-003
 */
export interface JourneyStep {
  stepId: string;
  title: string;
  description?: string;
  type: StepType;
  target?: string; // URL or action identifier
  modal?: StepModal;
  autoComplete?: boolean;
}

/**
 * Journey section
 * SPEC-JOURNEY-D-002, SPEC-JOURNEY-C-008 to C-010
 */
export interface JourneySection {
  sectionId: string;
  title: string;
  steps: JourneyStep[];
}

/**
 * Completion CTA
 * SPEC-JOURNEY-D-001
 */
export interface CompletionCTA {
  text: string;
  action: CompletionAction;
  target?: string;
}

/**
 * Journey definition
 * SPEC-JOURNEY-D-001, SPEC-JOURNEY-C-001 to C-003
 */
export interface Journey {
  journeyId: string;
  title: string;
  description?: string;
  sections: JourneySection[];
  completionCTA?: CompletionCTA;
}

/**
 * Journey progress
 * SPEC-JOURNEY-P-004
 */
export interface JourneyProgress {
  userId: string;
  journeyId: string;
  completedSteps: string[]; // Array of stepIds
  currentStep?: string;
  completedAt?: string;
  lastAccessedAt: string;
}

/**
 * Floating guide position
 * SPEC-JOURNEY-C-003
 */
export type GuidePosition = 'bottom-left' | 'bottom-right';

/**
 * Floating guide configuration
 * SPEC-JOURNEY-C-003
 */
export interface FloatingGuideConfig {
  position: GuidePosition;
  showProgress: boolean;
  collapsible: boolean;
}

/**
 * Journey module configuration
 * SPEC-JOURNEY-C-001 to C-003
 */
export interface JourneyConfig {
  journeys: Journey[];
  defaultJourney?: string;
  autoStart?: boolean;
  allowSkip?: boolean;
  autoNavigate?: boolean;
  storageSchema?: string; // Default: 'platform'
  floatingGuide?: FloatingGuideConfig;
  completionCelebration?: boolean;
}

/**
 * Step with computed status
 */
export interface StepWithStatus extends JourneyStep {
  status: StepStatus;
  sectionId: string;
}
