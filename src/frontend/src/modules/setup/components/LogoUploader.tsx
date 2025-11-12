// Logo Uploader Component
// Upload de logo com controle de altura

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { LOGIN_BRANDING_LIMITS, validateLogoFile } from '@/types/login-branding';
import { cn } from '@/lib/utils';

interface LogoUploaderProps {
  /** URL atual da logo (ou null) */
  logoUrl: string | null;

  /** Altura atual da logo (40-120px) */
  logoHeight: number;

  /** Callback quando logo é carregada */
  onLogoChange: (url: string | null) => void;

  /** Callback quando altura muda */
  onHeightChange: (height: number) => void;

  /** Desabilita edição */
  disabled?: boolean;
}

/**
 * Uploader de logo com controle de altura
 */
export function LogoUploader({
  logoUrl,
  logoHeight,
  onLogoChange,
  onHeightChange,
  disabled = false,
}: LogoUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validar arquivo
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido');
      return;
    }

    // Converter para Data URL (para preview)
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onLogoChange(dataUrl);
    };
    reader.readAsDataURL(file);

    // TODO FASE 5: Fazer upload para backend e obter URL real
    // const formData = new FormData();
    // formData.append('logo', file);
    // const response = await fetch(`/api/upload/login-logo/${realmId}`, {
    //   method: 'POST',
    //   body: formData
    // });
    // const { url } = await response.json();
    // onLogoChange(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onLogoChange(null);
    setError(null);
  };

  const { min, max, step } = LOGIN_BRANDING_LIMITS.logoHeight;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div>
        <Label className="text-sm font-medium">Logo</Label>
        <p className="text-xs text-muted-foreground mb-3">
          PNG, JPG ou SVG. Máximo 2MB.
        </p>

        {logoUrl ? (
          /* Logo Preview */
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border rounded-md flex items-center justify-center bg-muted/50">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo carregada</p>
                    <p className="text-xs text-muted-foreground">
                      Altura: {logoHeight}px
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Upload Dropzone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Arraste a logo aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
              <input
                type="file"
                accept={LOGIN_BRANDING_LIMITS.logoFile.allowedExtensions.join(',')}
                onChange={handleFileInput}
                disabled={disabled}
                className="hidden"
                id="logo-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={disabled}
                type="button"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Height Slider */}
      {logoUrl && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Altura da Logo</Label>
            <span className="text-sm text-muted-foreground">
              {logoHeight}px
            </span>
          </div>
          <Slider
            value={[logoHeight]}
            onValueChange={([value]) => onHeightChange(value)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{min}px</span>
            <span className="text-xs text-muted-foreground">{max}px</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ajuste a altura para logos quadradas ou horizontais
          </p>
        </div>
      )}
    </div>
  );
}
