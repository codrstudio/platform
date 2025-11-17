/**
 * Quick Links Section Form
 *
 * Form for editing Quick Links section configuration.
 * Supports title, subtitle, layout, and dynamic links array.
 *
 * Features:
 * - Text content editing (title, subtitle)
 * - Layout selection (horizontal/vertical/grid)
 * - Link management (add/remove/edit)
 * - Individual link configuration (label, url, icon, description)
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { QuickLinksSectionConfig } from '../../../types'
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

export interface QuickLinksSectionFormProps {
  /** Quick Links section being edited */
  section: QuickLinksSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: QuickLinksSectionConfig) => void
}

/**
 * QuickLinksSectionForm Component
 *
 * Comprehensive form for editing Quick Links section.
 */
export function QuickLinksSectionForm({ section, onUpdate }: QuickLinksSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<QuickLinksSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof QuickLinksSectionConfig>(
    field: K,
    value: QuickLinksSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  /**
   * Add link item
   */
  const handleAddLink = () => {
    const newLink = {
      label: 'Novo Link',
      link: {
        type: 'relative' as const,
        route: '/',
      },
      description: 'Descrição do link',
      icon: 'Link',
    }

    const updatedItems = [...(formData.items || []), newLink]
    updateField('items', updatedItems)
  }

  /**
   * Update link item
   */
  const handleUpdateLink = (index: number, updates: Partial<typeof formData.items[0]>) => {
    const updatedItems = [...(formData.items || [])]
    updatedItems[index] = { ...updatedItems[index], ...updates }
    updateField('items', updatedItems)
  }

  /**
   * Delete link item
   */
  const handleDeleteLink = (index: number) => {
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
          {/* Layout */}
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={formData.layout || 'grid'}
              onValueChange={(value) => updateField('layout', value as any)}
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Columns (for grid layout) */}
          {formData.layout === 'grid' && (
            <div className="space-y-2">
              <Label htmlFor="columns">Número de Colunas</Label>
              <Select
                value={String(formData.columns || 3)}
                onValueChange={(value) => updateField('columns', Number(value) as 2 | 3 | 4 | 6)}
              >
                <SelectTrigger id="columns">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Colunas</SelectItem>
                  <SelectItem value="3">3 Colunas</SelectItem>
                  <SelectItem value="4">4 Colunas</SelectItem>
                  <SelectItem value="6">6 Colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show Icons */}
          <div className="flex items-center justify-between">
            <Label htmlFor="showIcons">Exibir Ícones</Label>
            <Switch
              id="showIcons"
              checked={formData.showIcons ?? true}
              onCheckedChange={(checked) => updateField('showIcons', checked)}
            />
          </div>

          {/* Show Descriptions */}
          <div className="flex items-center justify-between">
            <Label htmlFor="showDescriptions">Exibir Descrições</Label>
            <Switch
              id="showDescriptions"
              checked={formData.showDescriptions ?? true}
              onCheckedChange={(checked) => updateField('showDescriptions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Links List */}
          {formData.items && formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Link {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Link Label */}
                  <div className="space-y-2">
                    <Label htmlFor={`link-label-${index}`}>Texto do Link</Label>
                    <Input
                      id={`link-label-${index}`}
                      value={item.label || ''}
                      onChange={(e) => handleUpdateLink(index, { label: e.target.value })}
                      placeholder="Ex: Documentação"
                    />
                  </div>

                  {/* Link Description */}
                  {formData.showDescriptions && (
                    <div className="space-y-2">
                      <Label htmlFor={`link-description-${index}`}>Descrição</Label>
                      <Textarea
                        id={`link-description-${index}`}
                        value={item.description || ''}
                        onChange={(e) => handleUpdateLink(index, { description: e.target.value })}
                        placeholder="Descrição do link"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Link Icon */}
                  {formData.showIcons && (
                    <IconEmojiPicker
                      id={`link-icon-${index}`}
                      label="Ícone"
                      value={item.icon || ''}
                      onChange={(icon) => handleUpdateLink(index, { icon })}
                      placeholder="link"
                    />
                  )}

                  {/* Link Type */}
                  <div className="space-y-2">
                    <Label htmlFor={`link-type-${index}`}>Tipo de Link</Label>
                    <Select
                      value={item.link?.type || 'relative'}
                      onValueChange={(value) => {
                        const linkType = value as 'relative' | 'external' | 'portal'
                        if (linkType === 'relative') {
                          handleUpdateLink(index, {
                            link: { type: 'relative', route: '/' }
                          })
                        } else if (linkType === 'external') {
                          handleUpdateLink(index, {
                            link: { type: 'external', url: 'https://' }
                          })
                        } else {
                          handleUpdateLink(index, {
                            link: { type: 'portal', portal: 'main', route: '/' }
                          })
                        }
                      }}
                    >
                      <SelectTrigger id={`link-type-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relative">Relativo (mesma aplicação)</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="external">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Link URL/Route */}
                  {item.link?.type === 'relative' && (
                    <div className="space-y-2">
                      <Label htmlFor={`link-route-${index}`}>Rota</Label>
                      <Input
                        id={`link-route-${index}`}
                        value={(item.link as any).route || ''}
                        onChange={(e) => handleUpdateLink(index, {
                          link: { ...item.link, route: e.target.value }
                        })}
                        placeholder="/dashboard"
                      />
                    </div>
                  )}

                  {item.link?.type === 'external' && (
                    <div className="space-y-2">
                      <Label htmlFor={`link-url-${index}`}>URL</Label>
                      <Input
                        id={`link-url-${index}`}
                        type="url"
                        value={(item.link as any).url || ''}
                        onChange={(e) => handleUpdateLink(index, {
                          link: { ...item.link, url: e.target.value }
                        })}
                        placeholder="https://exemplo.com"
                      />
                    </div>
                  )}

                  {item.link?.type === 'portal' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`link-portal-${index}`}>Portal ID</Label>
                        <Input
                          id={`link-portal-${index}`}
                          value={(item.link as any).portal || ''}
                          onChange={(e) => handleUpdateLink(index, {
                            link: { ...item.link, portal: e.target.value }
                          })}
                          placeholder="main"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`link-portal-route-${index}`}>Rota no Portal</Label>
                        <Input
                          id={`link-portal-route-${index}`}
                          value={(item.link as any).route || ''}
                          onChange={(e) => handleUpdateLink(index, {
                            link: { ...item.link, route: e.target.value }
                          })}
                          placeholder="/"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum link adicionado ainda
            </p>
          )}

          {/* Add Link Button */}
          <Button variant="outline" size="sm" onClick={handleAddLink} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Link
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
