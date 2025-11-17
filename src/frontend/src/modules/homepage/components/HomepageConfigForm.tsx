/**
 * Homepage Config Form
 *
 * Simple configuration form for homepage instances.
 * Handles basic settings (route, title, enabled).
 * Includes "Editar Visual" button to navigate to dedicated editor page.
 *
 * Architecture:
 * - Basic config saved inline in instance
 * - Visual editor opens in dedicated page (not modal) to reduce DOM weight
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Palette } from 'lucide-react';
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
 * 2. "Editar Visual" button navigates to dedicated editor page
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
  });

  const [isSaving, setIsSaving] = useState(false);

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
    <>
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
              placeholder="/ ou /home"
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

          {/* Visual Editor Button */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleOpenVisualEditor}
            >
              <Palette className="w-4 h-4 mr-2" />
              Editar Visual da Página
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Configure seções, layout, cores e conteúdo da página
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end mt-6">
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
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </>
  );
}
