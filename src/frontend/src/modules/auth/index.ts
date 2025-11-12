/**
 * Auth Module - Main Export
 *
 * Módulo de autenticação que funciona como mecanismo de proteção de rotas.
 * Quando ativo em um portal, exige autenticação para acessar as rotas.
 * Quando inativo, as rotas são públicas.
 *
 * IMPORTANTE: Este módulo NÃO fornece UI de autenticação (login pages, logout buttons, etc).
 * A UI de login é fornecida globalmente pela aplicação.
 *
 * SPEC Compliance:
 * - SPEC-AUTH-R-001: Controla se rotas são protegidas ou públicas
 * - SPEC-AUTH-R-002: NÃO fornece UI de autenticação
 * - SPEC-AUTH-R-003: NÃO implementa lógica de autenticação (usa AuthContext global)
 * - SPEC-AUTH-R-004: DEVE ter exatamente UMA instância por portal (single-instance)
 * - SPEC-AUTH-RP-004: Proteção implementada por ProtectedRoute global
 * - SPEC-AUTH-INF-002: NÃO fornece AuthContext (já existe globalmente)
 * - SPEC-AUTH-INF-003: NÃO fornece LoginPage (já existe globalmente)
 */

import { authManifest } from './manifest';
import type { ModuleExports } from '@/types/module';

// Module Exports
export const authModule: ModuleExports = {
  manifest: authManifest,
  routes: [] // Não fornece rotas (SPEC-AUTH-R-002)
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(authModule);
