/**
 * Recharts - Gráficos e visualizações de dados
 *
 * Re-exporta todos os componentes do Recharts com configuração de tema aplicada.
 *
 * @see https://recharts.org/
 */

// Re-export all Recharts components
export {
  // Charts
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  RadialBarChart,
  ScatterChart,
  ComposedChart,
  Treemap,
  Sankey,
  Funnel,

  // Components
  Area,
  Bar,
  Line,
  Pie,
  Radar,
  RadialBar,
  Scatter,

  // Axis
  XAxis,
  YAxis,
  ZAxis,

  // Grid & Background
  CartesianGrid,
  PolarGrid,

  // Legend & Tooltip
  Legend,
  Tooltip,

  // Containers
  ResponsiveContainer,

  // Shapes
  Rectangle,
  Sector,

  // Other
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
  Brush,
  Label,
  LabelList,

  // Types
  type TooltipProps,
  type LegendProps,
} from 'recharts';

// Re-export Cell com alias para evitar conflito
export { Cell as RechartsCell } from 'recharts';

// Tema padrão para Recharts
export const RECHARTS_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  muted: 'hsl(var(--muted))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
};

/**
 * Paleta de cores padrão para gráficos (máximo 5 cores)
 */
export const DEFAULT_CHART_COLORS = [
  RECHARTS_COLORS.primary,
  RECHARTS_COLORS.secondary,
  RECHARTS_COLORS.success,
  RECHARTS_COLORS.warning,
  RECHARTS_COLORS.info,
];
