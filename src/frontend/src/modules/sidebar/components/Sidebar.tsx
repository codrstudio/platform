/**
 * Sidebar Component
 *
 * Main navigation sidebar component with responsive behavior.
 *
 * SPEC Compliance:
 * - SPEC-SIDEBAR-T-*: Layout types
 * - SPEC-SIDEBAR-F-*: Mandatory features
 * - SPEC-SIDEBAR-RESP-*: Responsive behavior
 */

import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SidebarItem } from './SidebarItem';
import type { SidebarConfig, MenuItem } from '../types';

export interface SidebarProps {
  config: SidebarConfig;
  className?: string;
}

const STORAGE_KEY = 'sidebar:collapsed';

/**
 * Sidebar component
 *
 * Usage:
 * ```tsx
 * <Sidebar config={sidebarConfig} />
 * ```
 */
export function Sidebar({
  config,
  className
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(config.defaultCollapsed || false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load persisted state (SPEC-SIDEBAR-M-009)
  useEffect(() => {
    if (config.persistState) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsed(stored === 'true');
      }
    }
  }, [config.persistState]);

  // Persist state on change
  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (config.persistState) {
      localStorage.setItem(STORAGE_KEY, String(newState));
    }
  };

  // Filter items by search (SPEC-SIDEBAR-O-005 to O-008)
  const filterItems = (items: MenuItem[], query: string): MenuItem[] => {
    if (!query) return items;

    return items.filter(item => {
      const matchesLabel = item.label.toLowerCase().includes(query.toLowerCase());
      const hasMatchingChildren = item.children
        ? filterItems(item.children, query).length > 0
        : false;

      return matchesLabel || hasMatchingChildren;
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterItems(item.children, query)
        };
      }
      return item;
    });
  };

  const filteredItems = config.enableSearch
    ? filterItems(config.items, searchQuery)
    : config.items;

  // Close mobile sidebar on navigate (SPEC-SIDEBAR-F-007)
  const handleNavigate = () => {
    if (config.closeOnNavigate && window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const sidebarWidth = collapsed
    ? config.collapsedWidth || 80
    : config.width || 256;

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header with toggle */}
      {config.collapsible && !config.layout?.includes('navbar') && (
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <h2 className="font-semibold text-lg">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="ml-auto"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Search field (SPEC-SIDEBAR-O-005 to O-008) */}
      {config.enableSearch && !collapsed && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
        ))}

        {filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum item encontrado
          </div>
        )}
      </nav>

      {/* Footer (theme toggle placeholder) */}
      {config.enableThemeToggle && !collapsed && (
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full">
            Alternar Tema
          </Button>
        </div>
      )}
    </div>
  );

  // Sidebar layout (SPEC-SIDEBAR-T-001)
  if (config.layout === 'sidebar-left' || config.layout === 'sidebar-right') {
    return (
      <>
        {/* Mobile toggle button (SPEC-SIDEBAR-F-005) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile overlay (SPEC-SIDEBAR-F-006, F-007) */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 bottom-0 bg-background border-r transition-all duration-300 z-40',
            config.layout === 'sidebar-left' ? 'left-0' : 'right-0',
            'md:relative md:translate-x-0',
            mobileOpen ? 'translate-x-0' : config.layout === 'sidebar-left' ? '-translate-x-full' : 'translate-x-full',
            config.variant === 'bordered' && 'border-2',
            config.variant === 'floating' && 'mx-4 my-4 rounded-lg shadow-lg',
            className
          )}
          style={{ width: `${sidebarWidth}px` }}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Navbar layout (SPEC-SIDEBAR-T-006)
  if (config.layout === 'navbar-top') {
    return (
      <nav
        className={cn(
          'bg-background border-b',
          config.variant === 'bordered' && 'border-2',
          className
        )}
        style={{ height: `${config.height || 64}px` }}
      >
        <div className="container mx-auto h-full flex items-center gap-6 px-4">
          {/* Logo area */}
          <div className="font-semibold text-lg">
            Logo
          </div>

          {/* Menu items */}
          <div className="flex-1 flex items-center gap-2">
            {config.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                onNavigate={handleNavigate}
              />
            ))}
          </div>

          {/* Right side actions */}
          {config.enableThemeToggle && (
            <Button variant="ghost" size="icon">
              Tema
            </Button>
          )}
        </div>
      </nav>
    );
  }

  return null;
}
