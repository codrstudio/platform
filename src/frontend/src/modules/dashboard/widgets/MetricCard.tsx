/**
 * MetricCard Widget
 *
 * SPEC Compliance: SPEC-DASH-W-001 (Metric Card)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricConfig } from '../types';

export interface MetricCardProps {
  title: string;
  data: Record<string, unknown>[];
  config: MetricConfig;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({ title, data, config, isLoading, className }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const record = data?.[0] || {};
  const rawValue = record[config.valueField];
  const value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue)) || 0;

  // Format value
  let formattedValue = '';
  if (config.format === 'currency') {
    formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  } else if (config.format === 'percentage') {
    formattedValue = `${value.toFixed(1)}%`;
  } else {
    formattedValue = new Intl.NumberFormat('pt-BR').format(value);
  }

  if (config.prefix) formattedValue = config.prefix + formattedValue;
  if (config.suffix) formattedValue = formattedValue + config.suffix;

  // Calculate trend
  let trend: number | null = null;
  let trendDirection: 'up' | 'down' | null = null;
  if (config.trendField && record[config.trendField]) {
    const trendValue = parseFloat(String(record[config.trendField])) || 0;
    trend = trendValue;
    trendDirection = trendValue >= 0 ? 'up' : 'down';
  }

  // Get icon
  let Icon: LucideIcon | null = null;
  if (config.icon && config.icon in Icons) {
    Icon = Icons[config.icon as keyof typeof Icons] as LucideIcon;
  }

  // Determine trend color
  const isTrendPositive = config.trendType === 'positive-up'
    ? trendDirection === 'up'
    : trendDirection === 'down';

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {trend !== null && (
          <div className={cn(
            'flex items-center gap-1 text-xs mt-1',
            isTrendPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            {trendDirection === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
