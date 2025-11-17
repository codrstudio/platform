/**
 * Cards Section Form
 *
 * Form for editing Cards/Features section configuration.
 * Supports title, subtitle, columns, card effect, and dynamic cards array.
 *
 * Features:
 * - Text content editing (title, subtitle)
 * - Column selection (1-6 columns)
 * - Card effect selection
 * - Card management (add/remove/edit)
 * - Individual card configuration (title, description, icon, link)
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { CardsSectionConfig } from '../../../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
import { IconEmojiPicker } from '@/components/platform/IconEmojiPicker'

export interface CardsSectionFormProps {
  /** Cards section being edited */
  section: CardsSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: CardsSectionConfig) => void
}

/**
 * CardsSectionForm Component
 *
 * Comprehensive form for editing Cards/Features section.
 */
export function CardsSectionForm({ section, onUpdate }: CardsSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<CardsSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof CardsSectionConfig>(
    field: K,
    value: CardsSectionConfig[K]
  ) => {
    console.log(`[CardsSectionForm] updateField called: ${String(field)}`, value)
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    console.log('[CardsSectionForm] Calling onUpdate with:', updated)
    onUpdate(updated)
  }

  /**
   * Add card item
   */
  const handleAddCard = () => {
    console.log('[CardsSectionForm] handleAddCard called')
    console.log('[CardsSectionForm] Current items:', formData.items)

    const newCard = {
      title: 'Novo Card',
      description: 'Descrição do card',
      icon: 'star',
    }

    const updatedItems = [...(formData.items || []), newCard]
    console.log('[CardsSectionForm] Updated items:', updatedItems)

    updateField('items', updatedItems)
  }

  /**
   * Update card item
   */
  const handleUpdateCard = (index: number, updates: Partial<typeof formData.items[0]>) => {
    const updatedItems = [...(formData.items || [])]
    updatedItems[index] = { ...updatedItems[index], ...updates }
    updateField('items', updatedItems)
  }

  /**
   * Delete card item
   */
  const handleDeleteCard = (index: number) => {
    const updatedItems = formData.items?.filter((_, i) => i !== index) || []
    updateField('items', updatedItems)
  }

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enabled */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Seção Ativa</Label>
            <Switch
              id="enabled"
              checked={formData.enabled ?? true}
              onCheckedChange={(checked) => updateField('enabled', checked)}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Digite o título da seção"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Digite o subtítulo (opcional)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout & Design */}
      <Card>
        <CardHeader>
          <CardTitle>Layout & Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Columns */}
          <div className="space-y-2">
            <Label htmlFor="columns">Número de Colunas</Label>
            <Select
              value={String(formData.columns || 3)}
              onValueChange={(value) => updateField('columns', Number(value) as 1 | 2 | 3 | 4 | 5 | 6)}
            >
              <SelectTrigger id="columns">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Coluna</SelectItem>
                <SelectItem value="2">2 Colunas</SelectItem>
                <SelectItem value="3">3 Colunas</SelectItem>
                <SelectItem value="4">4 Colunas</SelectItem>
                <SelectItem value="5">5 Colunas</SelectItem>
                <SelectItem value="6">6 Colunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Effect */}
          <div className="space-y-2">
            <Label htmlFor="cardEffect">Efeito dos Cards</Label>
            <Select
              value={formData.cardEffect || 'hover-lift'}
              onValueChange={(value) => updateField('cardEffect', value as any)}
            >
              <SelectTrigger id="cardEffect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="hover-lift">Elevação no Hover</SelectItem>
                <SelectItem value="flip-hover">Virar no Hover</SelectItem>
                <SelectItem value="glow">Brilho</SelectItem>
                <SelectItem value="border">Borda Animada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation */}
          <div className="space-y-2">
            <Label htmlFor="animation">Animação</Label>
            <Select
              value={typeof formData.animation === 'string' ? formData.animation : 'fade-in'}
              onValueChange={(value) => updateField('animation', value as any)}
            >
              <SelectTrigger id="animation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="fade-in">Fade In</SelectItem>
                <SelectItem value="animated-list">Lista Animada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards List */}
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cards List */}
          {formData.items && formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Card {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Card Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`card-title-${index}`}>Título</Label>
                    <Input
                      id={`card-title-${index}`}
                      value={item.title || ''}
                      onChange={(e) => handleUpdateCard(index, { title: e.target.value })}
                      placeholder="Título do card"
                    />
                  </div>

                  {/* Card Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`card-description-${index}`}>Descrição</Label>
                    <Textarea
                      id={`card-description-${index}`}
                      value={item.description || ''}
                      onChange={(e) => handleUpdateCard(index, { description: e.target.value })}
                      placeholder="Descrição do card"
                      rows={2}
                    />
                  </div>

                  {/* Card Icon */}
                  <IconEmojiPicker
                    id={`card-icon-${index}`}
                    label="Ícone"
                    value={item.icon || ''}
                    onChange={(icon) => handleUpdateCard(index, { icon })}
                    placeholder="star"
                  />

                  {/* Back Content (for flip cards) */}
                  {formData.cardEffect === 'flip-hover' && (
                    <div className="space-y-2">
                      <Label htmlFor={`card-back-${index}`}>Conteúdo do Verso</Label>
                      <Textarea
                        id={`card-back-${index}`}
                        value={item.backContent || ''}
                        onChange={(e) => handleUpdateCard(index, { backContent: e.target.value })}
                        placeholder="Texto exibido quando o card vira"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum card adicionado ainda
            </p>
          )}

          {/* Add Card Button */}
          <Button variant="outline" size="sm" onClick={handleAddCard} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Card
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
