import { registerPlatformComponents } from './registerPlatformComponents';
import { registerPlatformCompositions } from './registerPlatformCompositions';

/**
 * Inicializa o sistema de composições da plataforma
 *
 * Deve ser chamado uma vez durante a inicialização da aplicação,
 * antes de renderizar qualquer rota ou componente que use composições.
 *
 * Registra:
 * - Componentes de slots da plataforma (platform-breadcrumb)
 * - Composições base (default, settings)
 */
export function initializePlatformCompositions() {
  registerPlatformComponents();
  registerPlatformCompositions();
}
