/**
 * IconSelector - Seletor de Ícones Lucide
 *
 * Permite selecionar um ícone dentre os 2000+ ícones do Lucide React.
 * Simplificado com busca e preview visual.
 */

import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string | undefined) => void;
}

// Ícones comuns (preview rápido)
const COMMON_ICONS = [
  'Home',
  'LayoutDashboard',
  'Users',
  'User',
  'Settings',
  'FileText',
  'Folder',
  'Mail',
  'Bell',
  'Calendar',
  'Clock',
  'Search',
  'Plus',
  'Edit',
  'Trash2',
  'Check',
  'X',
  'ChevronRight',
  'Menu',
  'MoreVertical',
];

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Todos os ícones disponíveis
  const allIconNames = React.useMemo(() => {
    return Object.keys(LucideIcons)
      .filter((key) => {
        // Filtrar apenas componentes (funções), não tipos
        return typeof (LucideIcons as any)[key] === 'object';
      })
      .sort();
  }, []);

  // Ícones filtrados por busca
  const filteredIcons = React.useMemo(() => {
    if (!searchQuery) return COMMON_ICONS;

    return allIconNames.filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allIconNames]);

  const CurrentIcon = value ? (LucideIcons as any)[value] : null;

  const handleSelect = (iconName: string | undefined) => {
    onChange(iconName);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start"
        >
          {CurrentIcon ? (
            <div className="flex items-center gap-2">
              <CurrentIcon className="h-4 w-4" />
              <span className="truncate">{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecionar ícone...</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Buscar ícone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 p-0 focus-visible:ring-0 text-sm"
          />
        </div>

        <ScrollArea className="h-72">
          <div className="p-2">
            {/* Opção "Sem ícone" */}
            <button
              onClick={() => handleSelect(undefined)}
              className={cn(
                'w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent text-left text-sm',
                !value && 'bg-accent'
              )}
            >
              <div className="w-4 h-4" />
              <span className="text-muted-foreground">Sem ícone</span>
            </button>

            {/* Grid de ícones */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              {filteredIcons.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                if (!Icon) return null;

                return (
                  <button
                    key={iconName}
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 p-2 rounded-sm hover:bg-accent',
                      value === iconName && 'bg-accent'
                    )}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhum ícone encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
