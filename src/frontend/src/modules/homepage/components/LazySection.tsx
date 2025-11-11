/**
 * LazySection Component
 *
 * Wrapper para lazy loading de seções da homepage.
 * Renderiza placeholder até seção entrar próximo ao viewport.
 *
 * Specs:
 * - SPEC-M-HP-PERF-001: Lazy load seções abaixo da dobra
 * - SPEC-M-HP-PERF-004: Prevenir Cumulative Layout Shift com min-height
 *
 * @see spec/SPEC-module-homepage.md - Performance
 */

import type { ReactNode } from 'react';
import { useLazySection } from '../hooks/useLazySection';

interface LazySectionProps {
  /**
   * Conteúdo da seção a ser carregado lazy
   */
  children: ReactNode;

  /**
   * Altura mínima estimada da seção para prevenir CLS
   * @default '600px'
   */
  minHeight?: string;

  /**
   * Se true, força carregamento imediato (usado para Hero)
   * @default false
   */
  eager?: boolean;

  /**
   * Root margin para começar a carregar antes de entrar no viewport
   * @default '400px'
   */
  rootMargin?: string;

  /**
   * Classe adicional para o wrapper
   */
  className?: string;
}

/**
 * Wrapper para lazy loading de seções
 *
 * @example
 * ```tsx
 * <LazySection minHeight="800px" eager={false}>
 *   <FeaturesSection config={config} />
 * </LazySection>
 * ```
 */
export function LazySection({
  children,
  minHeight = '600px',
  eager = false,
  rootMargin = '400px',
  className,
}: LazySectionProps) {
  const { ref, shouldRender } = useLazySection({
    eager,
    rootMargin,
  });

  if (!shouldRender) {
    // Renderiza placeholder com min-height para prevenir CLS
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={className}
        style={{ minHeight }}
        aria-busy="true"
        aria-label="Carregando seção"
      />
    );
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </div>
  );
}
