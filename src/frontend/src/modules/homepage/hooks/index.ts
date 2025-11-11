/**
 * Homepage Module Hooks
 *
 * Exporta todos os hooks do módulo Homepage para fácil importação.
 *
 * @module hooks
 */

// Data Access Hooks
export { useHomepageConfig } from './useHomepageConfig';
export { useUpdateHomepageConfig } from './useUpdateHomepageConfig';

// Portal Data Hook
export { usePortalsList } from './usePortalsList';
export type { Portal } from './usePortalsList';

// Animation & Accessibility Hooks
export { useScrollAnimation } from './useScrollAnimation';
export { useReducedMotion } from './useReducedMotion';
