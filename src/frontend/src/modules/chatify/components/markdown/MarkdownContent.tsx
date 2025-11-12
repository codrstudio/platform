// components/markdown/MarkdownContent.tsx
/**
 * Componente reutilizável para renderizar Markdown com suporte completo a:
 * - GitHub Flavored Markdown (GFM)
 * - Diagramas Mermaid interativos
 * - Code blocks com syntax highlighting
 * - Imagens inline (URLs, base64 data URIs)
 * - Tabelas, listas, links, etc
 *
 * Reutiliza a mesma lógica do ChatMessage para consistência.
 */

import { useRef, useEffect } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useMermaid } from '../../hooks/useMermaid'

/**
 * Componente para renderizar blocos Mermaid
 */
function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { renderDiagram } = useMermaid()

  useEffect(() => {
    if (!containerRef.current) return

    const render = async () => {
      try {
        const svg = await renderDiagram(code)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-600 dark:text-red-400 text-sm">Error rendering diagram: ${error}</pre>`
        }
      }
    }

    render()
  }, [code, renderDiagram])

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-6 p-4 bg-white dark:bg-nic-secondary-dark rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto"
    />
  )
}

interface MarkdownContentProps {
  /** Markdown content to render */
  content: string

  /** Additional CSS classes for the container */
  className?: string
}

/**
 * Renderiza conteúdo Markdown com suporte completo a formatação rica
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-0
        prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
        prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-7
        prose-a:text-nic-accent-light dark:prose-a:text-nic-accent-dark prose-a:no-underline hover:prose-a:underline
        prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:text-gray-100 dark:prose-pre:bg-black prose-pre:rounded-lg prose-pre:shadow-lg
        prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
        prose-blockquote:border-l-4 prose-blockquote:border-nic-accent-light dark:prose-blockquote:border-nic-accent-dark prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
        prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
        prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        prose-table:border-collapse prose-table:w-full
        prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:px-4 prose-th:py-2
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-4 prose-td:py-2
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        urlTransform={(url) => {
          // Permitir data: URIs para imagens base64
          if (url.startsWith('data:')) return url
          return defaultUrlTransform(url)
        }}
        components={{
          // Code blocks - detectar language-mermaid
          code(props) {
            const { node, className, children, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const inline = !className

            // Renderizar Mermaid se for code block com language-mermaid
            if (!inline && language === 'mermaid') {
              return <MermaidBlock code={String(children).trim()} />
            }

            // Code inline
            if (inline) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              )
            }

            // Code block (outros languages)
            return (
              <pre className="overflow-x-auto">
                <code className={className} {...rest}>
                  {children}
                </code>
              </pre>
            )
          },

          // Imagens - adicionar lazy loading e alt
          img(props) {
            return (
              <img
                {...props}
                loading="lazy"
                alt={props.alt || 'Image'}
                className="max-w-full h-auto"
              />
            )
          },

          // Links externos - abrir em nova aba
          a(props) {
            const isExternal = props.href?.startsWith('http')

            if (isExternal) {
              return (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.children}
                </a>
              )
            }

            return <a {...props}>{props.children}</a>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
