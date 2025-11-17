/**
 * Live Preview Panel Component
 *
 * Displays live preview of homepage while editing.
 * Renders HomePage component with current editing config.
 *
 * Features:
 * - Real-time preview of changes
 * - Highlight selected section
 * - Responsive preview modes (desktop/tablet/mobile)
 * - Isolated rendering context
 *
 * @module homepage/components/editor
 */

import { useState } from 'react'
import type { HomepageConfig } from '../../types'
import { HomePage } from '../../pages/HomePage'
import { Button } from '@/components/ui/button'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LivePreviewPanelProps {
  /** Homepage configuration being edited */
  config: HomepageConfig

  /** Portal ID for context */
  portalId: string

  /** Index of section to highlight */
  highlightedSectionIndex: number | null
}

/**
 * Preview device modes
 */
type PreviewMode = 'desktop' | 'tablet' | 'mobile'

/**
 * LivePreviewPanel Component
 *
 * Renders live preview of homepage with device mode selection.
 */
export function LivePreviewPanel({
  config,
  portalId,
  highlightedSectionIndex,
}: LivePreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')

  /**
   * Get container width based on preview mode
   */
  const getPreviewWidth = (): string => {
    switch (previewMode) {
      case 'desktop':
        return 'w-full'
      case 'tablet':
        return 'max-w-[768px] mx-auto'
      case 'mobile':
        return 'max-w-[375px] mx-auto'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="border-b px-4 py-2 bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Preview</h3>

          {/* Device Mode Selector */}
          <div className="flex gap-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="h-7 w-7 p-0"
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
              className="h-7 w-7 p-0"
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="h-7 w-7 p-0"
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-muted/10 p-4">
        <div className={cn('transition-all duration-300', getPreviewWidth())}>
          {/* Preview Container with device frame simulation */}
          <div className="bg-background rounded-lg shadow-lg overflow-hidden">
            {/* Render HomePage with editing config */}
            <HomePage
              config={config}
              portalId={portalId}
              previewMode={true}
              highlightedSectionIndex={highlightedSectionIndex}
            />
          </div>

          {/* Preview Info */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Preview em modo {previewMode === 'desktop' ? 'Desktop' : previewMode === 'tablet' ? 'Tablet' : 'Mobile'}
          </div>
        </div>
      </div>
    </div>
  )
}
