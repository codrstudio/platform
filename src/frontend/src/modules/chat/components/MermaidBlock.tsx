/**
 * MermaidBlock Component
 *
 * Renderiza diagramas Mermaid dentro de mensagens de chat
 * Usa hook useMermaid para gerenciar renderização
 *
 * Portado de examples/chat/src/components/chat/ChatMessage.tsx
 */

import { useMermaid } from '../hooks/useMermaid'
import { useTheme } from 'next-themes'

interface MermaidBlockProps {
  code: string
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const { theme } = useTheme()
  const ref = useMermaid(code, theme === 'dark' ? 'dark' : 'light')

  return (
    <div
      ref={ref}
      className="mermaid-diagram my-4 p-2 bg-background rounded border border-border"
    />
  )
}
