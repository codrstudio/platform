import { useEffect } from 'react';

/**
 * Hook para atualizar o título do documento (aba do navegador)
 *
 * @param title - Título a ser exibido (se undefined, usa "Platform" como fallback)
 *
 * @example
 * ```tsx
 * // Em um componente
 * useDocumentTitle('Meu Portal');
 *
 * // Com fallback
 * useDocumentTitle(portal?.name);
 * ```
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    // Backup do título original
    const previousTitle = document.title;

    // Atualiza o título (usa "Platform" como fallback se title for undefined)
    document.title = title || 'Platform';

    // Cleanup: restaura título anterior quando o componente desmontar
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
