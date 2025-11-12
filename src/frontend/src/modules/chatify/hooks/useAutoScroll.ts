/**
 * useAutoScroll Hook
 * Auto-scroll inteligente para o final do container quando dependência mudar
 * Detecta se usuário está no fundo e expõe controle manual
 */

import { useRef, useEffect, useState, useCallback } from 'react'

export function useAutoScroll<T>(dependency: T, threshold: number = 50) {
  const ref = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const isAutoScrolling = useRef(false)

  // Função para verificar se está no fundo
  const checkIfAtBottom = useCallback((scrollableParent: HTMLElement) => {
    const isBottom =
      scrollableParent.scrollHeight - scrollableParent.scrollTop - scrollableParent.clientHeight < threshold
    return isBottom
  }, [threshold])

  // Função para rolar até o fundo manualmente
  const scrollToBottom = useCallback(() => {
    if (!ref.current) return

    const scrollableParent = ref.current.closest('.overflow-y-auto') as HTMLElement
    if (!scrollableParent) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      return
    }

    isAutoScrolling.current = true

    // Timeout fallback para browsers antigos ou casos edge
    let fallbackTimeout: NodeJS.Timeout | null = setTimeout(() => {
      isAutoScrolling.current = false
      const atBottom = checkIfAtBottom(scrollableParent)
      setIsAtBottom(atBottom)
      fallbackTimeout = null
    }, 1000)

    // Handler one-time para scrollend (browsers modernos)
    const handleScrollEnd = () => {
      // Cancelar timeout se scrollend disparar primeiro
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout)
        fallbackTimeout = null
      }

      // Resetar flag e verificar posição final
      isAutoScrolling.current = false
      const atBottom = checkIfAtBottom(scrollableParent)
      setIsAtBottom(atBottom)
    }

    // Adicionar listener scrollend
    scrollableParent.addEventListener('scrollend', handleScrollEnd, { once: true })

    scrollableParent.scrollTo({
      top: scrollableParent.scrollHeight,
      behavior: 'smooth'
    })
  }, [checkIfAtBottom])

  // Listener de scroll para atualizar isAtBottom
  useEffect(() => {
    if (!ref.current) return

    const scrollableParent = ref.current.closest('.overflow-y-auto') as HTMLElement
    if (!scrollableParent) return

    const handleScroll = () => {
      // Ignorar scroll programático
      if (isAutoScrolling.current) return

      const atBottom = checkIfAtBottom(scrollableParent)
      setIsAtBottom(atBottom)
    }

    scrollableParent.addEventListener('scroll', handleScroll, { passive: true })

    // Check inicial
    handleScroll()

    return () => {
      scrollableParent.removeEventListener('scroll', handleScroll)
    }
  }, [checkIfAtBottom])

  // Auto-scroll quando dependência muda (APENAS se usuário está no fundo)
  useEffect(() => {
    if (!ref.current || !isAtBottom) return

    const scrollableParent = ref.current.closest('.overflow-y-auto') as HTMLElement
    if (!scrollableParent) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      return
    }

    // Usar requestAnimationFrame para suavizar durante streaming
    requestAnimationFrame(() => {
      isAutoScrolling.current = true
      scrollableParent.scrollTop = scrollableParent.scrollHeight

      // Reset flag após próximo frame (scroll instantâneo, não smooth)
      requestAnimationFrame(() => {
        isAutoScrolling.current = false
      })
    })
  }, [dependency, isAtBottom])

  return { ref, isAtBottom, scrollToBottom }
}
