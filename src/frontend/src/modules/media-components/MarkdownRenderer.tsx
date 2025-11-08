/**
 * MarkdownRenderer - Renderiza conteúdo Markdown com GFM
 *
 * Features:
 * - GitHub Flavored Markdown (GFM)
 * - Syntax highlighting automático
 * - Suporte a tabelas, task lists, strikethrough
 * - Links externos abrem em nova aba
 * - Integração com tema claro/escuro
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowHtml?: boolean;
  components?: Partial<ComponentPropsWithoutRef<typeof ReactMarkdown>['components']>;
}

export function MarkdownRenderer({
  content,
  className,
  allowHtml = false,
  components,
}: MarkdownRendererProps) {
  const rehypePlugins = allowHtml ? [rehypeRaw, rehypeKatex] : [rehypeKatex];

  return (
    <div
      className={cn(
        'prose dark:prose-invert max-w-none',
        'prose-headings:scroll-m-20',
        'prose-p:leading-7',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        'prose-blockquote:border-l-primary prose-blockquote:italic',
        'prose-table:border-collapse prose-table:border prose-table:border-border',
        'prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2',
        'prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins as any}
        components={{
          // Links externos abrem em nova aba
          a: ({ node, children, href, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Mesclar com componentes customizados
          ...components,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
