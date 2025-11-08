/**
 * useDashboard Hook
 *
 * Hook for dashboard state and widget data management.
 *
 * SPEC Compliance:
 * - SPEC-DASH-R-003: Data fetching via JQEL
 * - SPEC-DASH-U-001, U-002: Polling support
 * - SPEC-DASH-M-*: Dashboard modes
 */

import { useState, useCallback } from 'react';
import { useJQELQuery } from '@/hooks/useJQEL';
import type { Widget, DashboardInstanceConfig, DashboardState } from '../types';

export interface WidgetData {
  widgetId: string;
  data: Record<string, unknown>[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface DashboardHookState {
  widgets: Widget[];
  widgetDataMap: Map<string, WidgetData>;
  dashboardState: DashboardState;
  setEditMode: (enabled: boolean) => void;
  setFullscreen: (enabled: boolean) => void;
  setFilter: (filterId: string, value: unknown) => void;
  refreshAll: () => void;
}

export function useDashboard(config: DashboardInstanceConfig): DashboardHookState {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isEditMode: false,
    isFullscreen: false,
    activeFilters: {}
  });

  const widgetDataMap = new Map<string, WidgetData>();

  // Create a query for each widget that has a data source
  config.widgets.forEach(widget => {
    if (!widget.dataSource) return;

    const refreshInterval = widget.dataSource.refreshInterval || config.refreshInterval || 0;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading, error, refetch } = useJQELQuery(
      {
        schema: widget.dataSource.schema,
        select: widget.dataSource.select,
        where: {
          ...widget.dataSource.where,
          ...applyGlobalFilters(dashboardState.activeFilters, config.filters || [])
        },
        options: widget.dataSource.options,
        output: widget.dataSource.output
      },
      {
        refetchInterval: refreshInterval > 0 ? refreshInterval : false,
        refetchIntervalInBackground: false
      }
    );

    widgetDataMap.set(widget.id, {
      widgetId: widget.id,
      data: (data?.data as Record<string, unknown>[]) || [],
      isLoading,
      error: error as Error | null,
      refetch
    });
  });

  const setEditMode = useCallback((enabled: boolean) => {
    setDashboardState(prev => ({ ...prev, isEditMode: enabled }));
  }, []);

  const setFullscreen = useCallback((enabled: boolean) => {
    setDashboardState(prev => ({ ...prev, isFullscreen: enabled }));
  }, []);

  const setFilter = useCallback((filterId: string, value: unknown) => {
    setDashboardState(prev => ({
      ...prev,
      activeFilters: { ...prev.activeFilters, [filterId]: value }
    }));
  }, []);

  const refreshAll = useCallback(() => {
    widgetDataMap.forEach(widgetData => widgetData.refetch());
  }, [widgetDataMap]);

  return {
    widgets: config.widgets,
    widgetDataMap,
    dashboardState,
    setEditMode,
    setFullscreen,
    setFilter,
    refreshAll
  };
}

function applyGlobalFilters(
  activeFilters: Record<string, unknown>,
  filterDefinitions: Array<{ id: string; type: string }>
): Record<string, unknown> {
  const appliedFilters: Record<string, unknown> = {};

  filterDefinitions.forEach(filter => {
    const value = activeFilters[filter.id];
    if (value !== undefined && value !== null) {
      appliedFilters[filter.id] = { $eq: value };
    }
  });

  return appliedFilters;
}
