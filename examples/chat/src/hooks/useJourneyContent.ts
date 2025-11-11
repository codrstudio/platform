// hooks/useJourneyContent.ts
/**
 * Hook para carregar e parsear conteúdo Markdown das etapas da jornada
 *
 * Faz fetch do arquivo .md, extrai frontmatter YAML com gray-matter,
 * e retorna metadata + markdown bruto para renderização.
 *
 * @example
 * const { metadata, markdown, isLoading, error } = useJourneyContent('/content/journey/descoberta-home.md')
 */

import { useState, useEffect } from 'react'
import matter from 'gray-matter'
import type { StepContent, StepContentMetadata } from '@/types/journey'

const EMPTY_METADATA: StepContentMetadata = {
  id: '',
  title: 'Carregando...'
}

const INITIAL_STATE: StepContent = {
  metadata: EMPTY_METADATA,
  markdown: '',
  isLoading: true,
  error: null
}

/**
 * Hook para carregar conteúdo de uma etapa da jornada
 *
 * @param contentPath - Caminho para o arquivo Markdown (ex: "/content/journey/descoberta-home.md")
 * @returns StepContent com metadata, markdown, loading state e erro
 */
export function useJourneyContent(contentPath: string | undefined): StepContent {
  const [content, setContent] = useState<StepContent>(INITIAL_STATE)

  useEffect(() => {
    // Reset state ao mudar contentPath
    setContent(INITIAL_STATE)

    // Se não tem contentPath, retornar vazio
    if (!contentPath) {
      setContent({
        metadata: EMPTY_METADATA,
        markdown: '',
        isLoading: false,
        error: null
      })
      return
    }

    let isCancelled = false

    // Função async para fetch + parse
    async function loadContent() {
      try {
        // Fetch do arquivo Markdown
        const response = await fetch(contentPath)

        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.statusText}`)
        }

        const rawMarkdown = await response.text()

        // Parsear frontmatter YAML com gray-matter
        const { data, content: markdown } = matter(rawMarkdown)

        // Validar metadata obrigatório
        if (!data.id || !data.title) {
          throw new Error(`Invalid frontmatter: missing id or title in ${contentPath}`)
        }

        // Atualizar estado (apenas se não foi cancelado)
        if (!isCancelled) {
          setContent({
            metadata: data as StepContentMetadata,
            markdown,
            isLoading: false,
            error: null
          })
        }
      } catch (error) {
        console.error(`Error loading journey content from ${contentPath}:`, error)

        if (!isCancelled) {
          setContent({
            metadata: EMPTY_METADATA,
            markdown: '',
            isLoading: false,
            error: error as Error
          })
        }
      }
    }

    loadContent()

    // Cleanup: cancelar se componente desmontar ou contentPath mudar
    return () => {
      isCancelled = true
    }
  }, [contentPath])

  return content
}

/**
 * Hook alternativo que recebe um JourneyStep e extrai contentPath automaticamente
 *
 * @example
 * const step = JOURNEY_MAP.find(s => s.id === 'descoberta-home')
 * const content = useJourneyContentFromStep(step)
 */
export function useJourneyContentFromStep(step: { contentPath?: string } | null | undefined): StepContent {
  return useJourneyContent(step?.contentPath)
}
