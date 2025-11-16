import { slotComponentRegistry } from '../SlotComponentRegistry';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

/**
 * Registra componentes de slots fornecidos pela plataforma
 *
 * Componentes da plataforma são componentes base que podem ser
 * usados em qualquer composição, independente de módulos ativos.
 */
export function registerPlatformComponents() {
  slotComponentRegistry.register({
    slot: 'breadcrumb',
    componentId: 'portal-breadcrumb',
    component: PortalBreadcrumb,
    providedBy: 'platform',
    name: 'Portal Breadcrumb',
    replace: true, // Componente controla próprio wrapper e padding
  });
}
