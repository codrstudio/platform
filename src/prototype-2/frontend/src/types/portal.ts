// Portal type definitions
// Based on SPEC-concepts.md Portal concept

export interface Portal {
  portalId: string;
  name: string;
  description?: string;
  path: string;
  settingsKey?: string; // Theme sharing key (default: 'default')
  activeModules: string[];
  settings: Record<string, unknown>;
  removable: boolean;
}
