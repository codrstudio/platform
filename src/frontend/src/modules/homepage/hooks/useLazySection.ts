/**
 * useLazySection Hook
 *
 * Hook para lazy loading de seções da homepage abaixo da dobra.
 * Usa Intersection Observer para carregar seções apenas quando próximas do viewport.
 *
 * Specs:
 * - SPEC-M-HP-PERF-001: Lazy load seções abaixo da dobra
 * - SPEC-M-HP-PERF-002: Hero sempre carrega imediatamente
 * - SPEC-M-HP-PERF-003: Usar Intersection Observer para detecção
 *
 * @see spec/SPEC-module-homepage.md - Performance
 */

import { useEffect, useRef, useState } from 'react';

interface UseLazySectionOptions {
  /**
   * Se true, força o carregamento imediato (usado para Hero section)
   * @default false
   */
  eager?: boolean;

  /**
   * Root margin para começar a carregar antes de entrar no viewport
   * @default '400px' (carrega 400px antes de ficar visível)
   */
  rootMargin?: string;

  /**
   * Se false, desabilita lazy loading
   * @default true
   */
  enabled?: boolean;
}

interface UseLazySectionReturn {
  /**
   * Ref para anexar ao elemento wrapper da seção
   */
  ref: React.RefObject<HTMLElement | null>;

  /**
   * Indica se a seção deve ser renderizada
   */
  shouldRender: boolean;
}

/**
 * Hook para lazy loading de seções da homepage
 *
 * @example
 * ```tsx
 * function FeaturesSection() {
 *   const { ref, shouldRender } = useLazySection({
 *     eager: false,
 *     rootMargin: '400px'
 *   });
 *
 *   if (!shouldRender) {
 *     return <div ref={ref} className="min-h-[600px]" />;
 *   }
 *
 *   return (
 *     <section ref={ref}>
 *       <FeatureCards />
 *     </section>
 *   );
 * }
 * ```
 */
export function useLazySection({
  eager = false,
  rootMargin = '400px',
  enabled = true,
}: UseLazySectionOptions = {}): UseLazySectionReturn {
  const ref = useRef<HTMLElement>(null);
  const [shouldRender, setShouldRender] = useState(eager || !enabled);

  useEffect(() => {
    // Se eager ou disabled, sempre renderiza
    if (eager || !enabled) {
      setShouldRender(true);
      return;
    }

    // Se já renderizou, não precisa observar mais
    if (shouldRender) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Quando entra na área de observação (viewport + rootMargin), renderiza
        if (entry.isIntersecting) {
          setShouldRender(true);
        }
      },
      {
        rootMargin,
        threshold: 0, // Dispara assim que qualquer parte entrar na área
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [eager, rootMargin, enabled, shouldRender]);

  return {
    ref,
    shouldRender,
  };
}
