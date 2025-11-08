/**
 * Chart Widgets (Line, Bar, Pie)
 *
 * SPEC Compliance: SPEC-DASH-W-001 (Chart widgets)
 * Uses Recharts library as specified in STACK.md
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ChartConfig } from '../types';

export interface ChartWidgetProps {
  title: string;
  data: Record<string, unknown>[];
  config: ChartConfig;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export function LineChartWidget({ title, data, config, isLoading, className }: ChartWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const yFields = Array.isArray(config.yField) ? config.yField : [config.yField];
  const colors = config.colors || DEFAULT_COLORS;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            {config.grid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xField} />
            <YAxis />
            <Tooltip />
            {config.legend !== false && <Legend />}
            {yFields.map((field, index) => (
              <Line
                key={field}
                type="monotone"
                dataKey={field}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BarChartWidget({ title, data, config, isLoading, className }: ChartWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const yFields = Array.isArray(config.yField) ? config.yField : [config.yField];
  const colors = config.colors || DEFAULT_COLORS;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            {config.grid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xField} />
            <YAxis />
            <Tooltip />
            {config.legend !== false && <Legend />}
            {yFields.map((field, index) => (
              <Bar
                key={field}
                dataKey={field}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PieChartWidget({ title, data, config, isLoading, className }: ChartWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const colors = config.colors || DEFAULT_COLORS;
  const yField = Array.isArray(config.yField) ? config.yField[0] : config.yField;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={yField}
              nameKey={config.xField}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {config.legend !== false && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
