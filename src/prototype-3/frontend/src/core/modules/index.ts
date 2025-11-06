export { default as moduleRegistry } from "./ModuleRegistry";
export { registerModules, getRegistryStats } from "./registerModules";
export { default as moduleLoader } from "./ModuleLoader";
export { default as dependencyManager } from "./DependencyManager";
export { default as instanceManager } from "./InstanceManager";
export { default as activationManager } from "./ActivationManager";

// Type exports
export type { ModuleLoadState } from "./ModuleLoader";
export type { DependencyResolution } from "./DependencyManager";
export type { ActivationResult, DeactivationResult } from "./ActivationManager";
