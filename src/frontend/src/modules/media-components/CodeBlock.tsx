/**
 * CodeBlock - Bloco de código com syntax highlighting
 *
 * Features:
 * - Syntax highlighting para múltiplas linguagens
 * - Tema claro/escuro
 * - Números de linha (opcional)
 * - Copy to clipboard
 */

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  highlightLines?: number[];
}

export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = false,
  className,
  highlightLines,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Detectar mudanças de tema
  useState(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Copy button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copiado
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copiar
          </>
        )}
      </Button>

      {/* Syntax highlighter */}
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        showLineNumbers={showLineNumbers}
        wrapLines={highlightLines !== undefined}
        lineProps={(lineNumber) => {
          const style: React.CSSProperties = {};
          if (highlightLines?.includes(lineNumber)) {
            style.backgroundColor = isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)';
            style.display = 'block';
          }
          return { style };
        }}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * InlineCode - Código inline
 */
export function InlineCode({ code, className }: { code: string; className?: string }) {
  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 font-mono text-sm',
        className
      )}
    >
      {code}
    </code>
  );
}
