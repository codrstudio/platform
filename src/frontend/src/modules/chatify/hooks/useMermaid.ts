/**
 * useMermaid Hook - Renderização de diagramas Mermaid
 * Encapsula lógica de inicialização e rendering do Mermaid
 */

import { useCallback } from 'react'
import mermaid from 'mermaid'

// Singleton para garantir que mermaid seja inicializado apenas uma vez
let mermaidInitialized = false

function initializeMermaid() {
  if (mermaidInitialized) return

  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
  })

  mermaidInitialized = true
}

export function useMermaid() {
  const renderDiagram = useCallback(async (code: string): Promise<string> => {
    initializeMermaid()

    try {
      // Gera ID único para evitar conflitos
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Renderiza diagrama
      const { svg } = await mermaid.render(id, code)

      return svg
    } catch (error) {
      console.error('Mermaid render error:', error)
      throw error
    }
  }, [])

  return { renderDiagram }
}
