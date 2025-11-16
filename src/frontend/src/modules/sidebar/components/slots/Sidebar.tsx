/**
 * Sidebar Component (Refactored with shadcn/ui)
 *
 * Main navigation sidebar component with responsive behavior.
 *
 * SPEC Compliance:
 * - SPEC-SIDEBAR-T-*: Layout types
 * - SPEC-SIDEBAR-F-*: Mandatory features
 * - SPEC-SIDEBAR-RESP-*: Responsive behavior
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';
import { SidebarBrand } from '../SidebarBrand';
import { SidebarUserMenu } from '../SidebarUserMenu';
import { SidebarSearch } from '../SidebarSearch';
import { SidebarItem } from '../SidebarItem';
import type { SidebarConfig, MenuItem } from '../../types';

export interface SidebarProps {
  config: SidebarConfig;
  className?: string;
}

/**
 * Sidebar component
 *
 * Usage:
 * ```tsx
 * <SidebarProvider defaultOpen={!config.defaultCollapsed}>
 *   <Sidebar config={sidebarConfig} />
 * </SidebarProvider>
 * ```
 */
export function Sidebar({ config, className }: SidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();

  // Filter items by search (SPEC-SIDEBAR-O-005 to O-008)
  const filterItems = React.useCallback(
    (items: MenuItem[], query: string): MenuItem[] => {
      if (!query) return items;

      return items
        .filter((item) => {
          const matchesLabel = item.label
            .toLowerCase()
            .includes(query.toLowerCase());
          const hasMatchingChildren = item.children
            ? filterItems(item.children, query).length > 0
            : false;

          return matchesLabel || hasMatchingChildren;
        })
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: filterItems(item.children, query),
            };
          }
          return item;
        });
    },
    []
  );

  const filteredItems = config.enableSearch
    ? filterItems(config.items, searchQuery)
    : config.items;

  // Close mobile sidebar on navigate (SPEC-SIDEBAR-F-007)
  const handleNavigate = React.useCallback(() => {
    if (config.closeOnNavigate) {
      // O SidebarProvider já gerencia o fechamento mobile
    }
  }, [config.closeOnNavigate]);

  // Only render sidebar layouts (sidebar-left, sidebar-right)
  if (config.layout !== 'sidebar-left' && config.layout !== 'sidebar-right') {
    console.warn(
      `Layout '${config.layout}' não suportado. Use 'sidebar-left' ou 'sidebar-right'.`
    );
    return null;
  }

  const side = config.layout === 'sidebar-right' ? 'right' : 'left';
  const collapsible = config.collapsible !== false ? 'icon' : 'none';

  return (
    <SidebarPrimitive
      side={side}
      collapsible={collapsible}
      variant={config.variant === 'floating' ? 'floating' : 'sidebar'}
      className={className}
    >
      {/* Header: Brand + Search */}
      <SidebarHeader>
        <SidebarBrand
          logo={config.brand?.logo}
          portalName={config.brand?.portalName || 'Portal'}
          showLogo={config.brand?.showLogo !== false}
        />

        {config.enableSearch && (
          <>
            <SidebarSeparator />
            <SidebarSearch value={searchQuery} onChange={setSearchQuery} />
          </>
        )}
      </SidebarHeader>

      {/* Content: Menu Items (scrollable) */}
      <SidebarContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarItem key={item.id} item={item} onNavigate={handleNavigate} />
          ))}

          {filteredItems.length === 0 && searchQuery && (
            <div className="text-center py-8 px-2 text-sidebar-foreground/50 text-sm">
              Nenhum item encontrado
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer: Theme Toggle + User Menu */}
      <SidebarFooter>
        {config.enableThemeToggle && (
          <div className="flex items-center justify-center px-2 py-2">
            <ThemeToggleCompact />
          </div>
        )}

        {config.enableUserMenu && (
          <>
            {config.enableThemeToggle && <SidebarSeparator />}
            <SidebarMenu>
              <SidebarUserMenu
                showProfileLink={true}
                customActions={
                  config.userMenu?.actions?.map((action) => ({
                    label: action.label,
                    onClick:
                      typeof action.onClick === 'function'
                        ? action.onClick
                        : action.route
                        ? () => navigate(action.route!)
                        : () => {},
                  })) || []
                }
              />
            </SidebarMenu>
          </>
        )}
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
