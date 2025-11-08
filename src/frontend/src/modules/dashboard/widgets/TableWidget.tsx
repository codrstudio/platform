/**
 * TableWidget Component
 *
 * SPEC Compliance: SPEC-DASH-W-001 (Table widget)
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableConfig } from '../types';
import { format as formatDate } from 'date-fns';

export interface TableWidgetProps {
  title: string;
  data: Record<string, unknown>[];
  config: TableConfig;
  isLoading?: boolean;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function TableWidget({ title, data, config, isLoading, className }: TableWidgetProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = config.pageSize || 10;

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;

      const comparison = (aVal as number | string) > (bVal as number | string) ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!config.filterable || !filterText) return sortedData;

    const searchLower = filterText.toLowerCase();
    return sortedData.filter(row =>
      config.columns.some(col => {
        const value = String(row[col.key] || '').toLowerCase();
        return value.includes(searchLower);
      })
    );
  }, [sortedData, filterText, config.filterable, config.columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!config.paginated) return filteredData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize, config.paginated]);

  const totalPages = config.paginated ? Math.ceil(filteredData.length / pageSize) : 1;

  const handleSort = (columnKey: string) => {
    if (!config.sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: unknown, format?: string): string => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(value));
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(Number(value));
      case 'date':
        try {
          return formatDate(new Date(String(value)), 'dd/MM/yyyy');
        } catch {
          return String(value);
        }
      default:
        return String(value);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {config.filterable && (
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 h-8"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="border rounded-md">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {config.columns.map(column => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-muted-foreground',
                      config.sortable && column.sortable !== false && 'cursor-pointer hover:text-foreground'
                    )}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {config.sortable && column.sortable !== false && (
                        <span className="text-muted-foreground">
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum dado encontrado
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t hover:bg-muted/50">
                    {config.columns.map(column => (
                      <td key={column.key} className="px-4 py-3 text-sm">
                        {formatCellValue(row[column.key], column.format)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {config.paginated && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({filteredData.length} registros)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
