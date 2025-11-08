/**
 * App Components Module
 *
 * Este módulo fornece componentes especializados para construção de aplicativos robustos
 * (dashboards, CRUDs, helpdesks, kanbans).
 *
 * @module app-components
 * @type components
 */

// Re-export all components from submodules
export * from './recharts';
export * from './table';
export * from './calendar';
export * from './dnd';
export * from './tiptap';
export * from './dropzone';
export * from './virtual';
export * from './colorful';

// Pre-built components
export * from './components';

// Theme configuration
export { configureAppComponents, useAppComponentsTheme } from './theme';
export type { AppComponentsThemeConfig } from './theme';
