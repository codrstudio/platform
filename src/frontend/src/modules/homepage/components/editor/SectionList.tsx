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
  /**
   * Handle delete with confirmation
   */
  const handleDelete = (index: number, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent selection

    const section = sections[index]
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a seção "${getSectionTitle(section)}"?`
    )

    if (confirmed) {
      onDelete(index)
    }
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
    <div className="space-y-2">
      {sections.map((section, index) => {
        const isSelected = selectedIndex === index
        const isDisabled = section.enabled === false

        return (
          <Card
            key={section.id || index}
            className={cn(
              'p-3 cursor-pointer transition-all hover:border-primary/50',
              isSelected && 'border-primary bg-primary/5',
              isDisabled && 'opacity-50'
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
  )
}
