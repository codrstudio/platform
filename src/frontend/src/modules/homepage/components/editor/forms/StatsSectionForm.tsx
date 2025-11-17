/**
 * Stats Section Form
 *
 * Form for editing Statistics section configuration.
 * Supports title, subtitle, columns, and dynamic stats array.
 *
 * Features:
 * - Text content editing (title, subtitle)
 * - Column selection (2-4 columns)
 * - Stat management (add/remove/edit)
 * - Individual stat configuration (label, value, description, icon)
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { StatsSectionConfig } from '../../../types'
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
import { Plus, Trash2 } from 'lucide-react'
import { IconEmojiPicker } from '@/components/platform/IconEmojiPicker'

export interface StatsSectionFormProps {
  /** Stats section being edited */
  section: StatsSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: StatsSectionConfig) => void
}

/**
 * StatsSectionForm Component
 *
 * Comprehensive form for editing Statistics section.
 */
export function StatsSectionForm({ section, onUpdate }: StatsSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<StatsSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof StatsSectionConfig>(
    field: K,
    value: StatsSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  /**
   * Add stat item
   */
  const handleAddStat = () => {
    const newStat = {
      value: '0',
      label: 'Nova Estatística',
      description: 'Descrição da estatística',
      icon: 'TrendingUp',
    }

    const updatedItems = [...(formData.items || []), newStat]
    updateField('items', updatedItems)
  }

  /**
   * Update stat item
   */
  const handleUpdateStat = (index: number, updates: Partial<typeof formData.items[0]>) => {
    const updatedItems = [...(formData.items || [])]
    updatedItems[index] = { ...updatedItems[index], ...updates }
    updateField('items', updatedItems)
  }

  /**
   * Delete stat item
   */
  const handleDeleteStat = (index: number) => {
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
              onValueChange={(value) => updateField('columns', Number(value) as 2 | 3 | 4)}
            >
              <SelectTrigger id="columns">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Colunas</SelectItem>
                <SelectItem value="3">3 Colunas</SelectItem>
                <SelectItem value="4">4 Colunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Animation */}
          <div className="flex items-center justify-between">
            <Label htmlFor="showAnimation">Animar Números</Label>
            <Switch
              id="showAnimation"
              checked={formData.showAnimation ?? true}
              onCheckedChange={(checked) => updateField('showAnimation', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats List */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats List */}
          {formData.items && formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Estatística {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStat(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Stat Value */}
                  <div className="space-y-2">
                    <Label htmlFor={`stat-value-${index}`}>Valor</Label>
                    <Input
                      id={`stat-value-${index}`}
                      value={String(item.value || '')}
                      onChange={(e) => {
                        const val = e.target.value
                        // Try to parse as number, keep as string if it fails
                        const numVal = parseFloat(val)
                        handleUpdateStat(index, {
                          value: isNaN(numVal) ? val : numVal
                        })
                      }}
                      placeholder="Ex: 1000 ou 99.9%"
                    />
                  </div>

                  {/* Stat Label */}
                  <div className="space-y-2">
                    <Label htmlFor={`stat-label-${index}`}>Título</Label>
                    <Input
                      id={`stat-label-${index}`}
                      value={item.label || ''}
                      onChange={(e) => handleUpdateStat(index, { label: e.target.value })}
                      placeholder="Ex: Usuários Ativos"
                    />
                  </div>

                  {/* Stat Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`stat-description-${index}`}>Descrição</Label>
                    <Textarea
                      id={`stat-description-${index}`}
                      value={item.description || ''}
                      onChange={(e) => handleUpdateStat(index, { description: e.target.value })}
                      placeholder="Descrição adicional (opcional)"
                      rows={2}
                    />
                  </div>

                  {/* Stat Icon */}
                  <IconEmojiPicker
                    id={`stat-icon-${index}`}
                    label="Ícone"
                    value={item.icon || ''}
                    onChange={(icon) => handleUpdateStat(index, { icon })}
                    placeholder="trending-up"
                  />

                  {/* Prefix & Suffix */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`stat-prefix-${index}`}>Prefixo</Label>
                      <Input
                        id={`stat-prefix-${index}`}
                        value={item.prefix || ''}
                        onChange={(e) => handleUpdateStat(index, { prefix: e.target.value })}
                        placeholder="Ex: R$"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`stat-suffix-${index}`}>Sufixo</Label>
                      <Input
                        id={`stat-suffix-${index}`}
                        value={item.suffix || ''}
                        onChange={(e) => handleUpdateStat(index, { suffix: e.target.value })}
                        placeholder="Ex: %"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma estatística adicionada ainda
            </p>
          )}

          {/* Add Stat Button */}
          <Button variant="outline" size="sm" onClick={handleAddStat} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Estatística
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
