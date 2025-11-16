import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export interface SidebarBrandProps {
  logo?: React.ReactNode;
  portalName?: string;
  showLogo?: boolean;
  className?: string;
}

export function SidebarBrand({
  logo,
  portalName = 'Portal',
  showLogo = true,
  className,
}: SidebarBrandProps) {
  const { state, toggleSidebar } = useSidebar();
  const [isHovered, setIsHovered] = React.useState(false);
  const isCollapsed = state === 'collapsed';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-3 group/brand cursor-pointer select-none',
        'hover:bg-sidebar-accent/50 rounded-md transition-colors',
        className
      )}
      onClick={toggleSidebar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      {showLogo && (
        <div className="flex-shrink-0 relative">
          {logo || (
            <div className="h-8 w-8 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-sm">
              {portalName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Ícone de expandir/colapsar no hover */}
          {isHovered && (
            <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-150">
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Nome do Portal */}
      <div
        className={cn(
          'flex-1 min-w-0 transition-all duration-200',
          'group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0'
        )}
      >
        <h2 className="font-semibold text-sm text-sidebar-foreground truncate">
          {portalName}
        </h2>
      </div>

      {/* Ícone de toggle quando expandido (sem hover) */}
      {!isHovered && !isCollapsed && (
        <div className="flex-shrink-0 text-sidebar-foreground/50 transition-opacity opacity-0 group-hover/brand:opacity-100">
          <ChevronLeft className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
