/**
 * useJourney Hook
 *
 * Hook para gerenciamento de jornadas e progresso.
 *
 * SPEC Compliance:
 * - SPEC-JOURNEY-P-*: Progress tracking
 * - SPEC-JOURNEY-N-*: Navigation
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type {
  JourneyConfig,
  JourneyProgress,
  StepWithStatus
} from '../types';

const DEFAULT_CONFIG: Partial<JourneyConfig> = {
  autoStart: false,
  allowSkip: true,
  autoNavigate: false,
  storageSchema: 'platform',
  completionCelebration: true,
  floatingGuide: {
    position: 'bottom-right',
    showProgress: true,
    collapsible: false
  }
};

/**
 * Load progress from localStorage (placeholder for JQEL)
 * SPEC-JOURNEY-P-001 to P-004
 */
function loadProgress(userId: string, journeyId: string): JourneyProgress {
  const key = `journey:${userId}:${journeyId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load journey progress:', e);
    }
  }

  return {
    userId,
    journeyId,
    completedSteps: [],
    lastAccessedAt: new Date().toISOString()
  };
}

/**
 * Save progress to localStorage (placeholder for JQEL)
 */
function saveProgress(progress: JourneyProgress): void {
  const key = `journey:${progress.userId}:${progress.journeyId}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

/**
 * useJourney Hook
 */
export function useJourney(
  config: JourneyConfig,
  userId: string = 'default-user'
) {
  const location = useLocation();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  const currentJourney = fullConfig.journeys?.[0]; // Use first journey for simplicity
  const [progress, setProgress] = useState<JourneyProgress>(() =>
    currentJourney ? loadProgress(userId, currentJourney.journeyId) : {
      userId,
      journeyId: '',
      completedSteps: [],
      lastAccessedAt: new Date().toISOString()
    }
  );

  // Load progress on mount
  useEffect(() => {
    if (currentJourney) {
      const loaded = loadProgress(userId, currentJourney.journeyId);
      setProgress(loaded);
    }
  }, [currentJourney, userId]);

  // Get all steps with status (SPEC-JOURNEY-C-007)
  const stepsWithStatus = useMemo<StepWithStatus[]>(() => {
    if (!currentJourney) return [];

    const allSteps: StepWithStatus[] = [];
    let foundCurrent = false;

    currentJourney.sections.forEach(section => {
      section.steps.forEach(step => {
        const isCompleted = progress.completedSteps.includes(step.stepId);
        const isCurrent = !foundCurrent && !isCompleted;

        allSteps.push({
          ...step,
          sectionId: section.sectionId,
          status: isCompleted ? 'completed' : isCurrent ? 'active' : 'pending'
        });

        if (isCurrent) foundCurrent = true;
      });
    });

    return allSteps;
  }, [currentJourney, progress.completedSteps]);

  // Calculate progress (SPEC-JOURNEY-P-010, P-011)
  const totalSteps = stepsWithStatus.length;
  const completedCount = progress.completedSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isComplete = completedCount === totalSteps && totalSteps > 0;

  // Get current step
  const currentStep = stepsWithStatus.find(s => s.status === 'active');

  // Mark step as complete (SPEC-JOURNEY-P-005 to P-009)
  const completeStep = (stepId: string) => {
    if (progress.completedSteps.includes(stepId)) return;

    const newProgress: JourneyProgress = {
      ...progress,
      completedSteps: [...progress.completedSteps, stepId],
      currentStep: stepId,
      lastAccessedAt: new Date().toISOString(),
      completedAt: isComplete ? new Date().toISOString() : undefined
    };

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Unmark step (SPEC-JOURNEY-P-009)
  const uncompleteStep = (stepId: string) => {
    const newProgress: JourneyProgress = {
      ...progress,
      completedSteps: progress.completedSteps.filter(id => id !== stepId),
      lastAccessedAt: new Date().toISOString(),
      completedAt: undefined
    };

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Auto-complete based on current page (SPEC-JOURNEY-P-005)
  useEffect(() => {
    if (!currentStep || !currentStep.target) return;

    if (currentStep.type === 'page' && location.pathname === currentStep.target) {
      if (currentStep.autoComplete) {
        completeStep(currentStep.stepId);
      }
    }
  }, [currentStep, location.pathname]);

  return {
    journey: currentJourney,
    progress,
    stepsWithStatus,
    currentStep,
    totalSteps,
    completedCount,
    progressPercent,
    isComplete,
    completeStep,
    uncompleteStep,
    config: fullConfig
  };
}
