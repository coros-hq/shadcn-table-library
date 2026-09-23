'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'
import type { Customer } from './columns'
import { downloadFile, toCsv, toExcelHtml } from './export'

type ExportFormat = 'csv' | 'excel'

interface ExportSelectedTableProps {
  columns: ColumnDef<Customer, any>[]
  data: Customer[]
}

export function ExportSelectedTable({
  columns,
  data,
}: ExportSelectedTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [format, setFormat] = useState<ExportFormat>('csv')

  const table = useReactTable({
    data,
    columns,
    // Stable ids keep a selection attached to the same customer across pages
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  // Covers every page, not just the rows currently rendered
  const selectedRows = table.getSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const allPageSelected = table.getIsAllPageRowsSelected()

  function handleExport() {
    const exportColumns = table
      .getAllLeafColumns()
      .filter((column) => column.id !== 'select')
    const headers = exportColumns.map((column) =>
      typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.id,
    )
    // Raw values (4200, not "$4,200") so spreadsheets can sum them
    const rows = selectedRows.map((row) =>
      exportColumns.map((column) => String(row.getValue(column.id) ?? '')),
    )

    if (format === 'csv') {
      downloadFile(
        toCsv(headers, rows),
        'customers.csv',
        'text/csv;charset=utf-8;',
      )
    } else {
      downloadFile(
        toExcelHtml(headers, rows),
        'customers.xls',
        'application/vnd.ms-excel',
      )
    }
  }

  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex min-h-8 items-center gap-2 text-sm"
          aria-live="polite"
        >
          {selectedCount === 0 ? (
            <span className="text-muted-foreground">
              Select rows to export them
            </span>
          ) : (
            <>
              <span className="tabular-nums">
                <span className="font-medium">{selectedCount}</span>
                <span className="text-muted-foreground">
                  {' '}
                  of {data.length} selected
                </span>
              </span>
              {allPageSelected && selectedCount < data.length && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  onClick={() => table.toggleAllRowsSelected(true)}
                >
                  Select all {data.length}
                </Button>
              )}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-muted-foreground"
                onClick={() => table.resetRowSelection()}
              >
                Clear
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-md border p-0.5"
            role="group"
            aria-label="Export format"
          >
            {(['csv', 'excel'] as ExportFormat[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={format === value}
                onClick={() => setFormat(value)}
                className={cn(
                  'rounded-sm px-2.5 py-0.5 text-sm transition-colors',
                  format === value
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {value === 'csv' ? 'CSV' : 'Excel'}
              </button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            disabled={selectedCount === 0}
            onClick={handleExport}
          >
            <Download className="size-3.5" />
            Export{selectedCount > 0 ? ` ${selectedCount}` : ''} selected
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.id === 'select' && 'w-10')}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <p className="mr-auto text-sm text-muted-foreground tabular-nums">
          {pageIndex * pageSize + 1}–
          {Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Previous page"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Next page"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
