/**
 * CompositionEditorLayout Component
 * DESIGN Reference: DES-UI-001
 *
 * Provides the ResizablePanel layout structure for the composition editor,
 * following the pattern from LoginBrandingEditor.
 */

import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { cn } from '@/lib/utils';

interface CompositionEditorLayoutProps {
  /** Content for the preview panel (left side) */
  previewContent: React.ReactNode;

  /** Content for the controls panel (right side) */
  controlsContent: React.ReactNode;

  /** Optional header content */
  headerContent?: React.ReactNode;

  /** Optional footer content */
  footerContent?: React.ReactNode;

  /** Class name for the container */
  className?: string;

  /** Default size for preview panel (default: 60) */
  defaultPreviewSize?: number;

  /** Minimum size for preview panel (default: 40) */
  minPreviewSize?: number;

  /** Maximum size for preview panel (default: 80) */
  maxPreviewSize?: number;

  /** Minimum size for controls panel (default: 30) */
  minControlsSize?: number;
}

/**
 * Layout container with resizable panels for composition editor
 *
 * Implements a 60/40 split layout similar to LoginBrandingEditor
 * with resizable panels for preview and controls.
 */
export function CompositionEditorLayout({
  previewContent,
  controlsContent,
  headerContent,
  footerContent,
  className,
  defaultPreviewSize = 60,
  minPreviewSize = 40,
  maxPreviewSize = 80,
  minControlsSize = 30,
}: CompositionEditorLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      {headerContent && (
        <div className="border-b bg-background px-6 py-4">{headerContent}</div>
      )}

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* Preview Panel (Left) - 60% default */}
          <ResizablePanel
            defaultSize={defaultPreviewSize}
            minSize={minPreviewSize}
            maxSize={maxPreviewSize}
            className="bg-muted/10"
          >
            <div className="h-full overflow-auto p-6">
              {previewContent}
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle className="bg-border" />

          {/* Controls Panel (Right) - 40% default */}
          <ResizablePanel
            defaultSize={100 - defaultPreviewSize}
            minSize={minControlsSize}
            className="bg-background"
          >
            <div className="h-full overflow-auto">
              {controlsContent}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer */}
      {footerContent && (
        <div className="border-t bg-background px-6 py-4">
          {footerContent}
        </div>
      )}
    </div>
  );
}

/**
 * Preview panel wrapper with consistent styling
 */
export function PreviewPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Preview</h3>
        <span className="text-xs text-muted-foreground">
          Click elements to edit
        </span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Controls panel wrapper with consistent styling
 */
export function ControlsPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Configuration</h3>
        {children}
      </div>
    </div>
  );
}