/**
 * Command Palette Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-CP-M-*: Modalidades (suspensa e expandida)
 * - SPEC-CP-R-001: Three pillars (search, commands, agents)
 * - SPEC-CP-K-*: Navegação por teclado
 */

import { commandPaletteManifest } from './manifest';
import routes from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Pages
export { CommandPalettePage } from './pages/CommandPalettePage';

// Hooks
export { useCommandPalette } from './hooks/useCommandPalette';

// Types
export type {
  CommandPaletteMode,
  ActionType,
  InteractionType,
  ParamMode,
  SearchableParam,
  SearchableAction,
  Action,
  SearchResult,
  SearchResultGroup,
  Agent,
  HistoryItem,
  CommandPaletteConfig,
  CommandContext,
  AgentContext
} from './types';

// Module Exports
export const commandPaletteModule: ModuleExports = {
  manifest: commandPaletteManifest,
  routes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(commandPaletteModule);
