/**
 * Dashboard Module Types
 *
 * SPEC Compliance: SPEC-DASH-*
 */

export type WidgetType =
  | 'metric'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'table'
  | 'text';

export interface GridPosition {
  x: number;  // Column (0-11)
  y: number;  // Row
  w: number;  // Width in columns
  h: number;  // Height in grid units
}

export interface DataSource {
  schema: string;
  select: string;
  where?: Record<string, unknown>;
  options?: {
    orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    limit?: number;
  };
  output?: string[];
  refreshInterval?: number;  // Override global refresh
}

export interface MetricConfig {
  valueField: string;
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
  icon?: string;
  trendField?: string;
  trendType?: 'positive-up' | 'negative-up';
}

export interface ChartConfig {
  xField: string;
  yField: string | string[];
  colors?: string[];
  legend?: boolean;
  grid?: boolean;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  format?: 'text' | 'number' | 'date' | 'currency';
}

export interface TableConfig {
  columns: ColumnConfig[];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  exportable?: boolean;
}

export interface TextConfig {
  content: string;
  markdown?: boolean;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: GridPosition;
  dataSource?: DataSource;
  config?: MetricConfig | ChartConfig | TableConfig | TextConfig;
}

export interface GlobalFilter {
  id: string;
  type: 'dateRange' | 'select' | 'text';
  label: string;
  default?: string;
  options?: string[];
}

export interface DashboardInstanceConfig {
  instanceId: string;
  title: string;
  route: string;
  widgets: Widget[];
  description?: string;
  refreshInterval?: number;  // Auto-refresh in ms (0 = disabled)
  gridColumns?: number;       // Default: 12
  editable?: boolean;
  requiresAuth?: boolean;
  requiredPermission?: string;
  theme?: 'default' | 'compact';
  fullscreen?: boolean;
  filters?: GlobalFilter[];
}

export interface DashboardState {
  isEditMode: boolean;
  isFullscreen: boolean;
  activeFilters: Record<string, unknown>;
}
