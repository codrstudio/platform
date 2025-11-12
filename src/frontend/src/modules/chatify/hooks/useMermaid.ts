/**
 * useMermaid Hook - Renderização de diagramas Mermaid
 * Encapsula lógica de inicialização e rendering do Mermaid
 */

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

export function useMermaid(code: string, theme: 'light' | 'dark' = 'light') {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !code.trim()) return

    // Inicializa Mermaid com configurações
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    })

    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        // Gera ID único para evitar conflitos
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Renderiza diagrama
        const { svg } = await mermaid.render(id, code)

        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          // Adiciona acessibilidade
          const svgElement = containerRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.setAttribute('aria-label', 'Mermaid diagram')
            svgElement.setAttribute('role', 'img')
          }
        }
      } catch (error) {
        console.error('Mermaid render error:', error)
        // Fallback: mostrar código como texto
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-600 dark:text-red-400 text-sm overflow-x-auto"><code>Erro ao renderizar diagrama Mermaid:\n${code}</code></pre>`
        }
      }
    }

    renderDiagram()

    // Cleanup: remover evento listeners se houver
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [code, theme])

  return containerRef
}
