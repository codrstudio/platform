/**
 * useScrollAnimation Hook
 *
 * Hook para detectar quando um elemento entra no viewport usando Intersection Observer.
 * Usado para disparar animações de entrada conforme o usuário faz scroll.
 *
 * @see spec/SPEC-module-homepage.md - Animations
 */

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  /**
   * Threshold para considerar o elemento visível (0.0 a 1.0)
   * @default 0.2 (20% do elemento deve estar visível)
   */
  threshold?: number;

  /**
   * Root margin para ajustar a área de detecção
   * @default '0px'
   */
  rootMargin?: string;

  /**
   * Se true, anima apenas uma vez (não re-anima ao sair e entrar novamente)
   * @default true
   */
  once?: boolean;

  /**
   * Se false, desabilita o observer
   * @default true
   */
  enabled?: boolean;
}

interface UseScrollAnimationReturn<T extends HTMLElement> {
  /**
   * Ref para anexar ao elemento que deve ser observado
   */
  ref: React.RefObject<T | null>;

  /**
   * Indica se o elemento está atualmente visível no viewport
   */
  isVisible: boolean;

  /**
   * Indica se a animação já foi executada (sempre true se once = false)
   */
  hasAnimated: boolean;
}

/**
 * Hook para detectar visibilidade de elemento e disparar animações
 *
 * @example
 * ```tsx
 * function AnimatedSection() {
 *   const { ref, isVisible, hasAnimated } = useScrollAnimation<HTMLDivElement>({
 *     threshold: 0.2,
 *     once: true,
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={cn(
 *         'opacity-0 translate-y-10 transition-all duration-700',
 *         (isVisible || hasAnimated) && 'opacity-100 translate-y-0'
 *       )}
 *     >
 *       Content appears when scrolled into view
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  rootMargin = '0px',
  once = true,
  enabled = true,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn<T> {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    // Se once = true e já animou, não precisa observar mais
    if (once && hasAnimated) {
      return;
    }

    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        setIsVisible(isIntersecting);

        // Marca como animado na primeira vez que fica visível
        if (isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, hasAnimated, enabled]);

  return {
    ref,
    isVisible,
    hasAnimated,
  };
}
