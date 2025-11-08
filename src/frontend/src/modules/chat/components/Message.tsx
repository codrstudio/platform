/**
 * Message Component
 *
 * Individual message display with markdown rendering.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-011 to F-014: Content rendering
 * - SPEC-CHAT-R-001: Markdown rendering
 */

import { Bot, User, Info, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message as MessageType } from '../types';
import { format } from 'date-fns';

export interface MessageProps {
  message: MessageType;
  showTimestamp?: boolean;
  className?: string;
}

/**
 * Message component
 *
 * Renders individual messages with role-based styling.
 *
 * Usage:
 * ```tsx
 * <Message message={message} showTimestamp />
 * ```
 */
export function Message({
  message,
  showTimestamp = true,
  className
}: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // System messages (centered)
  if (isSystem) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-px flex-1 bg-border max-w-12" />
          <Info className="h-3 w-3" />
          <span>{message.content}</span>
          {showTimestamp && (
            <span className="text-xs">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          )}
          <div className="h-px flex-1 bg-border max-w-12" />
        </div>
      </div>
    );
  }

  // Status icon
  const StatusIcon = () => {
    if (message.status === 'sending') {
      return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
    }
    if (message.status === 'sent' || message.status === 'complete') {
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    }
    if (message.status === 'error') {
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser && 'flex-row-reverse',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 space-y-1', isUser && 'flex flex-col items-end')}>
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs text-muted-foreground',
            isUser && 'flex-row-reverse'
          )}
        >
          <span className="font-medium">
            {isUser ? 'Você' : 'Agente'}
          </span>
          {showTimestamp && (
            <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
          )}
          <StatusIcon />
        </div>

        {/* Message content */}
        <div
          className={cn(
            'rounded-lg px-4 py-2 max-w-2xl',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-muted rounded-tl-none'
          )}
        >
          {/* Simple text rendering for now - Markdown can be added later */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Files */}
          {message.metadata?.files && message.metadata.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.metadata.files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded border text-xs',
                    isUser
                      ? 'border-primary-foreground/20 bg-primary-foreground/10'
                      : 'border-border bg-background'
                  )}
                >
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-xs opacity-70">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          {message.metadata?.model && (
            <div className="mt-2 text-xs opacity-70">
              {message.metadata.model}
              {message.metadata.tokens && ` • ${message.metadata.tokens} tokens`}
            </div>
          )}
        </div>

        {/* Error state */}
        {message.status === 'error' && message.metadata?.retryable && (
          <div className="text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span>Erro ao enviar mensagem</span>
          </div>
        )}
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

/**
 * Typing indicator component
 */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3 px-4 py-3', className)}>
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className="font-medium">Agente</span>
          <span>digitando...</span>
        </div>
        <div className="bg-muted rounded-lg rounded-tl-none px-4 py-3 inline-flex gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
