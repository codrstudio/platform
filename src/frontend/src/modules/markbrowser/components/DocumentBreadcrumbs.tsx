/**
 * DocumentBreadcrumbs Component
 * SPEC-MARKBROWSER-O-021, SPEC-MARKBROWSER-O-022
 */

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBreadcrumbs } from '../utils/tree';

interface DocumentBreadcrumbsProps {
  path: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function DocumentBreadcrumbs({ path, onNavigate, className }: DocumentBreadcrumbsProps) {
  const breadcrumbs = getBreadcrumbs(path);

  return (
    <nav
      className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
      aria-label="Breadcrumb"
    >
      <button
        onClick={() => onNavigate?.('/')}
        className="hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </button>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate?.(crumb.path)}
            className={cn(
              'hover:text-foreground transition-colors',
              index === breadcrumbs.length - 1 && 'text-foreground font-medium'
            )}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </nav>
  );
}
