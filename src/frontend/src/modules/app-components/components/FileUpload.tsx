/**
 * FileUpload - Componente de upload de arquivos com react-dropzone
 *
 * Wrapper pronto para uso com drag & drop, preview e validação.
 */

import { useCallback } from 'react';
import { useDropzone, type DropzoneOptions } from '../dropzone';
import { cn } from '@/lib/utils';
import { UploadCloud, File, X } from 'lucide-react';

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (files: File[]) => void;
  maxSize?: number;
  maxFiles?: number;
  accept?: DropzoneOptions['accept'];
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesAccepted,
  onFilesRejected,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  accept,
  multiple = true,
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
      if (rejectedFiles.length > 0 && onFilesRejected) {
        onFilesRejected(rejectedFiles.map((f) => f.file));
      }
    },
    [onFilesAccepted, onFilesRejected]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } =
    useDropzone({
      onDrop,
      maxSize,
      maxFiles,
      accept,
      multiple,
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-sm">Solte os arquivos aqui...</p>
        ) : (
          <div>
            <p className="text-sm mb-1">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo {formatFileSize(maxSize)} por arquivo
            </p>
          </div>
        )}
      </div>

      {/* Accepted files */}
      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Arquivos selecionados:</p>
          <div className="space-y-1">
            {acceptedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected files */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">Arquivos rejeitados:</p>
          <div className="space-y-1">
            {fileRejections.map(({ file, errors }, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-destructive/10"
              >
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-destructive">
                    {errors.map((e) => e.message).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
