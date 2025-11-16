/**
 * SidebarItem Component (Refactored with shadcn/ui)
 *
 * Individual menu item with support for nesting, badges, and active state.
 *
 * SPEC Compliance:
 * - SPEC-SIDEBAR-M-001 to M-009: Menu item structure and nesting
 * - SPEC-SIDEBAR-F-001 to F-003: Navigation and active state
 * - SPEC-SIDEBAR-O-001 to O-004: Badges
 */

import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MenuItem } from '../types';

export interface SidebarItemProps {
  item: MenuItem;
  onNavigate?: () => void;
}

/**
 * SidebarItem component
 */
export function SidebarItem({ item, onNavigate }: SidebarItemProps) {
  const location = useLocation();
  const [expanded, setExpanded] = React.useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.route ? location.pathname === item.route : false;

  // Get icon component from Lucide
  // Converts "arrow-right" to "ArrowRight"
  const IconComponent = React.useMemo(() => {
    if (!item.icon) return null;

    const iconName = item.icon
      .split('-')
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');

    return (LucideIcons as any)[iconName] || null;
  }, [item.icon]);

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onNavigate) {
      onNavigate();
    }
  };

  // Get badge variant color classes
  const getBadgeVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'danger':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-sidebar-accent text-sidebar-accent-foreground';
    }
  };

  // Render nested items
  if (hasChildren) {
    return (
      <Collapsible open={expanded} onOpenChange={setExpanded} asChild>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={item.label}
              isActive={isActive}
              disabled={item.disabled}
            >
              {IconComponent && <IconComponent />}
              <span>{item.label}</span>
              <ChevronRight
                className={cn(
                  'ml-auto h-4 w-4 transition-transform',
                  expanded && 'rotate-90'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          {item.badge && (
            <SidebarMenuBadge>
              <Badge
                className={cn(
                  'h-5 min-w-5 px-1 text-xs',
                  getBadgeVariantClasses(item.badge.variant)
                )}
              >
                {item.badge.text}
              </Badge>
            </SidebarMenuBadge>
          )}

          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  {child.route ? (
                    <SidebarMenuSubButton
                      asChild
                      isActive={location.pathname === child.route}
                    >
                      <Link to={child.route} onClick={handleClick}>
                        {child.icon && (() => {
                          const ChildIcon = (LucideIcons as any)[
                            child.icon
                              .split('-')
                              .map(
                                (s: string) =>
                                  s.charAt(0).toUpperCase() + s.slice(1)
                              )
                              .join('')
                          ];
                          return ChildIcon ? <ChildIcon /> : null;
                        })()}
                        <span>{child.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  ) : (
                    <SidebarMenuSubButton
                      onClick={(e) => {
                        if (child.onClick) {
                          e.preventDefault();
                          child.onClick();
                        }
                      }}
                    >
                      {child.icon && (() => {
                        const ChildIcon = (LucideIcons as any)[
                          child.icon
                            .split('-')
                            .map(
                              (s: string) =>
                                s.charAt(0).toUpperCase() + s.slice(1)
                            )
                            .join('')
                        ];
                        return ChildIcon ? <ChildIcon /> : null;
                      })()}
                      <span>{child.label}</span>
                    </SidebarMenuSubButton>
                  )}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // Render single item (no children)
  return (
    <SidebarMenuItem>
      {item.route ? (
        <SidebarMenuButton
          asChild
          tooltip={item.label}
          isActive={isActive}
          disabled={item.disabled}
        >
          <Link to={item.route} onClick={handleClick}>
            {IconComponent && <IconComponent />}
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          tooltip={item.label}
          isActive={isActive}
          disabled={item.disabled}
          onClick={handleClick}
        >
          {IconComponent && <IconComponent />}
          <span>{item.label}</span>
        </SidebarMenuButton>
      )}

      {item.badge && (
        <SidebarMenuBadge>
          <Badge
            className={cn(
              'h-5 min-w-5 px-1 text-xs',
              getBadgeVariantClasses(item.badge.variant)
            )}
          >
            {item.badge.text}
          </Badge>
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}
