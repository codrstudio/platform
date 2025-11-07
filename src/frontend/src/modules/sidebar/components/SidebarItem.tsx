/**
 * SidebarItem Component
 *
 * Individual menu item with support for nesting, badges, and active state.
 *
 * SPEC Compliance:
 * - SPEC-SIDEBAR-M-001 to M-009: Menu item structure and nesting
 * - SPEC-SIDEBAR-F-001 to F-003: Navigation and active state
 * - SPEC-SIDEBAR-O-001 to O-004: Badges
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem } from '../types';

export interface SidebarItemProps {
  item: MenuItem;
  collapsed?: boolean;
  level?: number;
  onNavigate?: () => void;
}

/**
 * SidebarItem component
 */
export function SidebarItem({
  item,
  collapsed = false,
  level = 0,
  onNavigate
}: SidebarItemProps) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.route ? location.pathname === item.route : false;

  // Get icon component
  const IconComponent = item.icon
    ? (LucideIcons as any)[
        item.icon.split('-').map((s: string) =>
          s.charAt(0).toUpperCase() + s.slice(1)
        ).join('')
      ]
    : null;

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setExpanded(!expanded);
    } else if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onNavigate) {
      onNavigate();
    }
  };

  const baseClasses = cn(
    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
    'hover:bg-accent cursor-pointer',
    isActive && 'bg-accent text-accent-foreground font-medium',
    item.disabled && 'opacity-50 cursor-not-allowed',
    level > 0 && 'ml-4'
  );

  const content = (
    <>
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5" />
        </div>
      )}

      {/* Label (hidden when collapsed) */}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>

          {/* Badge */}
          {item.badge && (
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              item.badge.variant === 'primary' && 'bg-primary text-primary-foreground',
              item.badge.variant === 'success' && 'bg-green-500 text-white',
              item.badge.variant === 'warning' && 'bg-yellow-500 text-white',
              item.badge.variant === 'danger' && 'bg-red-500 text-white',
              item.badge.variant === 'default' && 'bg-muted text-muted-foreground'
            )}>
              {item.badge.text}
            </span>
          )}

          {/* Chevron for nested items */}
          {hasChildren && (
            <div className="flex-shrink-0">
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div>
      {/* Main item */}
      {item.route && !hasChildren ? (
        <Link
          to={item.route}
          className={baseClasses}
          onClick={handleClick}
        >
          {content}
        </Link>
      ) : (
        <div className={baseClasses} onClick={handleClick}>
          {content}
        </div>
      )}

      {/* Children (when expanded) */}
      {hasChildren && expanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              collapsed={collapsed}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
