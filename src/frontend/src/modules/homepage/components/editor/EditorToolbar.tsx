/**
 * Editor Toolbar Component
 *
 * Top toolbar for the homepage visual editor.
 * Provides save, preview toggle, close actions, and status indicators.
 *
 * Composition Slot: toolbar
 *
 * @module homepage/components/editor
 */

import { Button } from '@/components/ui/button';
import { X, Save, Eye, EyeOff } from 'lucide-react';

export interface EditorToolbarProps {
  /** Title displayed in toolbar */
  title?: string;

  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;

  /** Whether save operation is in progress */
  isSaving: boolean;

  /** Whether preview panel is visible */
  showPreview: boolean;

  /** Handler for save button click */
  onSave: () => void;

  /** Handler for preview toggle */
  onTogglePreview: () => void;

  /** Handler for close button click */
  onClose: () => void;
}

/**
 * EditorToolbar Component
 *
 * Header toolbar with action buttons and status indicators.
 * Designed to be used in the "toolbar" composition slot.
 */
export function EditorToolbar({
  title = 'Editor Visual - Homepage',
  hasUnsavedChanges,
  isSaving,
  showPreview,
  onSave,
  onTogglePreview,
  onClose,
}: EditorToolbarProps) {
  return (
    <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
      {/* Title and Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        {hasUnsavedChanges && (
          <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded">
            Não salvo
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Preview Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          aria-label={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          {showPreview ? 'Ocultar' : 'Mostrar'} Preview
        </Button>

        {/* Save Button */}
        <Button
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          aria-label="Salvar alterações"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Fechar editor"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
