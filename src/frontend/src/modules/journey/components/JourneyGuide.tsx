/**
 * JourneyGuide Component
 *
 * Floating guide button with progress indicator.
 *
 * SPEC Compliance:
 * - SPEC-JOURNEY-UI-001 to UI-005: Floating guide
 * - SPEC-JOURNEY-UI-010 to UI-017: Journey index
 */

import { useState } from 'react';
import { Map, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useJourney } from '../hooks/useJourney';
import type { JourneyConfig } from '../types';

export interface JourneyGuideProps {
  config: JourneyConfig;
  userId?: string;
}

/**
 * JourneyGuide component
 *
 * Usage:
 * ```tsx
 * <JourneyGuide config={journeyConfig} userId={currentUser.id} />
 * ```
 */
export function JourneyGuide({
  config,
  userId = 'default-user'
}: JourneyGuideProps) {
  const [indexOpen, setIndexOpen] = useState(false);

  const {
    journey,
    stepsWithStatus,
    totalSteps,
    completedCount,
    progressPercent,
    isComplete,
    completeStep,
    uncompleteStep,
    config: fullConfig
  } = useJourney(config, userId);

  if (!journey) return null;

  const position = fullConfig.floatingGuide?.position || 'bottom-right';

  // Group steps by section
  const sections = journey.sections.map(section => ({
    ...section,
    steps: stepsWithStatus.filter(s => s.sectionId === section.sectionId),
    completedCount: stepsWithStatus.filter(
      s => s.sectionId === section.sectionId && s.status === 'completed'
    ).length
  }));

  return (
    <>
      {/* Floating button (SPEC-JOURNEY-UI-001 to UI-005) */}
      <Button
        className={cn(
          'fixed z-50 rounded-full shadow-lg',
          position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
        )}
        onClick={() => setIndexOpen(true)}
      >
        <Map className="h-4 w-4 mr-2" />
        <span className="font-medium">
          {completedCount} de {totalSteps}
        </span>
        {!isComplete && (
          <span className="ml-2 text-xs opacity-75">
            ({progressPercent}%)
          </span>
        )}
      </Button>

      {/* Journey Index Modal (SPEC-JOURNEY-UI-010 to UI-017) */}
      <Dialog open={indexOpen} onOpenChange={setIndexOpen}>
        <DialogContent className="max-w-2xl max-h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>{journey.title}</DialogTitle>
            {journey.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {journey.description}
              </p>
            )}
          </DialogHeader>

          {/* Progress summary */}
          <div className="py-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {completedCount} de {totalSteps} etapas concluídas
              </span>
              <span className="text-sm text-muted-foreground">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Sections and steps */}
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {sections.map((section) => (
              <div key={section.sectionId}>
                {/* Section header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{section.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {section.completedCount}/{section.steps.length}
                  </span>
                </div>

                {/* Section steps */}
                <div className="space-y-2 ml-4">
                  {section.steps.map((step) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';

                    return (
                      <div
                        key={step.stepId}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg transition-colors',
                          'hover:bg-accent cursor-pointer',
                          isActive && 'bg-accent'
                        )}
                        onClick={() => {
                          if (isCompleted) {
                            uncompleteStep(step.stepId);
                          } else {
                            completeStep(step.stepId);
                          }
                        }}
                      >
                        {/* Status icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Step info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{step.title}</div>
                          {step.description && (
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {step.description}
                            </div>
                          )}
                          {isActive && (
                            <div className="text-xs text-primary mt-1 flex items-center gap-1">
                              <ChevronRight className="h-3 w-3" />
                              você está aqui
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Completion message */}
          {isComplete && journey.completionCTA && (
            <div className="pt-4 border-t">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-600">
                    🎉 Parabéns!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você concluiu todas as etapas da jornada
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (journey.completionCTA?.action === 'navigate' && journey.completionCTA.target) {
                      window.location.href = journey.completionCTA.target;
                    }
                    setIndexOpen(false);
                  }}
                >
                  {journey.completionCTA.text}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
