/**
 * PageBreadcrumb Component
 *
 * Componente reutilizável de breadcrumb para navegação em todas as páginas.
 * Baseado no padrão implementado em PortalDefaultView.
 *
 * Usage:
 * ```tsx
 * <PageBreadcrumb items={[
 *   { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
 *   { label: 'Setup', href: '/setup' },
 *   { label: 'Portais' } // Página atual (sem href)
 * ]} />
 * ```
 */

import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageBreadcrumbProps {
  items: BreadcrumbItemData[];
  includeHome?: boolean;
  className?: string;
}

/**
 * PageBreadcrumb component
 *
 * @param items - Array of breadcrumb items
 * @param includeHome - Include "Home" link as first item (default: true)
 * @param className - Additional CSS classes
 */
export function PageBreadcrumb({
  items,
  includeHome = true,
  className = 'mb-6'
}: PageBreadcrumbProps) {
  // Se includeHome e não há item Home, adiciona no início
  const breadcrumbItems = includeHome && items[0]?.label !== 'Home'
    ? [{ label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <div key={index} className="contents">
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  // Link clicável
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="flex items-center gap-1.5">
                      {item.icon && (
                        <span aria-hidden="true">{item.icon}</span>
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  // Página atual (não clicável)
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {item.icon && (
                      <span aria-hidden="true">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {/* Separador (não adiciona após o último item) */}
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Compact variant - smaller spacing
 */
export function PageBreadcrumbCompact(props: PageBreadcrumbProps) {
  return <PageBreadcrumb {...props} className="mb-4" />;
}
