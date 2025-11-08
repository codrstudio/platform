/**
 * Dashboard Module - Main Export
 *
 * Customizable dashboards with data visualization widgets.
 *
 * SPEC: SPEC-module-dashboard.md
 */

import { dashboardManifest } from './manifest';
import { dashboardRoutes } from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Widgets
export * from './widgets';

// Pages
export { DashboardView } from './pages/DashboardView';

// Hooks
export { useDashboard } from './hooks/useDashboard';

// Types
export type {
  WidgetType,
  GridPosition,
  DataSource,
  MetricConfig,
  ChartConfig,
  TableConfig,
  TextConfig,
  ColumnConfig,
  Widget,
  GlobalFilter,
  DashboardInstanceConfig,
  DashboardState
} from './types';

// Module Exports
export const dashboardModule: ModuleExports = {
  manifest: dashboardManifest,
  routes: dashboardRoutes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(dashboardModule);
