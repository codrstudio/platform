import type { ReactNode } from 'react';
import { useComposition } from './CompositionContext';
import { CompositionRenderer } from './CompositionRenderer';
import type { LayoutWidth } from './types';

/**
 * Props do componente Page
 */
interface PageProps {
  /** ID da composição a ser usada (padrão: 'default') */
  composition?: string;

  /** Override opcional para largura do layout: 'full' (100%), 'lg' (1024px), 'md' (768px), 'sm' (640px) */
  width?: LayoutWidth;

  /** Conteúdo da página */
  children: ReactNode;
}

/**
 * Componente Page - Wrapper para páginas com composição de layout
 *
 * Permite que páginas escolham qual composição de layout usar e opcionalmente
 * sobrescrever a largura do layout sem precisar criar composições customizadas.
 *
 * A composição define quais slots estarão disponíveis (navbar, sidebar, etc)
 * e quais componentes serão renderizados em cada slot.
 *
 * @example
 * ```tsx
 * // Usa composição padrão com largura padrão (md - 768px)
 * <Page>
 *   <h1>Minha Página</h1>
 * </Page>
 *
 * // Override de largura para layout mais largo
 * <Page width="lg">
 *   <DataTablePage />
 * </Page>
 *
 * // Largura total para dashboards
 * <Page width="full">
 *   <DashboardPage />
 * </Page>
 *
 * // Usa composição 'settings' com largura customizada
 * <Page composition="settings" width="sm">
 *   <LoginForm />
 * </Page>
 * ```
 */
export function Page({ composition = 'default', width, children }: PageProps) {
  const { resolveComposition } = useComposition();

  // Resolve a composição, obtendo os componentes React para cada slot
  const resolved = resolveComposition(composition);

  return (
    <CompositionRenderer composition={resolved} widthOverride={width}>
      {children}
    </CompositionRenderer>
  );
}
