/**
 * IconSelector Component
 *
 * Allows selecting a Lucide React icon by name with preview
 */

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string | undefined) => void;
  className?: string;
}

// Common icons categorized
const commonIcons = [
  'Home',
  'FileText',
  'Settings',
  'Info',
  'User',
  'Users',
  'Mail',
  'Bell',
  'Calendar',
  'Clock',
  'Search',
  'Menu',
  'X',
  'Check',
  'ChevronDown',
  'ChevronUp',
  'ChevronLeft',
  'ChevronRight',
  'Plus',
  'Minus',
  'Edit',
  'Trash2',
  'Download',
  'Upload',
  'Save',
  'Copy',
  'Share',
  'Star',
  'Heart',
  'MessageCircle',
  'Phone',
  'Video',
  'Image',
  'File',
  'Folder',
  'Archive',
  'Bookmark',
  'Tag',
  'Filter',
  'Grid',
  'List',
  'Layout',
  'Layers',
  'Box',
  'Package',
  'ShoppingCart',
  'CreditCard',
  'DollarSign',
  'TrendingUp',
  'BarChart',
  'PieChart',
  'Activity',
  'Zap',
  'Award',
  'Target',
  'Flag',
  'Map',
  'MapPin',
  'Navigation',
  'Compass',
  'Globe',
  'Lock',
  'Unlock',
  'Key',
  'Shield',
  'Eye',
  'EyeOff',
  'AlertCircle',
  'AlertTriangle',
  'CheckCircle',
  'XCircle',
  'HelpCircle',
];

export function IconSelector({ value, onChange, className }: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get all available icon names from lucide-react
  const allIconNames = useMemo(() => {
    return Object.keys(LucideIcons)
      .filter(
        (key) =>
          // Filter out non-component exports
          key !== 'createLucideIcon' &&
          key !== 'default' &&
          typeof LucideIcons[key as keyof typeof LucideIcons] === 'function'
      )
      .sort();
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return commonIcons;

    const query = searchQuery.toLowerCase();
    return allIconNames.filter((name) => name.toLowerCase().includes(query));
  }, [searchQuery, allIconNames]);

  // Get current icon component
  const CurrentIcon = value
    ? (LucideIcons[value as keyof typeof LucideIcons] as React.ElementType)
    : null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <Select value={value || '__none__'} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue>
              {CurrentIcon ? (
                <div className="flex items-center gap-2">
                  <CurrentIcon className="h-4 w-4" />
                  <span>{value}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">No icon</span>
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="max-h-[300px]">
            <div className="sticky top-0 z-10 bg-background p-2 border-b">
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>

            <SelectItem value="__none__">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border rounded border-dashed" />
                <span>No icon</span>
              </div>
            </SelectItem>

            {!searchQuery && (
              <SelectGroup>
                <SelectLabel className="flex items-center gap-2">
                  <span>Common Icons</span>
                  <Badge variant="secondary" className="text-xs">
                    {commonIcons.length}
                  </Badge>
                </SelectLabel>
                {commonIcons.map((iconName) => {
                  const Icon = LucideIcons[
                    iconName as keyof typeof LucideIcons
                  ] as React.ElementType;
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}

            {searchQuery && (
              <SelectGroup>
                <SelectLabel className="flex items-center gap-2">
                  <span>Search Results</span>
                  <Badge variant="secondary" className="text-xs">
                    {filteredIcons.length}
                  </Badge>
                </SelectLabel>
                {filteredIcons.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No icons found for "{searchQuery}"
                  </div>
                ) : (
                  filteredIcons.slice(0, 50).map((iconName) => {
                    const Icon = LucideIcons[
                      iconName as keyof typeof LucideIcons
                    ] as React.ElementType;
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
                {filteredIcons.length > 50 && (
                  <div className="px-2 py-2 text-center text-xs text-muted-foreground">
                    Showing first 50 of {filteredIcons.length} results
                  </div>
                )}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>

        {/* Preview */}
        {CurrentIcon && (
          <div className="flex items-center justify-center w-10 h-10 rounded border bg-muted/50">
            <CurrentIcon className="h-5 w-5" />
          </div>
        )}
      </div>

      {value && (
        <p className="text-xs text-muted-foreground">
          Using <code className="px-1 py-0.5 rounded bg-muted">{value}</code> from Lucide React
        </p>
      )}
    </div>
  );
}