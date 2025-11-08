/**
 * MessageInput Component
 *
 * Input field for chat messages with auto-grow and file upload.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-001 to F-003: Interface requirements
 * - SPEC-CHAT-O-001 to O-005: File upload
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MessageInputProps {
  onSend: (message: string, files?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  maxRows?: number;
  allowFileUpload?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

/**
 * MessageInput component
 *
 * Auto-growing textarea with file upload support.
 *
 * Usage:
 * ```tsx
 * <MessageInput
 *   onSend={handleSendMessage}
 *   placeholder="Digite sua mensagem..."
 *   allowFileUpload
 * />
 * ```
 */
export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
  maxLength = 4000,
  maxRows = 5,
  allowFileUpload = false,
  acceptedFileTypes = ['image/*', 'application/pdf'],
  maxFileSize = 5242880, // 5MB
  className
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = maxRows * 24; // ~24px per row
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [message, maxRows]);

  // Handle send
  const handleSend = async () => {
    if ((!message.trim() && files.length === 0) || isSending || disabled) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(message, files.length > 0 ? files : undefined);
      setMessage('');
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Filter by accepted types
    const validFiles = selectedFiles.filter(file => {
      const isTypeValid = acceptedFileTypes.some(type => {
        const regex = new RegExp(type.replace('*', '.*'));
        return regex.test(file.type);
      });
      const isSizeValid = file.size <= maxFileSize;

      if (!isTypeValid) {
        console.warn(`File ${file.name} has invalid type`);
      }
      if (!isSizeValid) {
        console.warn(`File ${file.name} exceeds size limit`);
      }

      return isTypeValid && isSizeValid;
    });

    setFiles(prev => [...prev, ...validFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || files.length > 0) && !disabled && !isSending;

  return (
    <div className={cn('border-t bg-background', className)}>
      {/* Attached files */}
      {files.length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          <p className="text-xs text-muted-foreground">Arquivos anexados:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted rounded-lg"
            >
              <File className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFile(index)}
                disabled={disabled || isSending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 flex items-end gap-2">
        {/* File upload button */}
        {allowFileUpload && (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isSending}
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          maxLength={maxLength}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg border bg-background px-3 py-2',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[40px] max-h-[120px] overflow-y-auto'
          )}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hint */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>💡 Shift+Enter para nova linha • Enter para enviar</span>
        <span>
          {message.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
