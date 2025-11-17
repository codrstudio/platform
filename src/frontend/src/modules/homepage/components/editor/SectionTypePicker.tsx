/**
 * Section Type Picker Component
 *
 * Modal/Dialog for selecting a section type when adding new sections.
 * Displays visual grid of available section types with icons and descriptions.
 *
 * Features:
 * - Grid layout with section type cards
 * - Icons and descriptions for each type
 * - Click to select and close
 * - Cancel option
 *
 * @module homepage/components/editor
 */

import { type SectionConfig } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import {
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

export interface SectionTypePickerProps {
  /** Whether the dialog is open */
  open: boolean

  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void

  /** Callback when a section type is selected */
  onSelect: (type: SectionConfig['type']) => void
}

/**
 * Section type definition
 */
interface SectionTypeDefinition {
  type: SectionConfig['type']
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Available section types
 */
const SECTION_TYPES: SectionTypeDefinition[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Seção de boas-vindas com título, subtítulo e CTAs',
    icon: Layout,
  },
  {
    type: 'cards',
    label: 'Cards',
    description: 'Grade de cards com ícones, títulos e descrições',
    icon: Grid3x3,
  },
  {
    type: 'quickLinks',
    label: 'Links Rápidos',
    description: 'Lista de links úteis para navegação rápida',
    icon: LinkIcon,
  },
  {
    type: 'stats',
    label: 'Estatísticas',
    description: 'Exibição de números e métricas importantes',
    icon: BarChart3,
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Perguntas frequentes em formato accordion',
    icon: HelpCircle,
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    description: 'Formulário de inscrição para newsletter',
    icon: Mail,
  },
  {
    type: 'footer',
    label: 'Rodapé',
    description: 'Rodapé com links, informações e redes sociais',
    icon: FooterIcon,
  },
  {
    type: 'cta',
    label: 'CTA',
    description: 'Call-to-Action destacado para conversão',
    icon: Zap,
  },
]

/**
 * SectionTypePicker Component
 *
 * Dialog for selecting section type.
 */
export function SectionTypePicker({ open, onOpenChange, onSelect }: SectionTypePickerProps) {
  /**
   * Handle section type selection
   */
  const handleSelect = (type: SectionConfig['type']) => {
    onSelect(type)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Seção</DialogTitle>
          <DialogDescription>
            Selecione o tipo de seção que deseja adicionar à página
          </DialogDescription>
        </DialogHeader>

        {/* Section Type Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {SECTION_TYPES.map((sectionType) => {
            const Icon = sectionType.icon

            return (
              <Card
                key={sectionType.type}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary hover:bg-primary/5',
                  'hover:scale-105'
                )}
                onClick={() => handleSelect(sectionType.type)}
              >
                <CardContent className="p-4 text-center space-y-2">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="font-medium text-sm">{sectionType.label}</div>

                  {/* Description */}
                  <div className="text-xs text-muted-foreground leading-tight">
                    {sectionType.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
