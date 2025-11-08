/**
 * MermaidDiagram - Renderiza diagramas Mermaid
 *
 * Features:
 * - Flowchart, Sequence, Class, State, ER, Gantt, Pie, Git graphs
 * - Tema claro/escuro automático
 * - Error handling graceful
 */

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

// Configurar Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

export function MermaidDiagram({ code, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detectar tema escuro
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches || document.documentElement.classList.contains('dark'));

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Configurar tema baseado no modo
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    const renderDiagram = async () => {
      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao renderizar diagrama. Verifique a sintaxe.'
        );
      }
    };

    renderDiagram();
  }, [code, isDark]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-start gap-2 p-4 border rounded-lg bg-destructive/10 border-destructive/50',
          className
        )}
      >
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">
            Erro no diagrama Mermaid
          </p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'mermaid-container flex justify-center items-center p-4 border rounded-lg bg-card',
        '[&_svg]:max-w-full [&_svg]:h-auto',
        className
      )}
    />
  );
}
