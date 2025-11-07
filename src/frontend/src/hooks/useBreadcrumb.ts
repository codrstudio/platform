/**
 * useBreadcrumb Hook
 *
 * Hook para gerar breadcrumbs automaticamente baseado na rota atual
 * e contexto do portal/módulo.
 *
 * Usage:
 * ```tsx
 * const breadcrumbItems = useBreadcrumb({
 *   portalId: 'main',
 *   portalName: 'Portal Principal',
 *   pageLabel: 'Configurações'
 * });
 *
 * return <PageBreadcrumb items={breadcrumbItems} />;
 * ```
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { BreadcrumbItemData } from '@/components/navigation/PageBreadcrumb';

export interface UseBreadcrumbOptions {
  portalId?: string;
  portalName?: string;
  moduleName?: string;
  pageLabel?: string;
  customItems?: BreadcrumbItemData[];
}

/**
 * Generate breadcrumb items based on current context
 */
export function useBreadcrumb(options: UseBreadcrumbOptions = {}): BreadcrumbItemData[] {
  const location = useLocation();

  return useMemo(() => {
    const {
      portalId,
      portalName,
      moduleName,
      pageLabel,
      customItems
    } = options;

    // Se customItems foi fornecido, usa diretamente
    if (customItems && customItems.length > 0) {
      return customItems;
    }

    const items: BreadcrumbItemData[] = [];

    // Sempre adiciona Home (será tratado pelo PageBreadcrumb se includeHome=true)
    // items.push({ label: 'Home', href: '/' });

    // Adiciona portal (se fornecido)
    if (portalId) {
      const displayName = portalName || (portalId.charAt(0).toUpperCase() + portalId.slice(1));

      // Se estamos na raiz do portal, não é link
      if (location.pathname === '/' || location.pathname === `/${portalId}`) {
        items.push({ label: displayName });
      } else {
        // Senão, é um link clicável
        const href = portalId === 'main' ? '/' : `/${portalId}`;
        items.push({ label: displayName, href });
      }
    }

    // Adiciona módulo (se fornecido)
    if (moduleName) {
      items.push({ label: moduleName });
    }

    // Adiciona página atual (se fornecido)
    if (pageLabel && !moduleName) {
      items.push({ label: pageLabel });
    }

    return items;
  }, [location.pathname, options]);
}

/**
 * Generate breadcrumb from URL path segments
 * Útil quando você não tem contexto de portal/módulo
 */
export function useBreadcrumbFromPath(): BreadcrumbItemData[] {
  const location = useLocation();

  return useMemo(() => {
    const segments = location.pathname
      .split('/')
      .filter(Boolean); // Remove empty strings

    if (segments.length === 0) {
      return [{ label: 'Home' }];
    }

    const items: BreadcrumbItemData[] = [];

    segments.forEach((segment, index) => {
      // Capitaliza primeira letra
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Constrói o href até este segmento
      const href = '/' + segments.slice(0, index + 1).join('/');

      // Último segmento não é link
      const isLast = index === segments.length - 1;

      items.push({
        label,
        href: isLast ? undefined : href
      });
    });

    return items;
  }, [location.pathname]);
}

/**
 * Breadcrumb preset para Setup module
 */
export function useSetupBreadcrumb(pageLabel?: string): BreadcrumbItemData[] {
  return useBreadcrumb({
    portalId: 'setup',
    portalName: 'Setup',
    pageLabel
  });
}

/**
 * Breadcrumb preset para Main portal
 */
export function useMainPortalBreadcrumb(pageLabel?: string): BreadcrumbItemData[] {
  return useBreadcrumb({
    portalId: 'main',
    portalName: 'Home',
    pageLabel
  });
}
