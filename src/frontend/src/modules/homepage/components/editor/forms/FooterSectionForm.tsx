/**
 * Footer Section Form
 *
 * Form for editing Footer section configuration.
 * Supports logo, description, link groups, social links, and copyright.
 *
 * Features:
 * - Logo configuration
 * - Description text
 * - Link groups management (columns with links)
 * - Social media links
 * - Copyright text
 * - Newsletter integration option
 *
 * @module homepage/components/editor/forms
 */

import { useState, useEffect } from 'react'
import type { FooterSectionConfig } from '../../../types'
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

export interface FooterSectionFormProps {
  /** Footer section being edited */
  section: FooterSectionConfig

  /** Callback when section is updated */
  onUpdate: (updatedSection: FooterSectionConfig) => void
}

/**
 * FooterSectionForm Component
 *
 * Comprehensive form for editing Footer section.
 */
export function FooterSectionForm({ section, onUpdate }: FooterSectionFormProps) {
  // Local form state
  const [formData, setFormData] = useState<FooterSectionConfig>(section)

  // Update form data when section changes
  useEffect(() => {
    setFormData(section)
  }, [section])

  /**
   * Update form field and propagate to parent
   */
  const updateField = <K extends keyof FooterSectionConfig>(
    field: K,
    value: FooterSectionConfig[K]
  ) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  /**
   * Add link group (column)
   */
  const handleAddLinkGroup = () => {
    const newGroup = {
      title: 'Nova Seção',
      links: [
        {
          label: 'Link 1',
          link: { type: 'relative' as const, route: '/' },
        },
      ],
    }

    const updatedGroups = [...(formData.linkGroups || []), newGroup]
    updateField('linkGroups', updatedGroups)
  }

  /**
   * Update link group
   */
  const handleUpdateLinkGroup = (
    groupIndex: number,
    updates: Partial<typeof formData.linkGroups[0]>
  ) => {
    const updatedGroups = [...(formData.linkGroups || [])]
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], ...updates }
    updateField('linkGroups', updatedGroups)
  }

  /**
   * Delete link group
   */
  const handleDeleteLinkGroup = (groupIndex: number) => {
    const updatedGroups = formData.linkGroups?.filter((_, i) => i !== groupIndex) || []
    updateField('linkGroups', updatedGroups)
  }

  /**
   * Add link to group
   */
  const handleAddLink = (groupIndex: number) => {
    const updatedGroups = [...(formData.linkGroups || [])]
    const newLink = {
      label: 'Novo Link',
      link: { type: 'relative' as const, route: '/' },
    }

    updatedGroups[groupIndex].links = [...updatedGroups[groupIndex].links, newLink]
    updateField('linkGroups', updatedGroups)
  }

  /**
   * Update link in group
   */
  const handleUpdateLink = (
    groupIndex: number,
    linkIndex: number,
    updates: Partial<typeof formData.linkGroups[0]['links'][0]>
  ) => {
    const updatedGroups = [...(formData.linkGroups || [])]
    updatedGroups[groupIndex].links[linkIndex] = {
      ...updatedGroups[groupIndex].links[linkIndex],
      ...updates,
    }
    updateField('linkGroups', updatedGroups)
  }

  /**
   * Delete link from group
   */
  const handleDeleteLink = (groupIndex: number, linkIndex: number) => {
    const updatedGroups = [...(formData.linkGroups || [])]
    updatedGroups[groupIndex].links = updatedGroups[groupIndex].links.filter(
      (_, i) => i !== linkIndex
    )
    updateField('linkGroups', updatedGroups)
  }

  /**
   * Add social link
   */
  const handleAddSocialLink = () => {
    const newSocial = {
      platform: 'twitter' as const,
      url: 'https://twitter.com/',
    }

    const updatedSocials = [...(formData.socialLinks || []), newSocial]
    updateField('socialLinks', updatedSocials)
  }

  /**
   * Update social link
   */
  const handleUpdateSocialLink = (
    index: number,
    updates: Partial<typeof formData.socialLinks[0]>
  ) => {
    const updatedSocials = [...(formData.socialLinks || [])]
    updatedSocials[index] = { ...updatedSocials[index], ...updates }
    updateField('socialLinks', updatedSocials)
  }

  /**
   * Delete social link
   */
  const handleDeleteSocialLink = (index: number) => {
    const updatedSocials = formData.socialLinks?.filter((_, i) => i !== index) || []
    updateField('socialLinks', updatedSocials)
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descrição ou slogan da empresa"
              rows={3}
            />
          </div>

          {/* Copyright */}
          <div className="space-y-2">
            <Label htmlFor="copyright">Copyright</Label>
            <Input
              id="copyright"
              value={formData.copyright || ''}
              onChange={(e) => updateField('copyright', e.target.value)}
              placeholder="© 2024 Empresa. Todos os direitos reservados."
            />
          </div>

          {/* Show Newsletter */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showNewsletter">Incluir Newsletter no Footer</Label>
              <p className="text-xs text-muted-foreground">
                Adiciona formulário de newsletter no rodapé
              </p>
            </div>
            <Switch
              id="showNewsletter"
              checked={formData.showNewsletter ?? false}
              onCheckedChange={(checked) => updateField('showNewsletter', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Source */}
          <div className="space-y-2">
            <Label htmlFor="logoSrc">URL da Logo</Label>
            <Input
              id="logoSrc"
              type="url"
              value={formData.logo?.src || ''}
              onChange={(e) =>
                updateField('logo', {
                  ...formData.logo,
                  src: e.target.value,
                  alt: formData.logo?.alt || 'Logo',
                })
              }
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          {/* Logo Alt */}
          <div className="space-y-2">
            <Label htmlFor="logoAlt">Texto Alternativo</Label>
            <Input
              id="logoAlt"
              value={formData.logo?.alt || ''}
              onChange={(e) =>
                updateField('logo', { ...formData.logo, src: formData.logo?.src || '', alt: e.target.value })
              }
              placeholder="Logo da Empresa"
            />
          </div>
        </CardContent>
      </Card>

      {/* Link Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Colunas de Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.linkGroups && formData.linkGroups.length > 0 ? (
            <div className="space-y-4">
              {formData.linkGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Coluna {groupIndex + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLinkGroup(groupIndex)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Group Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`group-title-${groupIndex}`}>Título da Coluna</Label>
                    <Input
                      id={`group-title-${groupIndex}`}
                      value={group.title}
                      onChange={(e) =>
                        handleUpdateLinkGroup(groupIndex, { title: e.target.value })
                      }
                      placeholder="Ex: Produtos, Recursos, Sobre"
                    />
                  </div>

                  <Separator />

                  {/* Links in Group */}
                  <div className="space-y-2">
                    <Label className="text-sm">Links</Label>
                    {group.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={link.label}
                            onChange={(e) =>
                              handleUpdateLink(groupIndex, linkIndex, { label: e.target.value })
                            }
                            placeholder="Texto do link"
                            size={1}
                          />
                          <Input
                            value={(link.link as any).route || (link.link as any).url || ''}
                            onChange={(e) => {
                              const updatedLink =
                                link.link.type === 'external'
                                  ? { ...link.link, url: e.target.value }
                                  : { ...link.link, route: e.target.value }
                              handleUpdateLink(groupIndex, linkIndex, { link: updatedLink })
                            }}
                            placeholder="URL ou rota"
                            size={1}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLink(groupIndex, linkIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLink(groupIndex)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma coluna adicionada ainda
            </p>
          )}

          <Button variant="outline" size="sm" onClick={handleAddLinkGroup} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Coluna
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.socialLinks && formData.socialLinks.length > 0 ? (
            <div className="space-y-3">
              {formData.socialLinks.map((social, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Rede Social {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSocialLink(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Platform */}
                  <div className="space-y-2">
                    <Label htmlFor={`social-platform-${index}`}>Plataforma</Label>
                    <Select
                      value={social.platform}
                      onValueChange={(value) =>
                        handleUpdateSocialLink(index, { platform: value as any })
                      }
                    >
                      <SelectTrigger id={`social-platform-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* URL */}
                  <div className="space-y-2">
                    <Label htmlFor={`social-url-${index}`}>URL</Label>
                    <Input
                      id={`social-url-${index}`}
                      type="url"
                      value={social.url}
                      onChange={(e) => handleUpdateSocialLink(index, { url: e.target.value })}
                      placeholder="https://twitter.com/usuario"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma rede social adicionada ainda
            </p>
          )}

          <Button variant="outline" size="sm" onClick={handleAddSocialLink} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Rede Social
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
