/**
 * ChatMessage - Componente de mensagem individual do chat
 * Renderiza mensagens do usuário (direita) e assistente (esquerda)
 * Suporte a Markdown, Mermaid diagrams e imagens inline
 */

import type { Message } from '../../types'
import { User, Copy, Check } from 'lucide-react'
import { AgentIcon } from './AgentIcon'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useMermaid } from '../../hooks/useMermaid'
import { useState, useRef, useEffect } from 'react'

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
          containerRef.current.innerHTML = `<pre class="text-red-600 dark:text-red-400 text-sm">Error rendering diagram</pre>`
        }
      }
    }

    render()
  }, [code, renderDiagram])

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-4 p-2 bg-white dark:bg-nic-secondary-dark rounded border border-gray-200 dark:border-gray-700"
    />
  )
}

interface ChatMessageProps {
  message: Message
  compact?: boolean // Modo compacto para chat flutuante (oculta avatar do usuário)
}

export function ChatMessage({ message, compact = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback para navegadores antigos
      const textarea = document.createElement('textarea')
      textarea.value = message.content
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar - ocultar avatar do usuário no modo compacto */}
      {!(isUser && compact) && (
        <>
          {isUser ? (
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-nic-accent-light dark:bg-nic-accent-dark text-white">
              <User className="w-5 h-5" />
            </div>
          ) : (
            <AgentIcon
              icon={message.agentSnapshot?.icon}
              title={message.agentSnapshot?.title || 'Assistente'}
              description={message.agentSnapshot?.description}
            />
          )}
        </>
      )}

      {/* Message Bubble */}
      <div className={`min-w-0 max-w-[75%] break-words ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 break-words ${
          isUser
            ? 'bg-nic-accent-light dark:bg-nic-accent-dark text-white rounded-tr-sm'
            : 'bg-white dark:bg-nic-secondary-dark text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-gray-700'
        }`}>
          <div className="prose prose-chat dark:prose-invert max-w-none
                       [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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

                // Code inline ou outros languages
                return (
                  <code
                    className={`${className || ''} ${isUser ? 'text-white bg-white/20' : 'bg-gray-200 dark:bg-gray-700'} px-1 rounded`}
                    {...rest}
                  >
                    {children}
                  </code>
                )
              },
              // Imagens inline (URLs, base64, quickchart.io, etc)
              img({ src, alt, ...props }) {
                return (
                  <img
                    src={src}
                    alt={alt || 'Chat image'}
                    className="inline-block max-w-full my-2 rounded shadow-sm"
                    loading="lazy"
                    {...props}
                  />
                )
              },
              // Customizar cores para dark mode quando é mensagem do user
              p: ({ children }) => (
                <p className={isUser ? 'text-white' : ''}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong className={isUser ? 'text-white font-bold' : 'font-bold'}>{children}</strong>
              ),
              li: ({ children }) => (
                <li className={isUser ? 'text-white' : ''}>{children}</li>
              ),
              // Headings
              h1: ({ children }) => (
                <h1 className={isUser ? 'text-white font-bold text-lg' : 'font-bold text-lg'}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className={isUser ? 'text-white font-bold text-base' : 'font-bold text-base'}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className={isUser ? 'text-white font-semibold text-sm' : 'font-semibold text-sm'}>{children}</h3>
              )
            }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Action Bar: Timestamp + Copy Button */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {/* Para mensagens da IA: botão à esquerda */}
          {!isUser && (
            <button
              onClick={handleCopy}
              title={copied ? 'Copiado!' : 'Copiar'}
              aria-label={copied ? 'Copiado' : 'Copiar mensagem'}
              className="
                p-1 rounded
                text-gray-400 dark:text-gray-500
                hover:text-gray-600 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors duration-200
              "
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          )}

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>

          {/* Para mensagens do usuário: botão à direita */}
          {isUser && (
            <button
              onClick={handleCopy}
              title={copied ? 'Copiado!' : 'Copiar'}
              aria-label={copied ? 'Copiado' : 'Copiar mensagem'}
              className="
                p-1 rounded
                text-gray-400 dark:text-gray-500
                hover:text-gray-600 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors duration-200
              "
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atrás`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
