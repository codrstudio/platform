// Text Fields Editor Component
// Editor de textos do login (título, subtítulo, rodapé)

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { LoginBrandingConfig } from '@/types/login-branding';
import { DEFAULT_LOGIN_BRANDING, LOGIN_BRANDING_LIMITS } from '@/types/login-branding';

interface TextFieldsEditorProps {
  /** Textos atuais */
  texts: LoginBrandingConfig['texts'];

  /** Callback quando textos mudam */
  onChange: (texts: LoginBrandingConfig['texts']) => void;

  /** Desabilita edição */
  disabled?: boolean;
}

/**
 * Editor de textos da página de login
 * Permite customizar título, subtítulo e rodapé
 */
export function TextFieldsEditor({
  texts,
  onChange,
  disabled = false,
}: TextFieldsEditorProps) {
  const maxLength = LOGIN_BRANDING_LIMITS.texts.maxLength;

  const handleChange = (field: keyof LoginBrandingConfig['texts'], value: string) => {
    onChange({
      ...texts,
      [field]: value,
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_LOGIN_BRANDING.texts);
  };

  const isDefault = (
    texts.title === DEFAULT_LOGIN_BRANDING.texts.title &&
    texts.subtitle === DEFAULT_LOGIN_BRANDING.texts.subtitle &&
    texts.footer === DEFAULT_LOGIN_BRANDING.texts.footer
  );

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-title">Título</Label>
          <span className="text-xs text-muted-foreground">
            {texts.title.length}/{maxLength}
          </span>
        </div>
        <Input
          id="text-title"
          value={texts.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={maxLength}
          placeholder={DEFAULT_LOGIN_BRANDING.texts.title}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Título principal exibido acima do formulário de login
        </p>
      </div>

      {/* Subtítulo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-subtitle">Subtítulo</Label>
          <span className="text-xs text-muted-foreground">
            {texts.subtitle.length}/{maxLength}
          </span>
        </div>
        <Input
          id="text-subtitle"
          value={texts.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          maxLength={maxLength}
          placeholder={DEFAULT_LOGIN_BRANDING.texts.subtitle}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Texto secundário abaixo do título
        </p>
      </div>

      {/* Rodapé */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-footer">Rodapé</Label>
          <span className="text-xs text-muted-foreground">
            {texts.footer.length}/{maxLength}
          </span>
        </div>
        <Input
          id="text-footer"
          value={texts.footer}
          onChange={(e) => handleChange('footer', e.target.value)}
          maxLength={maxLength}
          placeholder={DEFAULT_LOGIN_BRANDING.texts.footer}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Texto no rodapé da página (ex: versão ou copyright)
        </p>
      </div>

      {/* Botão Resetar */}
      {!isDefault && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar para padrão
          </Button>
        </div>
      )}
    </div>
  );
}
