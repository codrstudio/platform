/**
 * MarkdownViewer Component
 * SPEC-MARKBROWSER-F-006 to SPEC-MARKBROWSER-F-010
 * SPEC-MARKBROWSER-M-001 to SPEC-MARKBROWSER-M-011
 */

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { resolveRelativeLink } from '../utils/tree';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
  content: string;
  currentPath: string;
  onLinkClick?: (path: string) => void;
  className?: string;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [mermaidError, setMermaidError] = useState(false);

  useEffect(() => {
    if (language === 'mermaid' && mermaidRef.current && !mermaidError) {
      mermaid.initialize({
        theme: theme === 'dark' ? 'dark' : 'default',
        startOnLoad: false
      });

      const renderMermaid = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${Math.random()}`, code);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setMermaidError(true);
        }
      };

      renderMermaid();
    }
  }, [code, language, theme, mermaidError]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  if (language === 'mermaid') {
    if (mermaidError) {
      return (
        <div className="relative rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Erro ao renderizar diagrama Mermaid</span>
          </div>
          <pre className="text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    return (
      <div className="relative rounded-lg border bg-card p-4 overflow-x-auto">
        <div ref={mermaidRef} />
      </div>
    );
  }

  return (
    <div className="relative group">
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Copiado
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 mr-1" />
            Copiar
          </>
        )}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownViewer({
  content,
  currentPath,
  onLinkClick,
  className,
}: MarkdownViewerProps) {
  return (
    <div className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code: CodeBlock,
          a: ({ href, children, ...props }) => {
            if (!href) return <a {...props}>{children}</a>;

            // Handle internal links
            if (href.startsWith('./') || href.startsWith('../') || href.startsWith('/')) {
              const resolvedPath = resolveRelativeLink(currentPath, href);
              return (
                <a
                  href={resolvedPath}
                  onClick={(e) => {
                    if (onLinkClick) {
                      e.preventDefault();
                      onLinkClick(resolvedPath);
                    }
                  }}
                  className="text-primary hover:underline"
                  {...props}
                >
                  {children}
                </a>
              );
            }

            // External links
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...props }) => {
            if (!src) return null;

            return (
              <img
                src={src}
                alt={alt || ''}
                className="rounded-lg max-w-full h-auto"
                loading="lazy"
                {...props}
              />
            );
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full" {...props}>
                {children}
              </table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
