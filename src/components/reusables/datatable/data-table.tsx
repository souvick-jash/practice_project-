import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
// import { DataTablePagination } from './data-table-pagination';
import DataTableToolbar from './data-table-toolbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import type { ActionMenuConfig } from '@/types/types';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  actionMenuItems: ActionMenuConfig;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  actionMenuItems,
}: DataTableProps<TData, TValue>) {
  //generic types.
  const { searchColumns } = actionMenuItems; // This gets configuration from actionMenuItems.
  const defaultColumnVisibility = actionMenuItems.extraOptions?.defaultColumnVisibility;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultColumnVisibility || {}
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const getNestedValues = (obj: any, path: string): any[] => {
    const parts = path.split('.');
    let currentLevel = [obj];

    for (const part of parts) {
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/); // e.g., store_locations[0]
      const key = arrayMatch ? arrayMatch[1] : part;
      const index = arrayMatch ? Number(arrayMatch[2]) : null;

      const nextLevel: any[] = [];

      for (const item of currentLevel) {
        const value = item?.[key];
        if (Array.isArray(value)) {
          if (index !== null) {
            if (value[index] !== undefined) nextLevel.push(value[index]);
          } else {
            nextLevel.push(...value); // flatten the array
          }
        } else if (value !== undefined) {
          nextLevel.push(value);
        }
      }

      currentLevel = nextLevel;
    }

    return currentLevel;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const original = row.original;

      return searchColumns.some((fieldPath) => {
        const values = getNestedValues(original, fieldPath);
        return values.some((val) =>
          String(val ?? '')
            .toLowerCase()
            .includes(search)
        );
      });
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => (row as any).id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const { open } = useSidebar();
  const { willCellWrap } = actionMenuItems;

  const dataTableClass = open ? 'custom-data-table' : 'custom-data-table';
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className={dataTableClass}>
      <DataTableToolbar
        table={table as any}
        actionMenuItems={actionMenuItems}
        selectedRows={selectedRows}
      />

      <div className="data-table-holder">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={willCellWrap ? 'whitespace-normal' : ''}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <DataTablePagination table={table} /> */}
    </div>
  );
}
