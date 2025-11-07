/**
 * Auth Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-AUTH-R-001: Fornece componentes de interface
 * - SPEC-AUTH-R-002: Wrapper sobre Canal de Autenticação
 * - SPEC-AUTH-R-003: Utiliza /api/1/auth/*
 * - SPEC-AUTH-R-004: Suporta múltiplas instâncias
 * - SPEC-AUTH-E-001: Exporta componentes obrigatórios
 * - SPEC-AUTH-E-002: Exporta componentes opcionais
 */

import { authManifest } from './manifest';
import routes from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Pages
export { LoginPage } from './pages/LoginPage';

// Module Exports
export const authModule: ModuleExports = {
  manifest: authManifest,
  routes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(authModule);
