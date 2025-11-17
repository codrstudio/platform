/**
 * Section Type Selector Component
 *
 * Dropdown/Select for changing the type of an existing section.
 * Used in section forms to allow users to convert sections between types.
 *
 * Features:
 * - Select dropdown with all available section types
 * - Icons and labels for each type
 * - Confirmation dialog when changing type (to prevent accidental data loss)
 *
 * @module homepage/components/editor
 */

import { type SectionConfig } from '../../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

export interface SectionTypeSelectorProps {
  /** Current section type */
  value: SectionConfig['type']

  /** Callback when type changes */
  onChange: (newType: SectionConfig['type']) => void

  /** Optional label override */
  label?: string

  /** Whether to show confirmation dialog on change */
  requireConfirmation?: boolean
}

/**
 * Section type definition
 */
interface SectionTypeDefinition {
  value: SectionConfig['type']
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Available section types
 */
const SECTION_TYPES: SectionTypeDefinition[] = [
  { value: 'hero', label: 'Hero', icon: Layout },
  { value: 'cards', label: 'Cards', icon: Grid3x3 },
  { value: 'quickLinks', label: 'Links Rápidos', icon: LinkIcon },
  { value: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { value: 'faq', label: 'FAQ', icon: HelpCircle },
  { value: 'newsletter', label: 'Newsletter', icon: Mail },
  { value: 'footer', label: 'Rodapé', icon: FooterIcon },
  { value: 'cta', label: 'CTA', icon: Zap },
]

/**
 * SectionTypeSelector Component
 *
 * Select dropdown for changing section type.
 */
export function SectionTypeSelector({
  value,
  onChange,
  label = 'Tipo de Seção',
  requireConfirmation = true,
}: SectionTypeSelectorProps) {
  const [pendingType, setPendingType] = useState<SectionConfig['type'] | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  /**
   * Handle type selection
   */
  const handleValueChange = (newType: string) => {
    const typedValue = newType as SectionConfig['type']

    if (typedValue === value) {
      return // No change
    }

    if (requireConfirmation) {
      setPendingType(typedValue)
      setShowConfirmation(true)
    } else {
      onChange(typedValue)
    }
  }

  /**
   * Confirm type change
   */
  const handleConfirm = () => {
    if (pendingType) {
      onChange(pendingType)
    }
    setShowConfirmation(false)
    setPendingType(null)
  }

  /**
   * Cancel type change
   */
  const handleCancel = () => {
    setShowConfirmation(false)
    setPendingType(null)
  }

  const currentType = SECTION_TYPES.find((t) => t.value === value)

  return (
    <>
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue>
              {currentType && (
                <div className="flex items-center gap-2">
                  <currentType.icon className="w-4 h-4" />
                  <span>{currentType.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Alterar o tipo pode resultar em perda de dados específicos do tipo anterior.
        </p>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de tipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a alterar o tipo desta seção. Isso pode resultar em perda de dados
              específicos do tipo atual. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
