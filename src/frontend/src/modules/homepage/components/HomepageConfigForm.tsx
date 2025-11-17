/**
 * Homepage Config Form
 *
 * Simple configuration form for homepage instances.
 * Handles basic settings (route, title, enabled).
 * Includes "Editar Visual" card to navigate to dedicated editor page.
 *
 * Architecture:
 * - Basic config saved inline in instance
 * - Visual editor opens in dedicated page (not modal) to reduce DOM weight
 * - Layout matches PortalEdit pattern (left: form, right: action cards)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { useJQELQuery } from '@/hooks/useJQEL';
import type { HomepageBasicConfig } from '../types';

export interface HomepageConfigFormProps {
  instanceId: string;
  portalId: string;
  moduleId: string;
  config: Record<string, any>;
  onSave: (config: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

/**
 * HomepageConfigForm Component
 *
 * Progressive UX:
 * 1. Simple form for basic config (route, title, enabled)
 * 2. "Editar Visual" card navigates to dedicated editor page
 */
export function HomepageConfigForm({
  instanceId,
  portalId,
  moduleId,
  config,
  onSave,
  onCancel,
}: HomepageConfigFormProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<HomepageBasicConfig>({
    route: config.route || '/',
    title: config.title || '',
    enabled: config.enabled ?? true,
    compositionId: config.compositionId || null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load available compositions for this portal
  const { data: compositions } = useJQELQuery({
    schema: 'backend',
    select: 'composition',
    where: { portalId: { $eq: portalId } },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenVisualEditor = () => {
    // Navigate to dedicated editor page
    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/${instanceId}/editor`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column: Basic Configuration Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Básicas</CardTitle>
            <CardDescription>
              Configure os parâmetros básicos da página inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route */}
            <div className="space-y-2">
              <Label htmlFor="route">Rota da Página</Label>
              <Input
                id="route"
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                placeholder="/"
              />
              <p className="text-sm text-muted-foreground">
                Caminho da URL para acessar esta página (ex: "/", "/home", "/welcome")
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da Página (opcional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Minha Homepage"
              />
              <p className="text-sm text-muted-foreground">
                Título exibido na aba do navegador e para SEO
              </p>
            </div>

            {/* Composition */}
            <div className="space-y-2">
              <Label htmlFor="composition">Composição (Layout)</Label>
              <Select
                value={formData.compositionId || 'none'}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    compositionId: value === 'none' ? null : value
                  }))
                }
              >
                <SelectTrigger id="composition">
                  <SelectValue placeholder="Sem composição (página limpa)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem composição (página limpa)</SelectItem>
                  {compositions?.data?.map((comp: any) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Escolha um layout para envolver a página (sidebar, header, etc)
              </p>
            </div>

            {/* Enabled */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Página Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar ou desativar esta página
                </p>
              </div>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.route}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Right Column: Visual Editor Card */}
      <div className="space-y-4">
        <Card
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 group"
          onClick={handleOpenVisualEditor}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
              <CardTitle className="group-hover:text-primary transition-colors duration-200">
                Editar Visual da Página
              </CardTitle>
            </div>
            <CardDescription>
              Configure seções, layout, cores e conteúdo da página
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
