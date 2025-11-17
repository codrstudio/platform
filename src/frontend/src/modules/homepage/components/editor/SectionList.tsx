/**
 * Section List Component
 *
 * Displays list of homepage sections with selection and reordering.
 * Used in the left panel of HomepageVisualEditor.
 *
 * Features:
 * - Visual list of all sections
 * - Click to select/edit section
 * - Delete section button
 * - Drag-and-drop reordering (Phase 5)
 * - Section type icons and labels
 *
 * @module homepage/components/editor
 */

import { useState } from 'react'
import type { SectionConfig } from '../../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Trash2,
  GripVertical,
  Layout,
  Grid3x3,
  Link as LinkIcon,
  BarChart3,
  HelpCircle,
  Mail,
  PanelBottom as FooterIcon,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfirmDialog } from './useConfirmDialog'

export interface SectionListProps {
  /** Array of sections */
  sections: SectionConfig[]

  /** Index of currently selected section */
  selectedIndex: number | null

  /** Callback when section is selected */
  onSelectSection: (index: number) => void

  /** Callback when sections are reordered */
  onReorder: (reorderedSections: SectionConfig[]) => void

  /** Callback when section is deleted */
  onDelete: (index: number) => void
}

/**
 * Get icon component for section type
 */
function getSectionIcon(type: SectionConfig['type']) {
  const iconClass = 'w-4 h-4'

  switch (type) {
    case 'hero':
      return <Layout className={iconClass} />
    case 'cards':
    case 'features':
      return <Grid3x3 className={iconClass} />
    case 'quickLinks':
      return <LinkIcon className={iconClass} />
    case 'stats':
      return <BarChart3 className={iconClass} />
    case 'faq':
      return <HelpCircle className={iconClass} />
    case 'newsletter':
      return <Mail className={iconClass} />
    case 'footer':
      return <FooterIcon className={iconClass} />
    case 'cta':
      return <Zap className={iconClass} />
    default:
      return <Layout className={iconClass} />
  }
}

/**
 * Get display label for section type
 */
function getSectionLabel(type: SectionConfig['type']): string {
  switch (type) {
    case 'hero':
      return 'Hero'
    case 'cards':
      return 'Cards'
    case 'features':
      return 'Features'
    case 'quickLinks':
      return 'Links Rápidos'
    case 'stats':
      return 'Estatísticas'
    case 'faq':
      return 'FAQ'
    case 'newsletter':
      return 'Newsletter'
    case 'footer':
      return 'Rodapé'
    case 'cta':
      return 'CTA'
    default:
      return 'Seção'
  }
}

/**
 * Get section title for display
 */
function getSectionTitle(section: SectionConfig): string {
  // Try to get title from section
  if ('title' in section && section.title) {
    return section.title
  }

  // Fallback to type label
  return getSectionLabel(section.type)
}

/**
 * SectionList Component
 *
 * Displays vertical list of sections with selection state.
 */
export function SectionList({
  sections,
  selectedIndex,
  onSelectSection,
  onReorder,
  onDelete,
}: SectionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const { confirm, ConfirmDialog } = useConfirmDialog()

  /**
   * Handle delete with confirmation
   */
  const handleDelete = async (index: number, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent selection

    const section = sections[index]
    const confirmed = await confirm({
      title: 'Excluir seção',
      description: `Tem certeza que deseja excluir a seção "${getSectionTitle(section)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive',
    })

    if (confirmed) {
      onDelete(index)
    }
  }

  /**
   * Handle drag start
   */
  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', String(index))

    // Add ghost image effect
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  /**
   * Handle drag over
   */
  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  /**
   * Handle drag leave
   */
  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  /**
   * Handle drop
   */
  const handleDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder sections
    const newSections = [...sections]
    const [movedSection] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, movedSection)

    onReorder(newSections)

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  /**
   * Handle drag end
   */
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Empty state
  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        <div className="mb-2">Nenhuma seção ainda</div>
        <div className="text-xs">Clique em "+" para adicionar</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {sections.map((section, index) => {
          const isSelected = selectedIndex === index
          const isDisabled = section.enabled === false
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <Card
              key={section.id || index}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group p-3 cursor-pointer transition-all hover:border-primary/50',
                isSelected && 'border-primary bg-primary/5',
                isDisabled && 'opacity-50',
                isDragging && 'opacity-50 scale-95',
                isDragOver && 'border-primary border-2 scale-105'
              )}
              onClick={() => onSelectSection(index)}
            >
              <div className="flex items-start gap-2">
                {/* Drag Handle (Phase 5) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>

                {/* Section Icon */}
                <div className="mt-0.5 text-muted-foreground">
                  {getSectionIcon(section.type)}
                </div>

                {/* Section Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {getSectionTitle(section)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSectionLabel(section.type)}
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDelete(index, e)}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </>
  )
}
