/**
 * useReducedMotion Hook
 *
 * Hook para detectar se o usuário prefere animações reduzidas
 * via media query 'prefers-reduced-motion: reduce'.
 *
 * Usado para respeitar preferências de acessibilidade e desabilitar
 * animações desnecessárias para usuários com sensibilidade a movimento.
 *
 * @see spec/SPEC-module-homepage.md - Accessibility
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 */

import { useEffect, useState } from 'react';

/**
 * Hook para detectar preferência de animações reduzidas
 *
 * Retorna `true` se o usuário prefere animações reduzidas,
 * `false` caso contrário.
 *
 * Atualiza automaticamente se o usuário mudar a preferência
 * enquanto a página está aberta.
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   if (prefersReducedMotion) {
 *     // Renderizar versão estática
 *     return <StaticComponent />;
 *   }
 *
 *   // Renderizar versão com animações
 *   return <AnimatedComponent />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function FadeInText({ text }: { text: string }) {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <motion.div
 *       initial={{ opacity: 0 }}
 *       animate={{ opacity: 1 }}
 *       transition={{
 *         duration: prefersReducedMotion ? 0 : 0.5,
 *       }}
 *     >
 *       {text}
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  // Server-side rendering: assume sem preferência (false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Verificar suporte a matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Setar valor inicial
    setPrefersReducedMotion(mediaQuery.matches);

    // Listener para mudanças
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Adicionar listener
    // Usar addEventListener se disponível (navegadores modernos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antigos
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}
