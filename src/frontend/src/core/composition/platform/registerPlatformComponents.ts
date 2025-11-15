import { slotComponentRegistry } from '../SlotComponentRegistry';
import { PlatformBreadcrumb } from '../components/PlatformBreadcrumb';

/**
 * Registra componentes de slots fornecidos pela plataforma
 *
 * Componentes da plataforma são componentes base que podem ser
 * usados em qualquer composição, independente de módulos ativos.
 */
export function registerPlatformComponents() {
  slotComponentRegistry.register({
    slot: 'breadcrumb',
    componentId: 'platform-breadcrumb',
    component: PlatformBreadcrumb,
    providedBy: 'platform',
    name: 'Platform Breadcrumb',
  });
}
