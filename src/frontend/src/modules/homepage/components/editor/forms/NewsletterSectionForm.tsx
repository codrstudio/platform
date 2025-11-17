/**
 * Newsletter Section Form
 *
 * Form for editing Newsletter section configuration.
 * Supports title, subtitle, placeholder, button text, and success message.
 *
 * Features:
 * - Text content editing (title, subtitle, description)
 * - Input placeholder customization
 * - Button text customization
 * - Success/error message customization
 * - Layout selection
 * - Privacy options
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { NewsletterSectionConfig } from '../../../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface NewsletterSectionFormProps {
  /** Newsletter section being edited */
  section: NewsletterSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: NewsletterSectionConfig) => void
}

/**
 * NewsletterSectionForm Component
 *
 * Comprehensive form for editing Newsletter section.
 */
export function NewsletterSectionForm({ section, onUpdate }: NewsletterSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<NewsletterSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof NewsletterSectionConfig>(
    field: K,
    value: NewsletterSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Texto adicional explicativo (opcional)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder do Input</Label>
            <Input
              id="placeholder"
              value={formData.placeholder || ''}
              onChange={(e) => updateField('placeholder', e.target.value)}
              placeholder="Ex: Digite seu e-mail"
            />
          </div>

          {/* Button Text */}
          <div className="space-y-2">
            <Label htmlFor="buttonText">Texto do Botão</Label>
            <Input
              id="buttonText"
              value={formData.buttonText || ''}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="Ex: Inscrever-se"
            />
          </div>

          {/* Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint (API)</Label>
            <Input
              id="endpoint"
              type="url"
              value={formData.endpoint || ''}
              onChange={(e) => updateField('endpoint', e.target.value)}
              placeholder="/api/newsletter/subscribe"
            />
            <p className="text-xs text-muted-foreground">
              URL do endpoint que receberá os dados do formulário
            </p>
          </div>

          {/* Incentive */}
          <div className="space-y-2">
            <Label htmlFor="incentive">Incentivo</Label>
            <Input
              id="incentive"
              value={formData.incentive || ''}
              onChange={(e) => updateField('incentive', e.target.value)}
              placeholder="Ex: Ganhe 10% de desconto!"
            />
            <p className="text-xs text-muted-foreground">
              Texto de incentivo para inscrição (opcional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Layout & Options */}
      <Card>
        <CardHeader>
          <CardTitle>Layout & Opções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layout */}
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={formData.layout || 'inline'}
              onValueChange={(value) => updateField('layout', value as any)}
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline (input + botão na mesma linha)</SelectItem>
                <SelectItem value="stacked">Stacked (input e botão empilhados)</SelectItem>
                <SelectItem value="card">Card (em um cartão destacado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Privacy */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showPrivacy">Exibir Aviso de Privacidade</Label>
              <p className="text-xs text-muted-foreground">
                Mostra texto sobre política de privacidade
              </p>
            </div>
            <Switch
              id="showPrivacy"
              checked={formData.showPrivacy ?? true}
              onCheckedChange={(checked) => updateField('showPrivacy', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
