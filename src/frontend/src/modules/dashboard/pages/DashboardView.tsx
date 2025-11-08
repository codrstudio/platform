/**
 * DashboardView Page
 *
 * SPEC Compliance: SPEC-DASH-*
 */

import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardGrid } from '../components/DashboardGrid';
import { MetricCard } from '../widgets/MetricCard';
import { LineChartWidget, BarChartWidget, PieChartWidget } from '../widgets/ChartWidgets';
import { TableWidget } from '../widgets/TableWidget';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardInstanceConfig, Widget, MetricConfig, ChartConfig, TableConfig } from '../types';
import { cn } from '@/lib/utils';

export interface DashboardViewProps {
  config: DashboardInstanceConfig;
}

export function DashboardView({ config }: DashboardViewProps) {
  const {
    widgets,
    widgetDataMap,
    dashboardState,
    setFullscreen,
    refreshAll
  } = useDashboard(config);

  const renderWidget = (widget: Widget) => {
    const widgetData = widgetDataMap.get(widget.id);
    const data = widgetData?.data || [];
    const isLoading = widgetData?.isLoading || false;

    switch (widget.type) {
      case 'metric':
        return (
          <MetricCard
            title={widget.title}
            data={data}
            config={widget.config as MetricConfig}
            isLoading={isLoading}
          />
        );

      case 'line-chart':
        return (
          <LineChartWidget
            title={widget.title}
            data={data}
            config={widget.config as ChartConfig}
            isLoading={isLoading}
          />
        );

      case 'bar-chart':
        return (
          <BarChartWidget
            title={widget.title}
            data={data}
            config={widget.config as ChartConfig}
            isLoading={isLoading}
          />
        );

      case 'pie-chart':
        return (
          <PieChartWidget
            title={widget.title}
            data={data}
            config={widget.config as ChartConfig}
            isLoading={isLoading}
          />
        );

      case 'table':
        return (
          <TableWidget
            title={widget.title}
            data={data}
            config={widget.config as TableConfig}
            isLoading={isLoading}
          />
        );

      case 'text':
        return (
          <div className="bg-card border rounded-lg p-4 h-full">
            <h3 className="font-medium mb-2">{widget.title}</h3>
            <div className="text-sm text-muted-foreground">
              {/* Text widget content would go here */}
              Texto estático ou markdown
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-card border rounded-lg p-4 h-full flex items-center justify-center">
            <span className="text-muted-foreground">
              Widget type não suportado: {widget.type}
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        dashboardState.isFullscreen && 'fixed inset-0 z-50 bg-background'
      )}
    >
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            {config.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              title="Atualizar dados"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {config.fullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!dashboardState.isFullscreen)}
                title={dashboardState.isFullscreen ? 'Sair do modo fullscreen' : 'Modo fullscreen'}
              >
                {dashboardState.isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto p-4">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Dashboard vazio
              </h3>
              <p className="text-sm text-muted-foreground">
                Nenhum widget configurado para este dashboard.
              </p>
            </div>
          </div>
        ) : (
          <DashboardGrid
            widgets={widgets}
            gridColumns={config.gridColumns || 12}
          >
            {renderWidget}
          </DashboardGrid>
        )}
      </div>
    </div>
  );
}
