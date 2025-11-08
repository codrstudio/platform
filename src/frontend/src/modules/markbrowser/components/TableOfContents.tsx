/**
 * TableOfContents Component
 * SPEC-MARKBROWSER-O-017 to SPEC-MARKBROWSER-O-020
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { extractTOC } from '../utils/tree';

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [toc, setToc] = useState<Array<{ level: number; text: string; id: string }>>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const items = extractTOC(content);
    setToc(items);
  }, [content]);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all headings
    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [toc]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className={cn('space-y-2', className)} aria-label="Índice">
      <h3 className="font-semibold text-sm mb-4">Nesta página</h3>
      <ul className="space-y-2 text-sm">
        {toc.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <button
              onClick={() => handleClick(item.id)}
              className={cn(
                'text-left w-full hover:text-primary transition-colors',
                activeId === item.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
