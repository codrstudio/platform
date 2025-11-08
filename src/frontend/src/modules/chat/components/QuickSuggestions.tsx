/**
 * QuickSuggestions Component
 *
 * Quick reply buttons for common questions.
 *
 * SPEC Compliance: SPEC-CHAT-O-009 to O-011
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
  className?: string;
}

export function QuickSuggestions({
  suggestions,
  onSelect,
  disabled = false,
  className
}: QuickSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={cn('px-4 py-3 border-t bg-muted/30', className)}>
      <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="whitespace-nowrap"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
