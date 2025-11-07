/**
 * CommandPalettePage Component
 *
 * Interface expandida do Command Palette (página completa).
 *
 * SPEC Compliance:
 * - SPEC-CP-M-006 to M-009: Modalidade expandida
 */

import { Search } from 'lucide-react';
import { PageBreadcrumb } from '@/components/navigation';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import type { CommandPaletteConfig } from '../types';

export interface CommandPalettePageProps {
  config?: Partial<CommandPaletteConfig>;
  portalId?: string;
}

/**
 * CommandPalettePage component
 */
export function CommandPalettePage({
  portalId
}: CommandPalettePageProps) {
  // Breadcrumb
  const breadcrumbItems = useBreadcrumb({
    portalId,
    moduleName: 'Busca'
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Busca Avançada</h1>
        <p className="text-muted-foreground mt-1">
          Busque conteúdo, execute comandos e invoque agentes
        </p>
      </div>

      {/* Placeholder */}
      <div className="text-center py-12 border rounded-lg">
        <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Command Palette Expandido</h3>
        <p className="text-sm text-muted-foreground">
          A interface expandida do Command Palette será implementada em uma próxima iteração.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Use <kbd className="px-2 py-1 bg-muted border rounded text-xs">Ctrl+K</kbd> para abrir o Command Palette suspenso.
        </p>
      </div>
    </div>
  );
}
