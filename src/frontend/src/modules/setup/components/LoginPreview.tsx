// Login Preview Component
// Preview da página de login com edição inline

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, EyeOff, Palette, Upload, Type } from 'lucide-react';
import type { LoginBrandingConfig } from '@/types/login-branding';
import { LoginThemeProvider } from '@/contexts/LoginThemeContext';
import { cn } from '@/lib/utils';

interface LoginPreviewProps {
  /** Configuração de branding */
  config: LoginBrandingConfig;

  /** ID do realm (para resolver brand color) */
  realmId: string;

  /** ID do portal (opcional, para resolver brand color) */
  portalId?: string;

  /** Callback quando configuração muda */
  onChange?: (config: LoginBrandingConfig) => void;

  /** Se true, preview é apenas visual (não editável) */
  readonly?: boolean;

  /** Classe CSS adicional */
  className?: string;
}

/**
 * Preview da página de login com edição inline
 * Clique nos elementos para editar
 */
export function LoginPreview({
  config,
  realmId,
  portalId,
  onChange,
  readonly = false,
  className,
}: LoginPreviewProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Estado local para controlar popovers
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Handlers de edição
  const handleTextChange = (field: keyof LoginBrandingConfig['texts'], value: string) => {
    if (!onChange) return;

    onChange({
      ...config,
      texts: {
        ...config.texts,
        [field]: value,
      },
    });
  };

  const handleLogoClick = () => {
    if (readonly) return;
    setOpenPopover('logo');
  };

  const handleTextClick = (field: string) => {
    if (readonly) return;
    setOpenPopover(field);
  };

  // Classes para elementos editáveis
  const editableClass = readonly
    ? ''
    : 'cursor-pointer hover:border-dashed hover:border-2 hover:border-primary/50 hover:bg-muted/20 transition-all rounded-md px-2 py-1';

  return (
    <LoginThemeProvider config={config} realmId={realmId} portalId={portalId}>
      <div className={cn('min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative', className)}>
      {/* Badge Preview Mode */}
      {!readonly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="default" className="gap-2">
            <Palette className="h-3 w-3" />
            PREVIEW - Clique para editar
          </Badge>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 mt-12">
        {/* Logo e Header */}
        <div className="text-center space-y-4">
          {/* Logo - Editável */}
          <Popover open={openPopover === 'logo'} onOpenChange={(open) => setOpenPopover(open ? 'logo' : null)}>
            <PopoverTrigger asChild>
              <div
                onClick={handleLogoClick}
                className={cn(
                  'flex justify-center',
                  editableClass
                )}
              >
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    style={{ height: `${config.logoHeight}px` }}
                    className="object-contain"
                  />
                ) : (
                  <div
                    className="bg-primary rounded-lg flex items-center justify-center"
                    style={{
                      width: `${config.logoHeight}px`,
                      height: `${config.logoHeight}px`,
                    }}
                  >
                    <span className="text-2xl font-bold text-primary-foreground">P</span>
                  </div>
                )}
              </div>
            </PopoverTrigger>
            {!readonly && (
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <h4 className="font-medium text-sm">Editar Logo</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clique no painel "Aparência" para fazer upload da logo
                  </p>
                </div>
              </PopoverContent>
            )}
          </Popover>

          {/* Título - Editável */}
          <Popover open={openPopover === 'title'} onOpenChange={(open) => setOpenPopover(open ? 'title' : null)}>
            <PopoverTrigger asChild>
              <h1
                onClick={() => handleTextClick('title')}
                className={cn(
                  'text-2xl font-bold',
                  editableClass
                )}
              >
                {config.texts.title}
              </h1>
            </PopoverTrigger>
            {!readonly && (
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <Label htmlFor="edit-title" className="text-sm font-medium">
                      Título
                    </Label>
                  </div>
                  <Input
                    id="edit-title"
                    value={config.texts.title}
                    onChange={(e) => handleTextChange('title', e.target.value)}
                    maxLength={100}
                    placeholder="Bem-vindo de volta"
                  />
                  <p className="text-xs text-muted-foreground">
                    {config.texts.title.length}/100 caracteres
                  </p>
                </div>
              </PopoverContent>
            )}
          </Popover>

          {/* Subtítulo - Editável */}
          <Popover open={openPopover === 'subtitle'} onOpenChange={(open) => setOpenPopover(open ? 'subtitle' : null)}>
            <PopoverTrigger asChild>
              <p
                onClick={() => handleTextClick('subtitle')}
                className={cn(
                  'text-sm text-muted-foreground',
                  editableClass
                )}
              >
                {config.texts.subtitle}
              </p>
            </PopoverTrigger>
            {!readonly && (
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <Label htmlFor="edit-subtitle" className="text-sm font-medium">
                      Subtítulo
                    </Label>
                  </div>
                  <Input
                    id="edit-subtitle"
                    value={config.texts.subtitle}
                    onChange={(e) => handleTextChange('subtitle', e.target.value)}
                    maxLength={100}
                    placeholder="Entre com suas credenciais"
                  />
                  <p className="text-xs text-muted-foreground">
                    {config.texts.subtitle.length}/100 caracteres
                  </p>
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>

        {/* Login Form (Visual apenas) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border">
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="preview-email">Email / Usuário *</Label>
              <Input
                id="preview-email"
                type="text"
                placeholder="usuario@email.com"
                disabled
                className="cursor-not-allowed"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="preview-password">Senha *</Label>
              <div className="relative">
                <Input
                  id="preview-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled
                  className="cursor-not-allowed pr-10"
                  defaultValue="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="preview-remember"
                type="checkbox"
                disabled
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-not-allowed"
              />
              <Label
                htmlFor="preview-remember"
                className="ml-2 text-sm font-normal cursor-not-allowed opacity-50"
              >
                Lembrar de mim
              </Label>
            </div>

            {/* Submit Button - Usa brand color */}
            <Button
              type="button"
              className="w-full"
              disabled
            >
              Entrar
            </Button>
          </div>
        </div>

        {/* Footer - Editável */}
        <Popover open={openPopover === 'footer'} onOpenChange={(open) => setOpenPopover(open ? 'footer' : null)}>
          <PopoverTrigger asChild>
            <p
              onClick={() => handleTextClick('footer')}
              className={cn(
                'text-center text-sm text-muted-foreground',
                editableClass
              )}
            >
              {config.texts.footer}
            </p>
          </PopoverTrigger>
          {!readonly && (
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <Label htmlFor="edit-footer" className="text-sm font-medium">
                    Rodapé
                  </Label>
                </div>
                <Input
                  id="edit-footer"
                  value={config.texts.footer}
                  onChange={(e) => handleTextChange('footer', e.target.value)}
                  maxLength={100}
                  placeholder="Plataforma Modular v1.0"
                />
                <p className="text-xs text-muted-foreground">
                  {config.texts.footer.length}/100 caracteres
                </p>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </div>
    </LoginThemeProvider>
  );
}
