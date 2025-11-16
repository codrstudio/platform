import type { ReactNode } from 'react';
import type { ResolvedComposition, LayoutWidth } from './types';

/**
 * Props do CompositionRenderer
 */
interface CompositionRendererProps {
  /** Composição resolvida com componentes React */
  composition: ResolvedComposition;

  /** Conteúdo principal da página */
  children: ReactNode;

  /** Override opcional para largura do layout */
  widthOverride?: LayoutWidth;
}

/**
 * Renderiza uma composição de layout com estrutura hierárquica fixa
 *
 * Hierarquia (áreas sem componente não são renderizadas):
 * - site (root)
 *   - sidebar (opcional)
 *   - main-area
 *     - header (opcional)
 *     - common-area
 *       - content-area
 *         - breadcrumb (opcional)
 *         - desktop (children - sempre presente)
 *         - bottom-bar (footer, opcional)
 *       - companion (opcional)
 *
 * Componentes podem usar replace=true para substituir completamente o wrapper semântico.
 */
export function CompositionRenderer({ composition, children, widthOverride }: CompositionRendererProps) {
  const { slots, resolvedComponents, layout, replaceWrappers = {} } = composition;

  // Determina largura final
  const finalWidth = widthOverride ?? layout.width ?? 'md';
  const widthClassMap: Record<LayoutWidth, string> = {
    full: 'w-full',
    lg: 'max-w-screen-lg mx-auto',
    md: 'max-w-screen-md mx-auto',
    sm: 'max-w-screen-sm mx-auto',
  };
  const widthClass = widthClassMap[finalWidth];

  // Verificar quais áreas têm componentes
  const hasSidebar = slots.sidebar && resolvedComponents.sidebar;
  const hasHeader = slots.navbar && resolvedComponents.navbar;
  const hasBreadcrumb = slots.breadcrumb && resolvedComponents.breadcrumb;
  const hasCompanion = slots.companion && resolvedComponents.companion;
  const hasFooter = slots.footer && resolvedComponents.footer;

  return (
    <div className={`${widthClass} ${hasSidebar ? 'flex min-h-screen' : ''}`}>
      {/* Sidebar - Barra lateral esquerda */}
      {hasSidebar && (
        replaceWrappers.sidebar ? (
          <resolvedComponents.sidebar />
        ) : (
          <aside className="flex-shrink-0">
            <resolvedComponents.sidebar />
          </aside>
        )
      )}

      {/* Main Area - Área principal */}
      <div className={hasSidebar ? 'flex-1 flex flex-col min-w-0' : 'flex flex-col min-h-screen'}>
        {/* Header - Navegação superior */}
        {hasHeader && (
          replaceWrappers.navbar ? (
            <resolvedComponents.navbar />
          ) : (
            <nav className="flex-shrink-0">
              <resolvedComponents.navbar />
            </nav>
          )
        )}

        {/* Common Area - Área comum (content + companion) */}
        <div className={`flex-1 flex ${hasCompanion ? 'gap-4' : ''}`}>
          {/* Content Area - Área de conteúdo */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Breadcrumb - Navegação hierárquica */}
            {hasBreadcrumb && (
              replaceWrappers.breadcrumb ? (
                <resolvedComponents.breadcrumb />
              ) : (
                <nav className="flex-shrink-0" aria-label="breadcrumb">
                  <resolvedComponents.breadcrumb />
                </nav>
              )
            )}

            {/* Desktop - Conteúdo principal (sempre presente) */}
            <main className="flex-1">
              {children}
            </main>

            {/* Bottom Bar - Barra inferior (footer) */}
            {hasFooter && (
              replaceWrappers.footer ? (
                <resolvedComponents.footer />
              ) : (
                <footer className="flex-shrink-0">
                  <resolvedComponents.footer />
                </footer>
              )
            )}
          </div>

          {/* Companion - Área complementar direita */}
          {hasCompanion && (
            replaceWrappers.companion ? (
              <resolvedComponents.companion />
            ) : (
              <aside className="flex-shrink-0">
                <resolvedComponents.companion />
              </aside>
            )
          )}
        </div>
      </div>
    </div>
  );
}
