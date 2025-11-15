// Realm Edit Page - Environment Configuration
// Configures theme and icons for an entire realm (environment)
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Globe, Image, Sun, Moon, Monitor, Lock, Palette } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealm } from '@/hooks/jqel/useRealm';
import { usePortals } from '@/hooks/jqel/usePortal';
import { useTheme } from '@/contexts/ThemeContext';
import { toastSuccess } from '@/lib/toast';
import { IconUploader } from '../components/IconUploader';
import { ThemeColorPicker } from '../components/ThemeColorPicker';
import {
  getStoredBrandColor,
  setStoredBrandColor,
  hasPortalBrandColorOverride,
  hexToHSL,
  hslToHex
} from '@/lib/theme';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';

export function RealmEdit() {
  const { realmId } = useParams<{ realmId: string }>();
  const navigate = useNavigate();
  const { data: realmResult, isLoading: realmLoading } = useRealm(realmId || '');
  const realm = realmResult?.data?.[0];
  const { data: portalsResult, isLoading: portalsLoading } = usePortals();
  const allPortals = portalsResult?.data || [];

  const { mode, setMode } = useTheme();

  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const realmName = realm?.name || 'Ambiente';
    return [
      { label: 'Setup', href: '/setup' },
      { label: 'Ambientes', href: '/setup/realms' },
      { label: realmName }
    ];
  }, [realm?.name]);

  const [realmBrandColor, setRealmBrandColorState] = useState('#0ea5e9');

  // Filter portals that belong to this realm
  const realmPortals = useMemo(() => {
    return allPortals.filter(portal => portal.realmId === realmId);
  }, [allPortals, realmId]);

  // Load current color from localStorage
  useEffect(() => {
    if (realm) {
      const realmColor = getStoredBrandColor(realm.realmId);
      setRealmBrandColorState(hslToHex(realmColor));
    }
  }, [realm]);

  const handleSaveRealmColor = () => {
    if (!realm) return;
    const hslColor = hexToHSL(realmBrandColor);
    setStoredBrandColor(realm.realmId, hslColor);
    toastSuccess('Configurações salvas', {
      description: 'As alterações foram aplicadas a todos os portais do ambiente'
    });
  };

  if (realmLoading || portalsLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando configurações do ambiente...</p>
      </div>
    );
  }

  if (!realm) {
    return (
      <div className="container mx-auto p-6">
        <p>Ambiente não encontrado</p>
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
          onClick={() => navigate('/setup/realms')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuração do Ambiente
          </h1>
          <p className="text-muted-foreground mt-2">
            {realm.name}
          </p>
        </div>
      </div>

      {/* Realm Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Informações do Ambiente</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Nome</Label>
              <p className="text-sm text-muted-foreground">{realm.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{realm.realmId}</p>
            </div>
          </div>
          {realm.description && (
            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <p className="text-sm text-muted-foreground">{realm.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Mode Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle>Modo de Tema</CardTitle>
          </div>
          <CardDescription>
            Defina o modo de visualização para todos os portais do ambiente "{realm.name}".
            Esta configuração será aplicada globalmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <RadioGroup value={mode} onValueChange={setMode} className="grid gap-4">
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="light" id="theme-light" />
                <Label
                  htmlFor="theme-light"
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Tema Claro</span>
                    <span className="text-sm text-muted-foreground">
                      Interface com fundo claro
                    </span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label
                  htmlFor="theme-dark"
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <Moon className="h-5 w-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Tema Escuro</span>
                    <span className="text-sm text-muted-foreground">
                      Interface com fundo escuro
                    </span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="system" id="theme-system" />
                <Label
                  htmlFor="theme-system"
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <Monitor className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Seguir Sistema</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs">
                            Padrão
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            O tema será ajustado automaticamente de acordo com a preferência
                            do sistema operacional (claro durante o dia, escuro à noite).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Adapta-se automaticamente ao SO
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </TooltipProvider>

          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>
              <strong>Dica:</strong> Use o atalho <kbd className="px-2 py-1 bg-background rounded border text-xs font-mono">Ctrl+Shift+D</kbd> para alternar rapidamente entre os temas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Brand Color Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Tema do Ambiente</CardTitle>
          </div>
          <CardDescription>
            Define a cor padrão para todos os portais do ambiente "{realm.name}".
            Esta mudança afetará todos os portais que não têm customização própria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ThemeColorPicker
            value={realmBrandColor}
            onChange={setRealmBrandColorState}
            label="Cor do Ambiente"
            showPalette={true}
          />

          <div className="flex justify-end">
            <Button onClick={handleSaveRealmColor}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações do Ambiente
            </Button>
          </div>
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
            Personalize os ícones que aparecem quando o aplicativo é instalado.
            Estas configurações serão aplicadas a todos os portais do ambiente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <IconUploader
              scope="realm"
              scopeId={realm.realmId}
              iconType="favicon"
              label="Favicon"
              description="16-48px · ICO, PNG"
              onUploadComplete={() => toastSuccess('Favicon atualizado')}
              onDelete={() => toastSuccess('Favicon removido')}
            />
            <IconUploader
              scope="realm"
              scopeId={realm.realmId}
              iconType="pwa-192"
              label="Ícone Pequeno"
              description="192x192px · PNG"
              onUploadComplete={() => toastSuccess('Ícone atualizado')}
              onDelete={() => toastSuccess('Ícone removido')}
            />
            <IconUploader
              scope="realm"
              scopeId={realm.realmId}
              iconType="pwa-512"
              label="Ícone Grande"
              description="512x512px · PNG"
              onUploadComplete={() => toastSuccess('Ícone atualizado')}
              onDelete={() => toastSuccess('Ícone removido')}
            />
            <IconUploader
              scope="realm"
              scopeId={realm.realmId}
              iconType="apple-touch"
              label="Apple Touch"
              description="180x180px · PNG"
              onUploadComplete={() => toastSuccess('Ícone atualizado')}
              onDelete={() => toastSuccess('Ícone removido')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Portals in this Realm */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Portais neste Ambiente</CardTitle>
          </div>
          <CardDescription>
            Portais que pertencem ao ambiente "{realm.name}".
            Cada portal pode usar o tema do ambiente ou ter um tema customizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {realmPortals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum portal encontrado neste ambiente.
            </p>
          ) : (
            <div className="space-y-3">
              {realmPortals.map(portal => {
                const hasCustomTheme = hasPortalBrandColorOverride(portal.portalId);

                return (
                  <div
                    key={portal.portalId}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/setup/portals/${portal.portalId}/theme`)}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{portal.name}</p>
                        <p className="text-sm text-muted-foreground">{portal.portalId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasCustomTheme ? (
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
