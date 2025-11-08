/**
 * DocumentSearch Component
 * SPEC-MARKBROWSER-O-001 to SPEC-MARKBROWSER-O-004
 */

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Document } from '../types';

interface DocumentSearchProps {
  documents: Document[];
  onDocumentSelect: (documentId: string, path: string) => void;
  className?: string;
}

interface SearchResult {
  document: Document;
  matchType: 'name' | 'title' | 'content';
  excerpt?: string;
}

export function DocumentSearch({ documents, onDocumentSelect, className }: DocumentSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const matches: SearchResult[] = [];

    documents.forEach((doc) => {
      if (doc.isDirectory) return;

      // Search in name
      if (doc.name.toLowerCase().includes(searchTerm)) {
        matches.push({
          document: doc,
          matchType: 'name',
        });
        return;
      }

      // Search in title
      if (doc.title?.toLowerCase().includes(searchTerm)) {
        matches.push({
          document: doc,
          matchType: 'title',
        });
        return;
      }

      // Search in content (full-text)
      if (doc.content.toLowerCase().includes(searchTerm)) {
        const index = doc.content.toLowerCase().indexOf(searchTerm);
        const start = Math.max(0, index - 50);
        const end = Math.min(doc.content.length, index + searchTerm.length + 50);
        const excerpt = doc.content.slice(start, end);

        matches.push({
          document: doc,
          matchType: 'content',
          excerpt: (start > 0 ? '...' : '') + excerpt + (end < doc.content.length ? '...' : ''),
        });
      }
    });

    return matches;
  }, [query, documents]);

  const highlightMatch = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-yellow-200 dark:bg-yellow-800">{text.slice(index, index + query.length)}</mark>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar documentos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isFocused && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-popover border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((result) => (
            <button
              key={result.document.id}
              onClick={() => {
                onDocumentSelect(result.document.id, result.document.path);
                setQuery('');
              }}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
            >
              <div className="font-medium text-sm mb-1">
                {highlightMatch(result.document.title || result.document.name, query)}
              </div>
              <div className="text-xs text-muted-foreground">{result.document.path}</div>
              {result.excerpt && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {highlightMatch(result.excerpt, query)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
