// Portal type definitions
// Based on SPEC-concepts.md Portal concept

export interface Portal {
  portalId: string;
  name: string;
  description?: string;
  path: string;
  activeModules: string[];
  settings: Record<string, unknown>;
  removable: boolean;
}
