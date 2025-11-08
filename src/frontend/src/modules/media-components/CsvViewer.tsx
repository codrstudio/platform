/**
 * CsvViewer - Visualizador de arquivos CSV
 *
 * Features:
 * - Parse de CSV (string ou File)
 * - Detecção automática de delimitador
 * - Tabela com scroll horizontal/vertical
 * - Ordenação por coluna (opcional)
 * - Filtro por coluna (opcional)
 * - Virtualização para CSVs grandes
 */

import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { ArrowUpDown, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CsvViewerProps {
  data?: string;
  file?: File;
  className?: string;
  pagination?: boolean;
  pageSize?: number;
  allowSort?: boolean;
  allowFilter?: boolean;
  maxRows?: number;
}

type ParsedData = {
  headers: string[];
  rows: string[][];
};

export function CsvViewer({
  data,
  file,
  className,
  pagination: _pagination = false,
  pageSize: _pageSize = 50,
  allowSort = false,
  allowFilter = false,
  maxRows = 10000,
}: CsvViewerProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<number, string>>({});

  useEffect(() => {
    const parseData = () => {
      setIsLoading(true);
      setError(null);

      const parseConfig: Papa.ParseConfig = {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: false,
      };

      const handleComplete = (results: Papa.ParseResult<string[]>) => {
        if (results.errors.length > 0) {
          setError('Erro ao parsear CSV: ' + results.errors[0].message);
          setIsLoading(false);
          return;
        }

        if (results.data.length === 0) {
          setError('CSV vazio');
          setIsLoading(false);
          return;
        }

        // Primeira linha como headers
        const headers = results.data[0];
        const rows = results.data.slice(1, maxRows + 1);

        setParsedData({ headers, rows });
        setIsLoading(false);
      };

      if (data) {
        Papa.parse(data, {
          ...parseConfig,
          complete: handleComplete,
        });
      } else if (file) {
        Papa.parse(file, {
          ...parseConfig,
          complete: handleComplete,
        });
      }
    };

    parseData();
  }, [data, file, maxRows]);

  // Filtrar e ordenar dados
  const processedRows = useMemo(() => {
    if (!parsedData) return [];

    let rows = [...parsedData.rows];

    // Aplicar filtros
    if (allowFilter && Object.keys(filters).length > 0) {
      rows = rows.filter((row) =>
        Object.entries(filters).every(([colIndex, filterValue]) => {
          if (!filterValue) return true;
          const cellValue = row[Number(colIndex)]?.toLowerCase() || '';
          return cellValue.includes(filterValue.toLowerCase());
        })
      );
    }

    // Aplicar ordenação
    if (allowSort && sortColumn !== null) {
      rows.sort((a, b) => {
        const aValue = a[sortColumn] || '';
        const bValue = b[sortColumn] || '';

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return rows;
  }, [parsedData, filters, sortColumn, sortDirection, allowSort, allowFilter]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: processedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const handleSort = (columnIndex: number) => {
    if (!allowSort) return;

    if (sortColumn === columnIndex) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (columnIndex: number, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnIndex]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 p-4 border rounded-lg bg-destructive/10 border-destructive/50">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-destructive">Erro ao carregar CSV</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!parsedData) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Informações */}
      <div className="text-sm text-muted-foreground">
        {processedRows.length} linhas × {parsedData.headers.length} colunas
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div
          ref={parentRef}
          className="overflow-auto max-h-[600px]"
          style={{ contain: 'strict' }}
        >
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {parsedData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 text-left font-medium border-b border-r last:border-r-0"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="truncate">{header}</span>
                        {allowSort && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleSort(index)}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {allowFilter && (
                        <Input
                          placeholder="Filtrar..."
                          value={filters[index] || ''}
                          onChange={(e) => handleFilterChange(index, e.target.value)}
                          className="h-7 text-xs"
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                <td colSpan={parsedData.headers.length} />
              </tr>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = processedRows[virtualRow.index];
                return (
                  <tr
                    key={virtualRow.index}
                    className="border-b hover:bg-muted/50"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-2 border-r last:border-r-0"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
