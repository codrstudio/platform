/**
 * Hero Section Form
 *
 * Form for editing Hero section configuration.
 * Supports title, subtitle, description, layout, background, and CTAs.
 *
 * Features:
 * - Text content editing (title, subtitle, description)
 * - Layout selection (centered/split)
 * - Background configuration
 * - CTA button management
 * - Image configuration (for split layout)
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { HeroSectionConfig } from '../../../types'
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

export interface HeroSectionFormProps {
  /** Hero section being edited */
  section: HeroSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: HeroSectionConfig) => void
}

/**
 * HeroSectionForm Component
 *
 * Comprehensive form for editing Hero section.
 */
export function HeroSectionForm({ section, onUpdate }: HeroSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<HeroSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof HeroSectionConfig>(
    field: K,
    value: HeroSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  /**
   * Add CTA button
   */
  const handleAddCTA = () => {
    const newCTA = {
      label: 'Novo Botão',
      link: { type: 'relative' as const, route: '/' },
      variant: 'default' as const,
    }

    const updatedCTAs = [...(formData.actions || []), newCTA]
    updateField('actions', updatedCTAs)
  }

  /**
   * Update CTA button
   */
  const handleUpdateCTA = (index: number, updates: Partial<typeof formData.actions[0]>) => {
    const updatedCTAs = [...(formData.actions || [])]
    updatedCTAs[index] = { ...updatedCTAs[index], ...updates }
    updateField('actions', updatedCTAs)
  }

  /**
   * Delete CTA button
   */
  const handleDeleteCTA = (index: number) => {
    const updatedCTAs = formData.actions?.filter((_, i) => i !== index) || []
    updateField('actions', updatedCTAs)
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
              placeholder="Digite o título principal"
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Digite uma descrição detalhada (opcional)"
              rows={3}
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
              value={formData.layout || 'centered'}
              onValueChange={(value: 'centered' | 'split') => updateField('layout', value)}
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="centered">Centralizado</SelectItem>
                <SelectItem value="split">Dividido (com imagem)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Layout centralizado exibe o conteúdo no centro. Layout dividido exibe texto à
              esquerda e imagem à direita.
            </p>
          </div>

          {/* Background Effect */}
          <div className="space-y-2">
            <Label htmlFor="backgroundEffect">Efeito de Fundo</Label>
            <Select
              value={
                typeof formData.backgroundEffect === 'string'
                  ? formData.backgroundEffect
                  : 'none'
              }
              onValueChange={(value) =>
                updateField('backgroundEffect', value as 'grid' | 'none')
              }
            >
              <SelectTrigger id="backgroundEffect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="grid">Grid Animado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background Image */}
          {formData.layout === 'split' && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">URL da Imagem</Label>
                <Input
                  id="backgroundImage"
                  type="url"
                  value={formData.backgroundImage || ''}
                  onChange={(e) => updateField('backgroundImage', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  URL da imagem para layout dividido
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Botões de Ação (CTAs)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CTA List */}
          {formData.actions && formData.actions.length > 0 ? (
            <div className="space-y-3">
              {formData.actions.map((cta, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Botão {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCTA(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Button Label */}
                  <div className="space-y-2">
                    <Label htmlFor={`cta-label-${index}`}>Texto do Botão</Label>
                    <Input
                      id={`cta-label-${index}`}
                      value={cta.label}
                      onChange={(e) => handleUpdateCTA(index, { label: e.target.value })}
                      placeholder="Ex: Começar Agora"
                    />
                  </div>

                  {/* Button Variant */}
                  <div className="space-y-2">
                    <Label htmlFor={`cta-variant-${index}`}>Estilo</Label>
                    <Select
                      value={cta.variant || 'default'}
                      onValueChange={(value) => handleUpdateCTA(index, { variant: value as any })}
                    >
                      <SelectTrigger id={`cta-variant-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="shiny">Shiny</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                        <SelectItem value="secondary">Secundário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Button Action */}
                  <div className="space-y-2">
                    <Label htmlFor={`cta-action-${index}`}>Ação</Label>
                    <Select
                      value={cta.action || 'link'}
                      onValueChange={(value) => handleUpdateCTA(index, { action: value as any })}
                    >
                      <SelectTrigger id={`cta-action-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="link">Link Interno</SelectItem>
                        <SelectItem value="external">Link Externo</SelectItem>
                        <SelectItem value="signup">Cadastro</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="scroll-to">Rolar para Seção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target/URL (conditional) */}
                  {cta.action === 'external' && (
                    <div className="space-y-2">
                      <Label htmlFor={`cta-url-${index}`}>URL Externo</Label>
                      <Input
                        id={`cta-url-${index}`}
                        type="url"
                        value={cta.url || ''}
                        onChange={(e) => handleUpdateCTA(index, { url: e.target.value })}
                        placeholder="https://exemplo.com"
                      />
                    </div>
                  )}

                  {cta.action === 'link' && (
                    <div className="space-y-2">
                      <Label htmlFor={`cta-target-${index}`}>Caminho</Label>
                      <Input
                        id={`cta-target-${index}`}
                        value={cta.target || ''}
                        onChange={(e) => handleUpdateCTA(index, { target: e.target.value })}
                        placeholder="/dashboard"
                      />
                    </div>
                  )}

                  {cta.action === 'scroll-to' && (
                    <div className="space-y-2">
                      <Label htmlFor={`cta-target-${index}`}>ID da Seção</Label>
                      <Input
                        id={`cta-target-${index}`}
                        value={cta.target || ''}
                        onChange={(e) => handleUpdateCTA(index, { target: e.target.value })}
                        placeholder="section-id"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum botão adicionado ainda
            </p>
          )}

          {/* Add CTA Button */}
          <Button variant="outline" size="sm" onClick={handleAddCTA} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Botão
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
