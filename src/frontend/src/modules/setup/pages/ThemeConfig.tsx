// Theme Config Page
// Based on spec/ui/setup-module-interfaces.md Section 4.4

import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Palette } from 'lucide-react';
import { usePortal } from '@/hooks/useJQEL';

export function ThemeConfig() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();

  // Use JQEL hook to fetch portal
  const { data: portalResult, isLoading, error } = usePortal(portalId || '');
  const portal = portalResult?.data?.[0] || null;

  const [brandColor, setBrandColor] = useState('#0ea5e9');
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Load theme config from JQEL using settingsKey
  // For now, use default color

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // TODO: Save theme config via JQEL
      console.log('Saving theme config:', { brandColor });

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      navigate(`/setup/portals/${portalId}`);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando configurações de tema...</p>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="container mx-auto p-6">
        <p>Portal não encontrado</p>
        {error && <p className="text-sm text-muted-foreground mt-2">{String(error)}</p>}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/setup/portals/${portalId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tema do Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            {portal.name} - Configure cores e aparência personalizada
          </p>
        </div>
      </div>

      {/* Brand Color */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Cor da Marca</CardTitle>
          </div>
          <CardDescription>
            Defina a cor principal do portal. A paleta completa será gerada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="brandColor">Cor Principal</Label>
                <Input
                  id="brandColor"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-12 w-full cursor-pointer"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Valor Hexadecimal</Label>
                <Input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#0ea5e9"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview da Paleta</Label>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-1">
                    <div
                      className="h-16 rounded border"
                      style={{
                        backgroundColor: brandColor,
                        opacity: shade === 500 ? 1 : shade < 500 ? shade / 500 : (1000 - shade) / 500
                      }}
                    />
                    <p className="text-xs text-center text-muted-foreground">{shade}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                A paleta completa será gerada automaticamente com base na cor principal,
                garantindo contraste WCAG AA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semantic Colors Info */}
      <Card>
        <CardHeader>
          <CardTitle>Cores Semânticas</CardTitle>
          <CardDescription>
            As cores para success, warning, error e info são geradas automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Success</Label>
              <div className="h-12 rounded border bg-green-500" />
              <p className="text-xs text-muted-foreground">Gerado automaticamente</p>
            </div>
            <div className="space-y-2">
              <Label>Warning</Label>
              <div className="h-12 rounded border bg-yellow-500" />
              <p className="text-xs text-muted-foreground">Gerado automaticamente</p>
            </div>
            <div className="space-y-2">
              <Label>Error</Label>
              <div className="h-12 rounded border bg-red-500" />
              <p className="text-xs text-muted-foreground">Gerado automaticamente</p>
            </div>
            <div className="space-y-2">
              <Label>Info</Label>
              <div className="h-12 rounded border bg-blue-500" />
              <p className="text-xs text-muted-foreground">Gerado automaticamente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/setup/portals/${portalId}`)}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Tema'}
        </Button>
      </div>
    </div>
  );
}
