import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface PortalBreadcrumbProps {
  /** Mapeamento opcional de ícones por segmento de URL */
  iconMap?: Record<string, React.ReactNode>;
}

/**
 * Componente de breadcrumb do portal
 *
 * Renderiza navegação hierárquica baseada no caminho da URL atual.
 * Integra com React Router para navegação e suporta tema claro/escuro.
 *
 * Features:
 * - Ícone Home automático
 * - Formatação inteligente de labels
 * - Suporte a ícones customizados via iconMap
 * - Padding de 16px aplicado pelo CompositionRenderer
 *
 * @example
 * ```tsx
 * <PortalBreadcrumb />
 * <PortalBreadcrumb iconMap={{ setup: <Settings className="h-4 w-4" /> }} />
 * ```
 */
export function PortalBreadcrumb({ iconMap = {} }: PortalBreadcrumbProps = {}) {
  const location = useLocation();

  // Gera os itens do breadcrumb a partir do pathname
  const pathSegments = location.pathname
    .split('/')
    .filter(segment => segment !== '');

  // Se não há segmentos (rota raiz), renderiza apenas Home como link
  // Permite que o usuário clique para "refresh" da página
  if (pathSegments.length === 0) {
    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1.5">
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    );
  }

  // Função para formatar o nome do segmento
  const formatSegmentName = (segment: string): string => {
    // Remove hífens e underscores, capitaliza primeira letra
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  // Constrói os itens do breadcrumb
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    const name = formatSegmentName(segment);
    const icon = iconMap[segment]; // Busca ícone customizado

    return {
      path,
      name,
      isLast,
      icon,
    };
  });

  return (
    <BreadcrumbList>
      {/* Item Home sempre presente com ícone */}
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link to="/" className="flex items-center gap-1.5">
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>

      {/* Renderiza os demais itens */}
      {breadcrumbItems.map((item) => (
        <div key={item.path} className="contents">
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {item.isLast ? (
              <BreadcrumbPage className="flex items-center gap-1.5">
                {item.icon && (
                  <span aria-hidden="true">{item.icon}</span>
                )}
                <span>{item.name}</span>
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={item.path} className="flex items-center gap-1.5">
                  {item.icon && (
                    <span aria-hidden="true">{item.icon}</span>
                  )}
                  <span>{item.name}</span>
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </div>
      ))}
    </BreadcrumbList>
  );
}
