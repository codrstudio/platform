// Theme Config Page with Tabs (Realm / Portal)
// Based on SPEC-theming.md and Realm System

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Palette, Globe, Trash2 } from 'lucide-react';
import { usePortal, useRealm } from '@/hooks/useJQEL';
import {
  getStoredBrandColor,
  setStoredBrandColor,
  setPortalBrandColor,
  removePortalBrandColor,
  hasPortalBrandColorOverride,
  hexToHSL,
  hslToHex
} from '@/lib/theme';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';

export function ThemeConfig() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();

  const { data: portalResult, isLoading: portalLoading } = usePortal(portalId || '');
  const portal = portalResult?.data?.[0] || null;

  const { data: realmResult, isLoading: realmLoading } = useRealm(portal?.realmId || '');
  const realm = realmResult?.data;

  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const portalName = portal?.name || 'Portal';
    return [
      { label: 'Home', href: '/' },
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalName, href: `/setup/portals/${portalId}` },
      { label: 'Tema' }
    ];
  }, [portal?.name, portalId]);

  const [realmBrandColor, setRealmBrandColorState] = useState('#0ea5e9');
  const [portalBrandColor, setPortalBrandColorState] = useState('#0ea5e9');
  const [hasPortalOverride, setHasPortalOverride] = useState(false);

  // Load current colors from localStorage
  useEffect(() => {
    if (portal && realm) {
      // Load realm color
      const realmColor = getStoredBrandColor(realm.realmId);
      setRealmBrandColorState(hslToHex(realmColor));

      // Check if portal has override
      const hasOverride = hasPortalBrandColorOverride(portal.portalId);
      setHasPortalOverride(hasOverride);

      if (hasOverride) {
        // Load portal override color
        const portalColor = getStoredBrandColor(realm.realmId, portal.portalId);
        setPortalBrandColorState(hslToHex(portalColor));
      } else {
        // Use realm color
        setPortalBrandColorState(hslToHex(realmColor));
      }
    }
  }, [portal, realm]);

  const handleSaveRealmColor = () => {
    if (!realm) return;

    const hslColor = hexToHSL(realmBrandColor);
    setStoredBrandColor(realm.realmId, hslColor);

    alert('Cor do reino salva! Recarregue a página para ver as mudanças.');
  };

  const handleSavePortalColor = () => {
    if (!portal) return;

    const hslColor = hexToHSL(portalBrandColor);
    setPortalBrandColor(portal.portalId, hslColor);
    setHasPortalOverride(true);

    alert('Cor do portal salva! Recarregue a página para ver as mudanças.');
  };

  const handleRemovePortalOverride = () => {
    if (!portal || !realm) return;

    if (!confirm('Tem certeza que deseja remover a customização do portal? Ele voltará a usar a cor do reino.')) {
      return;
    }

    removePortalBrandColor(portal.portalId);
    setHasPortalOverride(false);

    // Reset to realm color
    const realmColor = getStoredBrandColor(realm.realmId);
    setPortalBrandColorState(hslToHex(realmColor));

    alert('Customização removida! Recarregue a página para ver as mudanças.');
  };

  if (portalLoading || realmLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando configurações de tema...</p>
      </div>
    );
  }

  if (!portal || !realm) {
    return (
      <div className="container mx-auto p-6">
        <p>Portal ou Reino não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

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
            Configuração de Tema
          </h1>
          <p className="text-muted-foreground mt-2">
            {portal.name} (Reino: {realm.name})
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Sistema de Reinos</p>
              <p className="text-sm text-muted-foreground">
                A aba <strong>Reino</strong> define a cor padrão para todos os portais do reino "{realm.name}".
                A aba <strong>Portal</strong> permite customizar apenas este portal, sobrescrevendo a cor do reino.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="realm" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="realm">
            <Globe className="h-4 w-4 mr-2" />
            Reino
          </TabsTrigger>
          <TabsTrigger value="portal">
            <Palette className="h-4 w-4 mr-2" />
            Portal
            {hasPortalOverride && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Custom
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Realm Tab */}
        <TabsContent value="realm" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Cor do Reino</CardTitle>
              </div>
              <CardDescription>
                Define a cor padrão para todos os portais do reino "{realm.name}".
                Esta mudança afetará todos os portais que não têm customização própria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="realmBrandColor">Cor Principal</Label>
                    <Input
                      id="realmBrandColor"
                      type="color"
                      value={realmBrandColor}
                      onChange={(e) => setRealmBrandColorState(e.target.value)}
                      className="h-12 w-full cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Valor Hexadecimal</Label>
                    <Input
                      type="text"
                      value={realmBrandColor}
                      onChange={(e) => setRealmBrandColorState(e.target.value)}
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
                            backgroundColor: realmBrandColor,
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

              <div className="flex justify-end">
                <Button onClick={handleSaveRealmColor}>
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar a Todos os Portais do Reino
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portal Tab */}
        <TabsContent value="portal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Cor do Portal</CardTitle>
                </div>
                {hasPortalOverride && (
                  <Badge variant="secondary">Customizado</Badge>
                )}
              </div>
              <CardDescription>
                Customize a cor apenas para este portal.
                {hasPortalOverride
                  ? ' Este portal está usando uma cor personalizada.'
                  : ' Este portal está usando a cor do reino.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="portalBrandColor">Cor Principal</Label>
                    <Input
                      id="portalBrandColor"
                      type="color"
                      value={portalBrandColor}
                      onChange={(e) => setPortalBrandColorState(e.target.value)}
                      className="h-12 w-full cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Valor Hexadecimal</Label>
                    <Input
                      type="text"
                      value={portalBrandColor}
                      onChange={(e) => setPortalBrandColorState(e.target.value)}
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
                            backgroundColor: portalBrandColor,
                            opacity: shade === 500 ? 1 : shade < 500 ? shade / 500 : (1000 - shade) / 500
                          }}
                        />
                        <p className="text-xs text-center text-muted-foreground">{shade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {hasPortalOverride && (
                  <Button
                    variant="outline"
                    onClick={handleRemovePortalOverride}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Customização
                  </Button>
                )}
                <Button onClick={handleSavePortalColor}>
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar Somente a Este Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
