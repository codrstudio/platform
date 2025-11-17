/**
 * Editor Panel Router Component
 *
 * Routes to appropriate section form based on section type.
 * Acts as a central dispatcher for section-specific editors.
 *
 * Architecture:
 * - Receives section config
 * - Determines section type
 * - Renders corresponding form component
 * - Passes update callback to child forms
 *
 * Section Forms (Phase 4):
 * - HeroSectionForm
 * - CardsSectionForm
 * - QuickLinksSectionForm
 * - StatsSectionForm
 * - FAQSectionForm
 * - NewsletterSectionForm
 * - FooterSectionForm
 *
 * @module homepage/components/editor
 */

import type { SectionConfig } from '../../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { SectionTypeSelector } from './SectionTypeSelector'

// Section form imports (Phase 4)
import { HeroSectionForm } from './forms/HeroSectionForm'
import { CardsSectionForm } from './forms/CardsSectionForm'
import { QuickLinksSectionForm } from './forms/QuickLinksSectionForm'
import { StatsSectionForm } from './forms/StatsSectionForm'
import { FAQSectionForm } from './forms/FAQSectionForm'
import { NewsletterSectionForm } from './forms/NewsletterSectionForm'
import { FooterSectionForm } from './forms/FooterSectionForm'

export interface EditorPanelRouterProps {
  /** Section being edited */
  section: SectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: SectionConfig) => void
}

/**
 * Placeholder form component for sections not yet implemented
 */
function PlaceholderForm({ section, onUpdate }: EditorPanelRouterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Seção - {section.type}</CardTitle>
        <CardDescription>
          Formulário para edição de seção do tipo "{section.type}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            O formulário de edição para este tipo de seção será implementado em breve.
            Por enquanto, você pode editar a configuração manualmente via JSON.
          </AlertDescription>
        </Alert>

        {/* Debug: Show current section config */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium mb-2">
            Ver configuração atual (JSON)
          </summary>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(section, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}

/**
 * EditorPanelRouter Component
 *
 * Routes to appropriate section editor based on type.
 */
export function EditorPanelRouter({ section, onUpdate }: EditorPanelRouterProps) {
  /**
   * Handle section type change
   */
  const handleTypeChange = (newType: SectionConfig['type']) => {
    // Create a new section with the new type, preserving common fields
    const baseFields = {
      id: section.id,
      enabled: section.enabled,
    }

    // Create default config for new type
    const defaultSection = createDefaultSectionForType(newType, baseFields)

    // Call onUpdate with the new section
    onUpdate(defaultSection)
  }

  // Render type selector and form
  const formContent = (() => {
    // Route to appropriate form based on section type
    switch (section.type) {
    case 'hero':
      return <HeroSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'cards':
    case 'features':
      return <CardsSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'quickLinks':
      return <QuickLinksSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'stats':
      return <StatsSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'faq':
      return <FAQSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'newsletter':
      return <NewsletterSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'footer':
      return <FooterSectionForm section={section as any} onUpdate={onUpdate as any} />

    case 'cta':
      return <PlaceholderForm section={section} onUpdate={onUpdate} />

    default:
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tipo de seção desconhecido: "{(section as any).type}"
          </AlertDescription>
        </Alert>
      )
    }
  })()

  return (
    <div className="space-y-6">
      {/* Section Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Seção</CardTitle>
          <CardDescription>
            Altere o tipo da seção para converter entre diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionTypeSelector value={section.type} onChange={handleTypeChange} />
        </CardContent>
      </Card>

      {/* Section-specific form */}
      {formContent}
    </div>
  )
}

/**
 * Create default section config for a given type
 */
function createDefaultSectionForType(
  type: SectionConfig['type'],
  baseFields: { id: string; enabled?: boolean }
): SectionConfig {
  const base = {
    id: baseFields.id,
    enabled: baseFields.enabled ?? true,
  }

  switch (type) {
    case 'hero':
      return {
        ...base,
        type: 'hero',
        title: 'Título da Seção',
        subtitle: 'Subtítulo',
        cta: [],
      } as SectionConfig

    case 'cards':
      return {
        ...base,
        type: 'cards',
        title: 'Cards',
        cards: [],
      } as SectionConfig

    case 'quickLinks':
      return {
        ...base,
        type: 'quickLinks',
        title: 'Links Rápidos',
        links: [],
      } as SectionConfig

    case 'stats':
      return {
        ...base,
        type: 'stats',
        stats: [],
      } as SectionConfig

    case 'faq':
      return {
        ...base,
        type: 'faq',
        title: 'FAQ',
        items: [],
      } as SectionConfig

    case 'newsletter':
      return {
        ...base,
        type: 'newsletter',
        title: 'Newsletter',
        subtitle: 'Inscreva-se para receber novidades',
      } as SectionConfig

    case 'footer':
      return {
        ...base,
        type: 'footer',
        columns: [],
      } as SectionConfig

    case 'cta':
      return {
        ...base,
        type: 'cta',
        title: 'Call to Action',
      } as SectionConfig

    default:
      return {
        ...base,
        type: 'hero',
        title: 'Nova Seção',
      } as SectionConfig
  }
}
