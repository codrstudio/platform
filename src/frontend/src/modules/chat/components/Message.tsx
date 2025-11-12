/**
 * Message Component
 *
 * Individual message display with markdown rendering.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-011 to F-014: Content rendering
 * - SPEC-CHAT-R-001: Markdown rendering with Mermaid diagrams
 * - SPEC-CHAT-F-014: HTML sanitization for security
 *
 * Features:
 * - Markdown rendering with react-markdown
 * - Mermaid diagram support
 * - Base64 image support
 * - Copy-to-clipboard functionality
 * - Dark mode support
 */

import { Bot, User, Info, CheckCircle, AlertCircle, Clock, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message as MessageType } from '../types';
import { format } from 'date-fns';
import { useState } from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MermaidBlock } from './MermaidBlock';
import { sanitizeUrl } from '../utils/sanitize';

export interface MessageProps {
  message: MessageType;
  showTimestamp?: boolean;
  className?: string;
}

/**
 * Message component
 *
 * Renders individual messages with role-based styling and Markdown rendering.
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
  const [copied, setCopied] = useState(false);

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = message.content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      <div className={cn('flex-1 space-y-1 min-w-0', isUser && 'flex flex-col items-end')}>
        {/* Message content with Markdown */}
        <div
          className={cn(
            'rounded-lg px-4 py-2 max-w-2xl break-words',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-muted rounded-tl-none'
          )}
        >
          {/* Markdown rendering with Mermaid support */}
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              urlTransform={(url) => {
                // Allow data: URIs for base64 images, validate other URLs
                if (url.startsWith('data:')) return url;
                return sanitizeUrl(url) || defaultUrlTransform(url);
              }}
              components={{
                // Code blocks - detect language-mermaid
                code(props) {
                  const { node, className, children, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const inline = !className;

                  // Render Mermaid if code block with language-mermaid
                  if (!inline && language === 'mermaid') {
                    return <MermaidBlock code={String(children).trim()} />;
                  }

                  // Inline code or other languages
                  return (
                    <code
                      className={cn(
                        className,
                        'px-1 rounded',
                        isUser
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted-foreground/20'
                      )}
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
                // Inline images (URLs, base64, etc)
                img({ src, alt, ...props }) {
                  return (
                    <img
                      src={src}
                      alt={alt || 'Chat image'}
                      className="inline-block max-w-full my-2 rounded shadow-sm"
                      loading="lazy"
                      {...props}
                    />
                  );
                },
                // Style elements for user messages to maintain visibility
                p: ({ children }) => (
                  <p className={isUser ? 'text-primary-foreground' : ''}>{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className={isUser ? 'text-primary-foreground font-bold' : 'font-bold'}>
                    {children}
                  </strong>
                ),
                li: ({ children }) => (
                  <li className={isUser ? 'text-primary-foreground' : ''}>{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 className={cn('font-bold text-lg', isUser && 'text-primary-foreground')}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className={cn('font-bold text-base', isUser && 'text-primary-foreground')}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className={cn('font-semibold text-sm', isUser && 'text-primary-foreground')}>
                    {children}
                  </h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
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

        {/* Action Bar: Timestamp + Copy Button + Status */}
        <div className={cn('flex items-center gap-2 px-1', isUser ? 'justify-end' : 'justify-start')}>
          {/* Copy button for AI messages (left side) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              title={copied ? 'Copiado!' : 'Copiar'}
              aria-label={copied ? 'Copiado' : 'Copiar mensagem'}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          )}

          {/* Status Icon */}
          <StatusIcon />

          {/* Copy button for user messages (right side) */}
          {isUser && (
            <button
              onClick={handleCopy}
              title={copied ? 'Copiado!' : 'Copiar'}
              aria-label={copied ? 'Copiado' : 'Copiar mensagem'}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
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
