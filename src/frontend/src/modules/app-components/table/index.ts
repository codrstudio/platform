/**
 * TanStack Table - Tabelas com sorting, filtering, pagination
 *
 * Re-exporta todos os componentes e hooks do TanStack Table v8.
 *
 * @see https://tanstack.com/table
 */

// Re-export all TanStack Table utilities
export {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender,

  // Column helpers
  createColumnHelper,

  // Filters
  filterFns,

  // Sorting
  sortingFns,

  // Aggregation
  aggregationFns,

  // Types
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  type Table,
  type Row,
  type Column,
  type Cell,
  type HeaderGroup,
  type Header,
} from '@tanstack/react-table';
