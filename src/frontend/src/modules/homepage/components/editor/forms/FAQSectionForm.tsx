/**
 * FAQ Section Form
 *
 * Form for editing FAQ section configuration.
 * Supports title, subtitle, layout, and dynamic FAQ items array.
 *
 * Features:
 * - Text content editing (title, subtitle)
 * - Layout selection (accordion/cards)
 * - FAQ management (add/remove/edit)
 * - Individual FAQ configuration (question, answer)
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { FAQSectionConfig } from '../../../types'
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

export interface FAQSectionFormProps {
  /** FAQ section being edited */
  section: FAQSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: FAQSectionConfig) => void
}

/**
 * FAQSectionForm Component
 *
 * Comprehensive form for editing FAQ section.
 */
export function FAQSectionForm({ section, onUpdate }: FAQSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<FAQSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof FAQSectionConfig>(
    field: K,
    value: FAQSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  /**
   * Add FAQ item
   */
  const handleAddFAQ = () => {
    const newFAQ = {
      question: 'Nova Pergunta',
      answer: 'Resposta da pergunta',
    }

    const updatedItems = [...(formData.items || []), newFAQ]
    updateField('items', updatedItems)
  }

  /**
   * Update FAQ item
   */
  const handleUpdateFAQ = (index: number, updates: Partial<typeof formData.items[0]>) => {
    const updatedItems = [...(formData.items || [])]
    updatedItems[index] = { ...updatedItems[index], ...updates }
    updateField('items', updatedItems)
  }

  /**
   * Delete FAQ item
   */
  const handleDeleteFAQ = (index: number) => {
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
              value={formData.layout || 'single'}
              onValueChange={(value) => updateField('layout', value as any)}
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Coluna Única</SelectItem>
                <SelectItem value="two-column">Duas Colunas</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Layout de exibição das perguntas
            </p>
          </div>

          {/* Accordion Mode */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="accordion">Modo Accordion</Label>
              <p className="text-xs text-muted-foreground">
                Fecha automaticamente outras perguntas ao abrir uma nova
              </p>
            </div>
            <Switch
              id="accordion"
              checked={formData.accordion ?? true}
              onCheckedChange={(checked) => updateField('accordion', checked)}
            />
          </div>

          {/* Show Search */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showSearch">Barra de Pesquisa</Label>
              <p className="text-xs text-muted-foreground">
                Adiciona barra de pesquisa para filtrar perguntas
              </p>
            </div>
            <Switch
              id="showSearch"
              checked={formData.showSearch ?? false}
              onCheckedChange={(checked) => updateField('showSearch', checked)}
            />
          </div>

          {/* Show Categories */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showCategories">Exibir Categorias</Label>
              <p className="text-xs text-muted-foreground">
                Agrupa perguntas por categoria
              </p>
            </div>
            <Switch
              id="showCategories"
              checked={formData.showCategories ?? false}
              onCheckedChange={(checked) => updateField('showCategories', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Items */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* FAQ List */}
          {formData.items && formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">FAQ {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFAQ(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Question */}
                  <div className="space-y-2">
                    <Label htmlFor={`faq-question-${index}`}>Pergunta</Label>
                    <Input
                      id={`faq-question-${index}`}
                      value={item.question || ''}
                      onChange={(e) => handleUpdateFAQ(index, { question: e.target.value })}
                      placeholder="Digite a pergunta"
                    />
                  </div>

                  {/* Answer */}
                  <div className="space-y-2">
                    <Label htmlFor={`faq-answer-${index}`}>Resposta</Label>
                    <Textarea
                      id={`faq-answer-${index}`}
                      value={item.answer || ''}
                      onChange={(e) => handleUpdateFAQ(index, { answer: e.target.value })}
                      placeholder="Digite a resposta"
                      rows={3}
                    />
                  </div>

                  {/* Category (if enabled) */}
                  {formData.showCategories && (
                    <div className="space-y-2">
                      <Label htmlFor={`faq-category-${index}`}>Categoria</Label>
                      <Input
                        id={`faq-category-${index}`}
                        value={item.category || ''}
                        onChange={(e) => handleUpdateFAQ(index, { category: e.target.value })}
                        placeholder="Ex: Geral, Conta, Pagamento"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma pergunta adicionada ainda
            </p>
          )}

          {/* Add FAQ Button */}
          <Button variant="outline" size="sm" onClick={handleAddFAQ} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pergunta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
