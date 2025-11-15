import { useState, useEffect } from 'react';

/**
 * Hook para acesso programático a áreas do layout via DOM
 *
 * Permite que módulos acessem áreas específicas do layout atual
 * através dos IDs padronizados:
 * - 'portal-root' - Raiz do portal
 * - 'navbar' - Barra de navegação
 * - 'sidebar' - Barra lateral esquerda
 * - 'breadcrumb' - Navegação hierárquica
 * - 'main-content' - Conteúdo principal
 * - 'companion' - Barra lateral direita
 * - 'footer' - Rodapé
 *
 * @param areaId - ID da área a ser acessada
 * @returns Elemento HTML da área ou null se não encontrado
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mainContent = useCompositionArea('main-content');
 *
 *   useEffect(() => {
 *     if (mainContent) {
 *       // Acessa o conteúdo da área principal
 *       console.log('Texto do conteúdo:', mainContent.innerText);
 *     }
 *   }, [mainContent]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useCompositionArea(areaId: string): HTMLElement | null {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(areaId);
    setElement(el);
  }, [areaId]);

  return element;
}
