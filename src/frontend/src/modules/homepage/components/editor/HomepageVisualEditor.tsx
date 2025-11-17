/**
 * Homepage Visual Editor
 *
 * Full-screen visual editor for homepage configuration.
 * Provides intuitive UI for managing sections, layout, and design.
 *
 * Architecture:
 * - Left Panel: Section list with drag-and-drop reordering
 * - Center Panel: Form editor for selected section
 * - Right Panel: Live preview of the homepage
 *
 * Data Flow:
 * - Loads external config via useExternalConfig hook
 * - Local state for editing (React.useState)
 * - Saves to external file via useSaveExternalConfig mutation
 * - Auto-invalidates queries for immediate UI updates
 *
 * @module homepage/components/editor
 */

import { useState, useEffect } from 'react'
import { useExternalConfigManager } from '@/hooks/useExternalConfig'
import type { HomepageConfig, SectionConfig } from '../../types'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { SectionList } from './SectionList'
import { LivePreviewPanel } from './LivePreviewPanel'
import { EditorPanelRouter } from './EditorPanelRouter'
import { EditorToolbar } from './EditorToolbar'
import { SectionTypePicker } from './SectionTypePicker'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'

export interface HomepageVisualEditorProps {
  /** Module ID (always "homepage") */
  moduleId: string

  /** Instance ID being edited */
  instanceId: string

  /** Portal ID context */
  portalId: string

  /** Callback when editor is closed */
  onClose: () => void
}

/**
 * Default empty homepage config
 */
const DEFAULT_CONFIG: HomepageConfig = {
  route: '/',
  sections: [],
  animations: {
    intensity: 'normal',
    enableAnimations: true,
  },
  integrations: {
    auth: {
      showLoginButton: false,
    },
  },
}

/**
 * HomepageVisualEditor Component
 *
 * Full-screen visual editor with three-panel layout:
 * - Section list (left)
 * - Editor panel (center)
 * - Live preview (right, toggleable)
 */
export function HomepageVisualEditor({
  moduleId,
  instanceId,
  portalId,
  onClose,
}: HomepageVisualEditorProps) {
  // Load external config
  const { config: savedConfig, isLoading, save } = useExternalConfigManager<HomepageConfig>(
    moduleId,
    instanceId
  )

  // Local editing state
  const [editingConfig, setEditingConfig] = useState<HomepageConfig>(DEFAULT_CONFIG)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showTypePicker, setShowTypePicker] = useState(false)

  // Initialize editing state when config loads
  useEffect(() => {
    if (savedConfig) {
      setEditingConfig(savedConfig)
      setHasUnsavedChanges(false)
    } else if (!isLoading) {
      // No config exists yet, use default
      setEditingConfig(DEFAULT_CONFIG)
      setHasUnsavedChanges(false)
    }
  }, [savedConfig, isLoading])

  // Track unsaved changes
  useEffect(() => {
    if (!isLoading && savedConfig) {
      const hasChanges = JSON.stringify(editingConfig) !== JSON.stringify(savedConfig)
      setHasUnsavedChanges(hasChanges)
    }
  }, [editingConfig, savedConfig, isLoading])

  /**
   * Update a specific section
   */
  const handleUpdateSection = (index: number, updatedSection: SectionConfig) => {
    setEditingConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) => (i === index ? updatedSection : section)),
    }))
  }

  /**
   * Delete a section
   */
  const handleDeleteSection = (index: number) => {
    setEditingConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }))

    // Clear selection if deleted section was selected
    if (selectedSectionIndex === index) {
      setSelectedSectionIndex(null)
    } else if (selectedSectionIndex !== null && selectedSectionIndex > index) {
      // Adjust selection if it was after deleted section
      setSelectedSectionIndex(selectedSectionIndex - 1)
    }
  }

  /**
   * Add a new section
   */
  const handleAddSection = (sectionType: SectionConfig['type']) => {
    const newSection: SectionConfig = createDefaultSection(sectionType)

    setEditingConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))

    // Select the newly added section
    setSelectedSectionIndex(editingConfig.sections.length)
  }

  /**
   * Reorder sections (drag and drop)
   */
  const handleReorderSections = (reorderedSections: SectionConfig[]) => {
    setEditingConfig((prev) => ({
      ...prev,
      sections: reorderedSections,
    }))

    // Adjust selection index if needed
    if (selectedSectionIndex !== null) {
      const selectedSection = editingConfig.sections[selectedSectionIndex]
      const newIndex = reorderedSections.findIndex((s) => s === selectedSection)
      setSelectedSectionIndex(newIndex >= 0 ? newIndex : null)
    }
  }

  /**
   * Save changes to external config file
   */
  const handleSave = async () => {
    try {
      await save.mutateAsync(editingConfig)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save homepage config:', error)
      alert('Falha ao salvar configuração. Veja o console para detalhes.')
    }
  }

  /**
   * Close editor with unsaved changes warning
   */
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair?'
      )
      if (!confirmed) return
    }

    onClose()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <div className="text-lg font-medium">Carregando editor...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Aguarde enquanto carregamos a configuração
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mt-4"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Toolbar */}
      <EditorToolbar
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={save.isPending}
        showPreview={showPreview}
        onSave={handleSave}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onClose={handleClose}
      />

      {/* Main Content - Three Panel Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Section List */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full overflow-y-auto bg-muted/30 border-r">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Seções</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTypePicker(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <SectionList
                sections={editingConfig.sections}
                selectedIndex={selectedSectionIndex}
                onSelectSection={setSelectedSectionIndex}
                onReorder={handleReorderSections}
                onDelete={handleDeleteSection}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel - Live Preview */}
        {showPreview && (
          <>
            <ResizablePanel defaultSize={50} minSize={30} maxSize={60}>
              <div className="h-full overflow-y-auto bg-muted/10">
                <LivePreviewPanel
                  config={editingConfig}
                  portalId={portalId}
                  highlightedSectionIndex={selectedSectionIndex}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />
          </>
        )}

        {/* Right Panel - Editor Configuration */}
        <ResizablePanel defaultSize={showPreview ? 30 : 80} minSize={25}>
          <div className="h-full overflow-y-auto">
            {selectedSectionIndex !== null && editingConfig.sections[selectedSectionIndex] ? (
              <div className="p-6">
                <EditorPanelRouter
                  section={editingConfig.sections[selectedSectionIndex]}
                  onUpdate={(updatedSection) =>
                    handleUpdateSection(selectedSectionIndex, updatedSection)
                  }
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center max-w-md">
                  <div className="text-lg font-medium mb-2">Nenhuma seção selecionada</div>
                  <p className="text-sm">
                    Selecione uma seção na lista à esquerda para editá-la, ou adicione uma nova
                    seção clicando no botão "+".
                  </p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Section Type Picker Dialog */}
      <SectionTypePicker
        open={showTypePicker}
        onOpenChange={setShowTypePicker}
        onSelect={handleAddSection}
      />
    </div>
  )
}

/**
 * Create default section config based on type
 */
function createDefaultSection(type: SectionConfig['type']): SectionConfig {
  const base = {
    id: `section-${Date.now()}`,
    enabled: true,
  }

  switch (type) {
    case 'hero':
      return {
        ...base,
        type: 'hero',
        title: 'Bem-vindo',
        subtitle: 'Subtítulo da seção hero',
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

    default:
      return {
        ...base,
        type: 'hero',
        title: 'Nova Seção',
      } as SectionConfig
  }
}
