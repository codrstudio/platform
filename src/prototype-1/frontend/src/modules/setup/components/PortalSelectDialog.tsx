/**
 * Portal Select Dialog Component
 * Professional portal selection with search and validation
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check } from 'lucide-react';
import type { Portal } from '@/core/portals/types';

interface PortalSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portals: Portal[];
  activePortals?: Portal[];
  title: string;
  description: string;
  onSelect: (portalId: string) => void;
  mode?: 'activate' | 'deactivate';
}

export function PortalSelectDialog({
  open,
  onOpenChange,
  portals,
  activePortals = [],
  title,
  description,
  onSelect,
  mode = 'activate',
}: PortalSelectDialogProps) {
  const [search, setSearch] = useState('');

  const activePortalIds = activePortals.map((p) => p.portalId);

  const availablePortals =
    mode === 'activate'
      ? portals.filter((p) => !activePortalIds.includes(p.portalId))
      : portals.filter((p) => activePortalIds.includes(p.portalId));

  const handleSelect = (portalId: string) => {
    onSelect(portalId);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search portals..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No portals found.</CommandEmpty>
            {availablePortals.length > 0 && (
              <CommandGroup heading="Available Portals">
                {availablePortals.map((portal) => {
                  const isActive = activePortalIds.includes(portal.portalId);
                  return (
                    <CommandItem
                      key={portal.portalId}
                      value={`${portal.portalId} ${portal.name}`}
                      onSelect={() => handleSelect(portal.portalId)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{portal.name}</span>
                        <code className="text-xs text-muted-foreground">
                          {portal.portalId}
                        </code>
                      </div>
                      {isActive && mode === 'deactivate' && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {availablePortals.length === 0 && (
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">
                  {mode === 'activate'
                    ? 'This module is already active in all portals'
                    : 'This module is not active in any portal'}
                </p>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
