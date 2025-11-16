/**
 * Sidebar Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-MD-IDX-001: Entry point obrigatório
 * - SPEC-MD-IDX-002: Auto-registro obrigatório
 * - SPEC-MD-IDX-003: Sem lógica de negócio
 * - SPEC-MD-IDX-004: Lazy-loading de config
 * - SPEC-MD-LAZ-001: Estratégia de dois níveis
 */

import { lazy } from 'react';
import type { ModuleExports } from '@/types/module';
import { sidebarManifest } from './manifest';
import { slotComponents } from './components/slots';
import { moduleRegistry } from '@/core/modules';

// Lazy-load do componente de configuração (SPEC-MD-IDX-004)
const SidebarConfigForm = lazy(() =>
  import('./components/config-forms/SidebarConfigForm').then((m) => ({
    default: m.SidebarConfigForm,
  }))
);

/**
 * Module exports object
 *
 * SPEC-MD-IDX-001: Estrutura padrão de ModuleExports
 */
export const sidebarModule: ModuleExports = {
  manifest: sidebarManifest,
  configComponent: SidebarConfigForm,
  slotComponents,
  // routes: não fornece (providesRoutes: false)
  // compositions: não fornece (providesCompositions: false)
  // slotConfigForms: não tem formulários de configuração de slots específicos
};

/**
 * Auto-registro do módulo
 *
 * SPEC-MD-IDX-002: Módulo DEVE se auto-registrar
 * SPEC-MD-INT-001: Auto-registro ao ser importado
 */
moduleRegistry.register(sidebarModule);

/**
 * Re-export types for external usage
 *
 * SPEC-MD-NAM-009: Types com PascalCase
 */
export type {
  SidebarLayout,
  SidebarVariant,
  BadgeVariant,
  MenuBadge,
  MenuItem,
  UserAction,
  UserMenuConfig,
  SidebarBrandConfig,
  SidebarConfig,
} from './types';

/**
 * Re-export components for external usage (if needed)
 *
 * Note: Components are primarily used via slot system,
 * but can be imported directly if needed.
 */

// Slot component is exported via slotComponents array, not directly
// export { Sidebar } from './components/slots/Sidebar';
