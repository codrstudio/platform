// Login Branding Editor Component
// Editor completo de branding do login com preview em tempo real

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Palette, Type, Image, Save, RotateCcw, Info } from 'lucide-react';
import type { LoginBrandingConfig } from '@/types/login-branding';
import type { BrandColor } from '@/types/theme';
import {
  getLoginBranding,
  setLoginBranding,
  getLoginBrandColor,
  resetLoginBranding,
} from '@/lib/login-branding';
import { getStoredBrandColor, applyBrandColor } from '@/lib/theme';
import { LoginPreview } from './LoginPreview';
import { BrandColorSelector } from './BrandColorSelector';
import { LogoUploader } from './LogoUploader';
import { TextFieldsEditor } from './TextFieldsEditor';
import { IconUploader } from './IconUploader';
import { toast } from 'sonner';

interface LoginBrandingEditorProps {
  /** ID do realm */
  realmId: string;

  /** ID do portal (opcional, para resolver cor do tema) */
  portalId?: string;

  /** Callback quando editor é fechado */
  onClose?: () => void;
}

/**
 * Editor completo de branding da página de login
 * Layout resizable com preview à esquerda e controles à direita
 */
export function LoginBrandingEditor({
  realmId,
  portalId,
  onClose,
}: LoginBrandingEditorProps) {
  // Estado do editor
  const [config, setConfig] = useState<LoginBrandingConfig>(() =>
    getLoginBranding(realmId)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cor do tema (para exibição)
  const themeColor = getStoredBrandColor(realmId, portalId);

  // Sincroniza mudanças
  useEffect(() => {
    const original = getLoginBranding(realmId);
    const changed = JSON.stringify(config) !== JSON.stringify(original);
    setHasChanges(changed);
  }, [config, realmId]);

  // Handlers
  const handleConfigChange = (updated: LoginBrandingConfig) => {
    setConfig(updated);

    // Aplica brand color em tempo real para preview
    const brandColor = updated.useBrandColorFromTheme
      ? themeColor
      : updated.brandColorOverride || themeColor;

    applyBrandColor(brandColor);
  };

  const handleBrandColorModeChange = (useTheme: boolean) => {
    handleConfigChange({
      ...config,
      useBrandColorFromTheme: useTheme,
      brandColorOverride: useTheme ? null : config.brandColorOverride || themeColor,
    });
  };

  const handleBrandColorChange = (color: BrandColor) => {
    handleConfigChange({
      ...config,
      brandColorOverride: color,
    });
  };

  const handleLogoChange = (url: string | null) => {
    handleConfigChange({
      ...config,
      logoUrl: url,
    });
  };

  const handleLogoHeightChange = (height: number) => {
    handleConfigChange({
      ...config,
      logoHeight: height,
    });
  };

  const handleTextsChange = (texts: LoginBrandingConfig['texts']) => {
    handleConfigChange({
      ...config,
      texts,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Salvar configuração
      setLoginBranding(realmId, config);

      // Sucesso
      toast.success('Configuração salva', {
        description: 'Branding do login atualizado com sucesso',
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      // TODO: mostrar erro
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Tem certeza que deseja resetar todas as configurações para o padrão?'
      )
    ) {
      resetLoginBranding(realmId);
      setConfig(getLoginBranding(realmId));
      toast.info('Configuração resetada', {
        description: 'Voltou aos valores padrão',
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Personalização da Página de Login</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customize a aparência da tela de login com sua marca
            </p>
          </div>
          {hasChanges && (
            <Alert className="w-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>Alterações não salvas</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Content: Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Preview Panel */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full overflow-auto">
              <LoginPreview config={config} onChange={handleConfigChange} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Controls Panel */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full overflow-auto p-6">
              <Tabs defaultValue="appearance" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="appearance">
                    <Palette className="h-4 w-4 mr-2" />
                    Aparência
                  </TabsTrigger>
                  <TabsTrigger value="texts">
                    <Type className="h-4 w-4 mr-2" />
                    Textos
                  </TabsTrigger>
                  <TabsTrigger value="icons">
                    <Image className="h-4 w-4 mr-2" />
                    Ícones
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Aparência */}
                <TabsContent value="appearance" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Brand Color</CardTitle>
                      <CardDescription>
                        Cor principal da página de login
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BrandColorSelector
                        useThemeColor={config.useBrandColorFromTheme}
                        themeColor={themeColor}
                        customColor={config.brandColorOverride}
                        onModeChange={handleBrandColorModeChange}
                        onCustomColorChange={handleBrandColorChange}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Logo</CardTitle>
                      <CardDescription>
                        Logo marca exibida na página de login
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LogoUploader
                        logoUrl={config.logoUrl}
                        logoHeight={config.logoHeight}
                        onLogoChange={handleLogoChange}
                        onHeightChange={handleLogoHeightChange}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Textos */}
                <TabsContent value="texts" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Textos do Login</CardTitle>
                      <CardDescription>
                        Personalize os textos exibidos na página
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TextFieldsEditor
                        texts={config.texts}
                        onChange={handleTextsChange}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Ícones */}
                <TabsContent value="icons" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ícones do Aplicativo</CardTitle>
                      <CardDescription>
                        Ícones do navegador e PWA (herdados do ambiente)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        <IconUploader
                          scope="realm"
                          scopeId={realmId}
                          iconType="favicon"
                          label="Favicon"
                          description="16-48px · ICO, PNG"
                          readonly={false}
                          onUploadComplete={() => toast.success('Favicon atualizado')}
                          onDelete={() => toast.success('Favicon removido')}
                        />
                        <Separator />
                        <IconUploader
                          scope="realm"
                          scopeId={realmId}
                          iconType="pwa-192"
                          label="Ícone Pequeno"
                          description="192x192px · PNG"
                          readonly={false}
                          onUploadComplete={() => toast.success('Ícone atualizado')}
                          onDelete={() => toast.success('Ícone removido')}
                        />
                        <Separator />
                        <IconUploader
                          scope="realm"
                          scopeId={realmId}
                          iconType="pwa-512"
                          label="Ícone Grande"
                          description="512x512px · PNG"
                          readonly={false}
                          onUploadComplete={() => toast.success('Ícone atualizado')}
                          onDelete={() => toast.success('Ícone removido')}
                        />
                        <Separator />
                        <IconUploader
                          scope="realm"
                          scopeId={realmId}
                          iconType="apple-touch"
                          label="Apple Touch"
                          description="180x180px · PNG"
                          readonly={false}
                          onUploadComplete={() => toast.success('Ícone atualizado')}
                          onDelete={() => toast.success('Ícone removido')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer: Actions */}
      <div className="border-t p-4 flex items-center justify-between bg-background">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetar Tudo
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
