// Theme Config Page - Portal Theme Configuration
// Based on SPEC-theming.md and Realm System
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Save, Palette, Lock, RotateCcw, Image, AlertTriangle } from 'lucide-react';
import { usePortal, useRealm } from '@/hooks/useJQEL';
import { toastSuccess, toastInfo } from '@/lib/toast';
import { IconUploader } from '../components/IconUploader';
import { ThemeColorPicker } from '../components/ThemeColorPicker';
import {
  getStoredBrandColor,
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
  const realm = realmResult?.data?.[0];

  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const portalName = portal?.name || 'Portal';
    return [
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalName, href: `/setup/portals/${portalId}` },
      { label: 'Tema' }
    ];
  }, [portal?.name, portalId]);

  const [portalBrandColor, setPortalBrandColorState] = useState('#0ea5e9');
  const [hasPortalOverride, setHasPortalOverride] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);

  // Load current colors from localStorage
  useEffect(() => {
    if (portal && realm) {
      // Check if portal has override
      const hasOverride = hasPortalBrandColorOverride(portal.portalId);
      setHasPortalOverride(hasOverride);

      if (hasOverride) {
        // Load portal override color
        const portalColor = getStoredBrandColor(realm.realmId, portal.portalId);
        setPortalBrandColorState(hslToHex(portalColor));
      } else {
        // Use realm color (readonly)
        const realmColor = getStoredBrandColor(realm.realmId);
        setPortalBrandColorState(hslToHex(realmColor));
      }
    }
  }, [portal, realm]);

  const handleCustomizeTheme = () => {
    setShowCustomizeDialog(true);
  };

  const confirmCustomizeTheme = () => {
    if (!portal || !realm) return;

    // Create override with current realm color as starting point
    const currentColor = getStoredBrandColor(realm.realmId);
    setPortalBrandColor(portal.portalId, currentColor);
    setHasPortalOverride(true);

    toastInfo('Tema customizado ativado', {
      description: 'Agora você pode personalizar a cor deste portal'
    });

    setShowCustomizeDialog(false);
  };

  const handleSavePortalColor = () => {
    if (!portal) return;
    const hslColor = hexToHSL(portalBrandColor);
    setPortalBrandColor(portal.portalId, hslColor);
    toastSuccess('Tema customizado salvo', {
      description: 'A personalização foi aplicada somente a este portal'
    });
  };

  const handleRemovePortalOverride = () => {
    setShowRemoveDialog(true);
  };

  const confirmRemovePortalOverride = () => {
    if (!portal || !realm) return;
    removePortalBrandColor(portal.portalId);
    setHasPortalOverride(false);

    // Reset to realm color
    const realmColor = getStoredBrandColor(realm.realmId);
    setPortalBrandColorState(hslToHex(realmColor));

    toastSuccess('Tema customizado removido', {
      description: 'O portal voltou a usar o tema do ambiente'
    });

    setShowRemoveDialog(false);
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
        <p>Portal ou Ambiente não encontrado</p>
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
            Tema do Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            {portal.name} (Ambiente: {realm.name})
          </p>
        </div>
      </div>
      {/* Theme Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasPortalOverride ? (
                <Palette className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-primary" />
              )}
              <CardTitle>Tema do Portal</CardTitle>
            </div>
            {hasPortalOverride ? (
              <Badge variant="default" className="gap-1">
                <Palette className="h-3 w-3" />
                Tema Customizado
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Tema do Ambiente
              </Badge>
            )}
          </div>
          <CardDescription>
            {hasPortalOverride ? (
              <>Este portal possui tema customizado, independente do ambiente "{realm.name}".</>
            ) : (
              <>Este portal está usando o tema configurado no ambiente "{realm.name}". As configurações abaixo são somente leitura.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasPortalOverride && (
            <Card className="bg-muted/50 border-muted">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm font-medium">Tema Herdado do Ambiente</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Este portal está usando o tema configurado no ambiente "{realm.name}".
                        As configurações abaixo são somente leitura.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <ThemeColorPicker
            value={portalBrandColor}
            onChange={hasPortalOverride ? setPortalBrandColorState : undefined}
            label={hasPortalOverride ? "Cor do Portal" : "Cor do Ambiente (Somente Leitura)"}
            readonly={!hasPortalOverride}
            locked={!hasPortalOverride}
            showPalette={true}
          />

          {hasPortalOverride && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleRemovePortalOverride}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Voltar ao Tema do Ambiente
              </Button>
              <Button onClick={handleSavePortalColor}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Tema Customizado
              </Button>
            </div>
          )}

          {!hasPortalOverride && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button onClick={handleCustomizeTheme} size="lg">
                  <Palette className="h-4 w-4 mr-2" />
                  Customizar Tema deste Portal
                </Button>
              </div>
              <Card className="bg-muted/50 border-muted">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Atenção</p>
                      <p className="text-sm text-muted-foreground">
                        Ao customizar, este portal terá tema independente do ambiente.
                        Alterações no tema do ambiente não afetarão este portal.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Icons Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle>Ícones do Aplicativo</CardTitle>
          </div>
          <CardDescription>
            {hasPortalOverride ? (
              <>Personalize os ícones apenas para este portal, sobrescrevendo os ícones do ambiente.</>
            ) : (
              <>Ícones herdados do ambiente "{realm.name}". Customize o tema do portal para personalizar os ícones.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <IconUploader
              scope={hasPortalOverride ? "portal" : "realm"}
              scopeId={hasPortalOverride ? portal.portalId : realm.realmId}
              iconType="favicon"
              label="Favicon"
              description="16-48px · ICO, PNG"
              readonly={!hasPortalOverride}
              onUploadComplete={() => toastSuccess('Favicon atualizado')}
              onDelete={() => toastSuccess('Favicon removido')}
            />
            <IconUploader
              scope={hasPortalOverride ? "portal" : "realm"}
              scopeId={hasPortalOverride ? portal.portalId : realm.realmId}
              iconType="pwa-192"
              label="Ícone Pequeno"
              description="192x192px · PNG"
              readonly={!hasPortalOverride}
              onUploadComplete={() => toastSuccess('Ícone atualizado')}
              onDelete={() => toastSuccess('Ícone removido')}
            />
            <IconUploader
              scope={hasPortalOverride ? "portal" : "realm"}
              scopeId={hasPortalOverride ? portal.portalId : realm.realmId}
              iconType="pwa-512"
              label="Ícone Grande"
              description="512x512px · PNG"
              readonly={!hasPortalOverride}
              onUploadComplete={() => toastSuccess('Ícone atualizado')}
              onDelete={() => toastSuccess('Ícone removido')}
            />
            <IconUploader
              scope={hasPortalOverride ? "portal" : "realm"}
              scopeId={hasPortalOverride ? portal.portalId : realm.realmId}
              iconType="apple-touch"
              label="Apple Touch"
              description="180x180px · PNG"
              readonly={!hasPortalOverride}
              onUploadComplete={() => toastSuccess('Ícone atualizado')}
              onDelete={() => toastSuccess('Ícone removido')}
            />
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
      {/* Customize Theme Dialog */}
      <AlertDialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Customizar tema deste portal?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao ativar a customização, este portal terá tema independente do ambiente "{realm.name}".
              Alterações futuras no tema do ambiente não afetarão este portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCustomizeTheme}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Customization Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voltar ao tema do ambiente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a customização do portal?
              Ele voltará a usar o tema configurado no ambiente "{realm.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemovePortalOverride}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
