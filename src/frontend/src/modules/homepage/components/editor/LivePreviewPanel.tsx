/**
 * Live Preview Panel Component
 *
 * Displays live preview of homepage sections while editing.
 * Renders sections directly from config (não usa HomePage).
 *
 * Features:
 * - Real-time preview of changes
 * - Click on sections to select them
 * - Responsive preview modes (desktop/tablet/mobile)
 * - Isolated rendering per section
 *
 * @module homepage/components/editor
 */

import { useState, useEffect, useRef } from 'react'
import type { HomepageConfig } from '../../types'
import { PreviewSection } from './PreviewSection'
import { Button } from '@/components/ui/button'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LivePreviewPanelProps {
  /** Homepage configuration being edited */
  config: HomepageConfig

  /** Portal ID for context */
  portalId: string

  /** Index of selected section */
  selectedSectionIndex: number | null

  /** Callback when section is selected */
  onSelectSection: (index: number | null) => void
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
  selectedSectionIndex,
  onSelectSection,
}: LivePreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const previewContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll to selected section when selection changes
   */
  useEffect(() => {
    if (selectedSectionIndex !== null && previewContainerRef.current) {
      // Encontrar o elemento da seção no preview
      const sectionElement = previewContainerRef.current.querySelector(
        `[data-section-index="${selectedSectionIndex}"]`
      )

      if (sectionElement) {
        // Scroll suave para a seção
        sectionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [selectedSectionIndex])

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

  /**
   * Handle section click
   */
  const handleSectionClick = (index: number) => {
    // Toggle selection: if already selected, deselect
    if (selectedSectionIndex === index) {
      onSelectSection(null)
    } else {
      onSelectSection(index)
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
      <div className="flex-1 overflow-y-auto bg-muted/10 p-4" ref={previewContainerRef}>
        <div className={cn('transition-all duration-300', getPreviewWidth())}>
          {/* Preview Container with device frame simulation */}
          <div className="bg-background rounded-lg shadow-lg overflow-hidden">
            {/* Render sections directly from config */}
            {config.sections && config.sections.length > 0 ? (
              config.sections.map((section, index) => (
                <PreviewSection
                  key={`preview-section-${index}-${section.id || section.type}`}
                  section={section}
                  index={index}
                  isSelected={selectedSectionIndex === index}
                  onSelect={() => handleSectionClick(index)}
                  portalId={portalId}
                  instanceId="default"
                />
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma seção adicionada ainda.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Clique no botão "+" para adicionar sua primeira seção.
                </p>
              </div>
            )}
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
