/**
 * useWillChange Hook
 *
 * Hook para aplicar will-change CSS property durante animações para otimizar performance.
 * Remove will-change após animação completa para evitar uso excessivo de memória.
 *
 * Specs:
 * - SPEC-M-HP-PERF-008: Aplicar will-change apenas durante animações
 * - SPEC-M-HP-PERF-009: Remover will-change após animação completa
 *
 * @see spec/SPEC-module-homepage.md - Performance
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
 */

import { useEffect, useRef } from 'react';

interface UseWillChangeOptions {
  /**
   * Propriedades CSS que serão animadas
   * @default 'transform, opacity'
   */
  properties?: string;

  /**
   * Duração da animação em ms (para saber quando remover will-change)
   * @default 1000
   */
  duration?: number;

  /**
   * Se true, aplica will-change
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook para otimizar animações com will-change
 *
 * @example
 * ```tsx
 * function AnimatedCard() {
 *   const ref = useWillChange<HTMLDivElement>({
 *     properties: 'transform, opacity',
 *     duration: 800,
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className="animate-fade-in"
 *     >
 *       Card content
 *     </div>
 *   );
 * }
 * ```
 */
export function useWillChange<T extends HTMLElement = HTMLDivElement>({
  properties = 'transform, opacity',
  duration = 1000,
  enabled = true,
}: UseWillChangeOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const element = ref.current;

    // Aplica will-change no início
    element.style.willChange = properties;

    // Remove will-change após animação completa
    // Adiciona 100ms de buffer para garantir que animação terminou
    const timeoutId = setTimeout(() => {
      if (element) {
        element.style.willChange = 'auto';
      }
    }, duration + 100);

    return () => {
      clearTimeout(timeoutId);
      if (element) {
        element.style.willChange = 'auto';
      }
    };
  }, [properties, duration, enabled]);

  return ref;
}
