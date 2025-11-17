/**
 * Modules Index - Central module registry
 *
 * This file imports all available modules to trigger their
 * auto-registration in the ModuleRegistry.
 *
 * Each module's index.ts calls moduleRegistry.register() when imported,
 * making the module available for dynamic routing.
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║              ✅  ESTE ARQUIVO É A FONTE DA VERDADE  ✅                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Este arquivo controla quais módulos estão disponíveis no sistema!       ║
 * ║                                                                           ║
 * ║  📄 Arquivo relacionado: src/backend/config/modules.json                  ║
 * ║  └─ Deve conter os mesmos módulos (mas pode ter extras desabilitados)    ║
 * ║                                                                           ║
 * ║  🎯 COMPORTAMENTO AUTOMÁTICO:                                             ║
 * ║  • O backend FILTRA modules.json e retorna apenas módulos importados aqui║
 * ║  • Se um módulo está comentado aqui, NÃO aparece na UI (mesmo se estiver ║
 * ║    no modules.json)                                                       ║
 * ║  • Se um módulo está ativo aqui, mas NÃO está no modules.json, precisa   ║
 * ║    adicionar entrada no JSON com metadados (name, description, etc.)     ║
 * ║                                                                           ║
 * ║  ✅ Adicionar módulo:                                                     ║
 * ║     1. Descomentar/adicionar import aqui                                  ║
 * ║     2. Adicionar entrada em modules.json (se não existir)                ║
 * ║     3. PRONTO! O backend filtra automaticamente                          ║
 * ║                                                                           ║
 * ║  ✅ Remover módulo:                                                       ║
 * ║     1. Comentar import aqui                                               ║
 * ║     2. PRONTO! O backend filtra automaticamente                          ║
 * ║     3. (Opcional) Marcar "enabled": false no modules.json para referência║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * SPEC Compliance:
 * - SPEC-R-LM-007: All modules registered in ModuleRegistry
 * - SPEC-R-LM-008: Auto-registration via module index.ts
 * - SPEC-R-LM-010: Only loads lightweight metadata
 * - SPEC-R-LM-014: New modules must be added here
 *
 * When adding a new module:
 * 1. Create the module in src/modules/nome-modulo/
 * 2. Add moduleId to ACTIVE_MODULES array below
 * 3. Add import statement
 * 4. Add corresponding entry in src/backend/config/modules.json
 * 5. The module will be automatically discovered and available
*/

/**
 * ACTIVE MODULES LIST
 * This array defines which modules are available in the system.
 * The backend reads this list to filter modules.json automatically.
 */
export const ACTIVE_MODULES = [
  'setup',
  'auth',
  'chatify',
  'blueprint',
  'sidebar',
  'homepage',
] as const;

// Module imports - keep in sync with ACTIVE_MODULES above
import './setup';
import './auth';
import './chatify';
import './blueprint';
import './sidebar';
import './homepage';
// import './helpdesk';

// Inactive modules (not in ACTIVE_MODULES):
// import './app-components';
// import './chat';
// import './command-palette';
// import './dashboard';
// import './export-components';
// import './forms';
// import './journey';
// import './kanban';
// import './loading';
// import './markbrowser';
// import './media-components';
// import './notifications';
// import './tasks';

/**
 * Note: This file only imports module metadata (manifests, route definitions).
 * Actual components are lazy-loaded via React.lazy() when routes are accessed.
 *
 * Impact: ~5-10KB total for all module metadata
 * Heavy code (components, pages) is loaded on demand when routes are accessed.
 */
