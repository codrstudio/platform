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
 * Renderiza uma composição de layout com HTML semântico
 *
 * Renderiza slots condicionalmente baseado na configuração da composição:
 * - navbar (nav)
 * - sidebar (aside)
 * - breadcrumb (nav)
 * - main-content (article) - sempre presente
 * - companion (aside)
 * - footer (footer)
 *
 * Cada slot tem um ID padronizado para acesso programático via DOM.
 * Aplica layout width conforme configuração ou override.
 */
export function CompositionRenderer({ composition, children, widthOverride }: CompositionRendererProps) {
  const { slots, resolvedComponents, layout } = composition;

  // Determina largura final (override > composição > padrão 'md')
  const finalWidth = widthOverride ?? layout.width ?? 'md';

  // Mapeia largura para classes CSS completas (necessário para Tailwind JIT)
  const widthClassMap: Record<LayoutWidth, string> = {
    full: 'w-full',
    lg: 'max-w-screen-lg mx-auto',
    md: 'max-w-screen-md mx-auto',
    sm: 'max-w-screen-sm mx-auto',
  };

  const widthClass = widthClassMap[finalWidth];

  return (
    <div id="portal-root" className={widthClass}>
      {/* Navbar - Barra de navegação superior */}
      {slots.navbar && resolvedComponents.navbar && (
        <nav id="navbar">
          <resolvedComponents.navbar />
        </nav>
      )}

      {/* Sidebar - Barra lateral esquerda */}
      {slots.sidebar && resolvedComponents.sidebar && (
        <aside id="sidebar">
          <resolvedComponents.sidebar />
        </aside>
      )}

      {/* Breadcrumb - Navegação hierárquica */}
      {slots.breadcrumb && resolvedComponents.breadcrumb && (
        <nav id="breadcrumb" aria-label="breadcrumb" className="p-4">
          <resolvedComponents.breadcrumb />
        </nav>
      )}

      {/* Main Content - Conteúdo principal (sempre presente) */}
      <article id="main-content">
        {children}
      </article>

      {/* Companion - Barra lateral direita / área complementar */}
      {slots.companion && resolvedComponents.companion && (
        <aside id="companion">
          <resolvedComponents.companion />
        </aside>
      )}

      {/* Footer - Rodapé */}
      {slots.footer && resolvedComponents.footer && (
        <footer id="footer">
          <resolvedComponents.footer />
        </footer>
      )}
    </div>
  );
}
