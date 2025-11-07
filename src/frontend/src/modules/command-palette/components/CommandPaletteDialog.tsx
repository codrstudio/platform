/**
 * CommandPaletteDialog Component
 *
 * Interface suspensa do Command Palette (modal overlay).
 *
 * SPEC Compliance:
 * - SPEC-CP-M-001 to M-005: Modalidade suspensa
 * - SPEC-CP-K-001 to K-004: Navegação por teclado
 * - SPEC-CP-R-001 to R-006: Renderização de resultados
 */

import { useEffect } from 'react';
import { Search, Loader2, Hash, AtSign } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '../hooks/useCommandPalette';
import type { CommandPaletteConfig } from '../types';

export interface CommandPaletteDialogProps {
  config?: Partial<CommandPaletteConfig>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * CommandPaletteDialog component
 *
 * Usage:
 * ```tsx
 * <CommandPaletteDialog
 *   config={instanceConfig}
 *   open={open}
 *   onOpenChange={setOpen}
 * />
 * ```
 */
export function CommandPaletteDialog({
  config,
  open: controlledOpen,
  onOpenChange
}: CommandPaletteDialogProps) {
  const {
    open: internalOpen,
    setOpen: setInternalOpen,
    query,
    setQuery,
    loading,
    results,
    agents,
    interactionType,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleAgentInvocation,
    config: fullConfig
  } = useCommandPalette(config);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Register keyboard shortcut (SPEC-CP-M-002)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Parse shortcut (e.g., "Ctrl+K", "Cmd+K")
      const shortcut = fullConfig.suspendedShortcut || 'Ctrl+K';
      const parts = shortcut.split('+');
      const key = parts[parts.length - 1].toLowerCase();
      const needsCtrl = parts.includes('Ctrl');
      const needsCmd = parts.includes('Cmd');
      const needsShift = parts.includes('Shift');
      const needsAlt = parts.includes('Alt');

      const matches =
        e.key.toLowerCase() === key &&
        (!needsCtrl || e.ctrlKey) &&
        (!needsCmd || e.metaKey) &&
        (!needsShift || e.shiftKey) &&
        (!needsAlt || e.altKey);

      if (matches) {
        e.preventDefault();
        setOpen(!open);
      }

      // Close on Escape
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fullConfig.suspendedShortcut, open, setOpen]);

  // Reset query and selection when closing
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open, setQuery, setSelectedIndex]);

  // Get icon for interaction type
  const getInteractionIcon = () => {
    switch (interactionType) {
      case 'command':
        return <Hash className="h-4 w-4 text-muted-foreground" />;
      case 'agent':
        return <AtSign className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get placeholder text
  const getPlaceholder = () => {
    if (!fullConfig.enableSearch && !fullConfig.enableCommands && !fullConfig.enableAgents) {
      return 'Command Palette desabilitado';
    }

    const parts: string[] = [];
    if (fullConfig.enableSearch) parts.push('Buscar');
    if (fullConfig.enableCommands) parts.push('/comandos');
    if (fullConfig.enableAgents) parts.push('@agentes');

    return parts.join(', ');
  };

  // Handle result selection
  const handleSelect = (index: number) => {
    const result = results.flatMap(g => g.results)[index];
    if (result) {
      result.onSelect();
      setOpen(false);
    }
  };

  // Flatten results for selection
  const flatResults = results.flatMap(g => g.results);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-2xl p-0 gap-0"
        onKeyDown={handleKeyDown}
      >
        {/* Header with search input */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            {getInteractionIcon()}
            <Input
              autoFocus
              placeholder={getPlaceholder()}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 shadow-none text-base h-10"
              disabled={!fullConfig.enableSearch && !fullConfig.enableCommands && !fullConfig.enableAgents}
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </DialogHeader>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          {/* Empty state */}
          {!loading && flatResults.length === 0 && query && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum resultado encontrado</p>
            </div>
          )}

          {/* Command/Agent hints */}
          {!query && (
            <div className="space-y-2 text-sm text-muted-foreground">
              {fullConfig.enableSearch && (
                <p>Digite para buscar...</p>
              )}
              {fullConfig.enableCommands && (
                <p><Hash className="inline h-3 w-3" /> Digite <code className="px-1 py-0.5 bg-muted rounded">/</code> para comandos</p>
              )}
              {fullConfig.enableAgents && (
                <p><AtSign className="inline h-3 w-3" /> Digite <code className="px-1 py-0.5 bg-muted rounded">@</code> para agentes</p>
              )}
            </div>
          )}

          {/* Agent selection */}
          {interactionType === 'agent' && query.startsWith('@') && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Agentes
              </h3>
              {agents.map((agent, index) => {
                const AgentIcon = agent.icon
                  ? (LucideIcons as any)[
                      agent.icon.split('-').map((s: string) =>
                        s.charAt(0).toUpperCase() + s.slice(1)
                      ).join('')
                    ]
                  : LucideIcons.Bot;

                return (
                  <button
                    key={agent.id}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg text-left',
                      'hover:bg-accent transition-colors',
                      index === selectedIndex && 'bg-accent'
                    )}
                    onClick={() => {
                      const agentQuery = query.substring(agent.name.length + 2).trim();
                      if (agentQuery) {
                        handleAgentInvocation(agent.id, agentQuery);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <AgentIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{agent.name}</div>
                      {agent.description && (
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {agent.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search results (SPEC-CP-R-004 to R-006) */}
          {interactionType === 'search' && results.length > 0 && (
            <div className="space-y-4">
              {results.map((group) => (
                <div key={group.category} className="space-y-2">
                  {/* Group header */}
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    {group.category}
                    <span className="text-xs">({group.count})</span>
                  </h3>

                  {/* Results in group */}
                  {group.results.map((result, groupIndex) => {
                    const globalIndex = results
                      .slice(0, results.indexOf(group))
                      .reduce((acc, g) => acc + g.results.length, 0) + groupIndex;

                    const ResultIcon = result.icon
                      ? (LucideIcons as any)[
                          result.icon.split('-').map((s: string) =>
                            s.charAt(0).toUpperCase() + s.slice(1)
                          ).join('')
                        ]
                      : LucideIcons.FileText;

                    return (
                      <button
                        key={result.id}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 rounded-lg text-left',
                          'hover:bg-accent transition-colors',
                          globalIndex === selectedIndex && 'bg-accent'
                        )}
                        onClick={() => handleSelect(globalIndex)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <ResultIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{result.title}</div>
                          {result.description && (
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {result.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-background border rounded text-[10px]">↑</kbd>
              <kbd className="px-2 py-0.5 bg-background border rounded text-[10px]">↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
              selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-background border rounded text-[10px]">esc</kbd>
              fechar
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
