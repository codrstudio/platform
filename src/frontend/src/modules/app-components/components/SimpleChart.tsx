/**
 * SimpleChart - Gráfico simples com Recharts
 *
 * Wrapper pronto para uso com integração de tema.
 * SPEC-MC-AP-025, SPEC-MC-AP-026
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from '../recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  height?: number;
}

/**
 * Gráfico de linha simples com tema aplicado
 *
 * Usa CSS custom properties para cores que se adaptam ao tema.
 */
export function SimpleChart({ data, dataKey = 'value', height = 300 }: SimpleChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid
          stroke="hsl(var(--border))"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            color: 'hsl(var(--card-foreground))',
          }}
          labelStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
