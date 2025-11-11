import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tokenStorage } from '@/services/tokenStorage';

export interface IconUploaderProps {
  scope: 'realm' | 'portal';
  scopeId: string;
  iconType: 'favicon' | 'pwa-192' | 'pwa-512' | 'apple-touch';
  label: string;
  description: string;
  currentUrl?: string;
  onUploadComplete?: (url: string) => void;
  onDelete?: () => void;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ICON_SPECS = {
  'favicon': {
    accept: '.ico,.png',
    maxSize: 2 * 1024 * 1024, // 2MB
    expectedSize: 'multi' as const,
    sizeLabel: '16-48px'
  },
  'pwa-192': {
    accept: '.png,.jpg,.jpeg',
    maxSize: 2 * 1024 * 1024,
    expectedSize: { width: 192, height: 192 },
    sizeLabel: '192x192px'
  },
  'pwa-512': {
    accept: '.png,.jpg,.jpeg',
    maxSize: 2 * 1024 * 1024,
    expectedSize: { width: 512, height: 512 },
    sizeLabel: '512x512px'
  },
  'apple-touch': {
    accept: '.png,.jpg,.jpeg',
    maxSize: 2 * 1024 * 1024,
    expectedSize: { width: 180, height: 180 },
    sizeLabel: '180x180px'
  }
};

export function IconUploader({
  scope,
  scopeId,
  iconType,
  label,
  description,
  currentUrl,
  onUploadComplete,
  onDelete
}: IconUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const spec = ICON_SPECS[iconType];

  // Valida arquivo
  const validateFile = (file: File): ValidationResult => {
    // Validar tamanho
    if (file.size > spec.maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${spec.maxSize / 1024 / 1024}MB`
      };
    }

    // Validar tipo
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!spec.accept.includes(fileExt)) {
      return {
        valid: false,
        error: `Formato inválido. Aceito: ${spec.accept.replace(/\./g, '').toUpperCase()}`
      };
    }

    return { valid: true };
  };

  // Valida dimensões da imagem
  const validateDimensions = (file: File): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      if (spec.expectedSize === 'multi') {
        // Favicon não precisa validar dimensões exatas
        resolve({ valid: true });
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const expected = spec.expectedSize as { width: number; height: number };
        if (img.width !== expected.width || img.height !== expected.height) {
          resolve({
            valid: false,
            error: `Dimensões inválidas. Esperado: ${expected.width}x${expected.height}px, Recebido: ${img.width}x${img.height}px`
          });
        } else {
          resolve({ valid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error: 'Não foi possível ler a imagem'
        });
      };

      img.src = url;
    });
  };

  // Faz upload do arquivo
  const uploadFile = async (file: File) => {
    setError(null);
    setSuccess(false);
    setIsUploading(true);

    try {
      // Validar arquivo
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        setError(fileValidation.error!);
        setIsUploading(false);
        return;
      }

      // Validar dimensões
      const dimensionValidation = await validateDimensions(file);
      if (!dimensionValidation.valid) {
        setError(dimensionValidation.error!);
        setIsUploading(false);
        return;
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scope', scope);
      formData.append('scopeId', scopeId);
      formData.append('iconType', iconType);

      // Obter token JWT
      const token = tokenStorage.getAccessToken();

      // Upload
      const response = await fetch('/api/1/assets/icons', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao fazer upload');
      }

      // Atualizar preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setSuccess(true);

      // Callback
      if (onUploadComplete) {
        onUploadComplete(result.data.url);
      }

      // Limpar sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Deleta ícone
  const handleDelete = async () => {
    setError(null);
    setSuccess(false);
    setIsUploading(true);

    try {
      // Obter token JWT
      const token = tokenStorage.getAccessToken();

      const response = await fetch('/api/1/assets/icons', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          scope,
          scopeId,
          iconType
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao deletar');
      }

      setPreview(null);
      setSuccess(true);

      if (onDelete) {
        onDelete();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar ícone');
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers de drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // Handler de input file
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {preview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-destructive',
          success && 'border-green-500'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={spec.accept}
            className="hidden"
            onChange={handleFileInput}
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Enviando...</p>
              </>
            ) : preview ? (
              <>
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                  <img
                    src={preview}
                    alt={label}
                    className="h-full w-full object-contain"
                  />
                </div>
                {success && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <p className="text-xs font-medium">Salvo!</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                  {iconType === 'favicon' ? (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Arraste ou clique para enviar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {spec.accept.replace(/\./g, '').toUpperCase()} · {spec.sizeLabel}
                  </p>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-2 text-xs text-destructive text-center">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
