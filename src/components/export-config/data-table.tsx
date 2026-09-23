'use client'

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
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
import type { Order } from './columns'
import { applyExportConfig, defaultExportConfig } from './export-config'
import type { ExportConfig } from './export-config'
import { ExportDialog } from './export-dialog'
import { downloadFile, toCsv, toExcelHtml } from './export'

interface ExportConfigTableProps {
  columns: ColumnDef<Order, any>[]
  data: Order[]
  today: Date
}

export function ExportConfigTable({
  columns,
  data,
  today,
}: ExportConfigTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  // The column list for the dialog comes from the table, not a second list
  const exportColumns = useMemo(
    () =>
      table.getAllLeafColumns().map((column) => ({
        id: column.id,
        label:
          typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : column.id,
      })),
    [table],
  )

  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<ExportConfig>(() =>
    defaultExportConfig(exportColumns.map((c) => c.id)),
  )

  const matches = useMemo(
    () => applyExportConfig(data, config, today),
    [data, config, today],
  )

  function handleExport() {
    const chosen = exportColumns.filter((c) => config.columns.includes(c.id))
    const headers = chosen.map((c) => c.label)
    // Export raw values (e.g. 129.5, not "$129.50") so spreadsheets can sum them
    const rows = matches.map((order) =>
      chosen.map((c) => String(order[c.id as keyof Order])),
    )

    if (config.format === 'csv') {
      downloadFile(
        toCsv(headers, rows),
        'orders.csv',
        'text/csv;charset=utf-8;',
      )
    } else {
      downloadFile(
        toExcelHtml(headers, rows),
        'orders.xls',
        'application/vnd.ms-excel',
      )
    }
    setOpen(false)
  }

  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{data.length} orders</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Download className="size-3.5" />
          Export…
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
              <TableRow key={row.id}>
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

      <ExportDialog
        open={open}
        onOpenChange={setOpen}
        columns={exportColumns}
        config={config}
        onConfigChange={setConfig}
        onReset={() =>
          setConfig(defaultExportConfig(exportColumns.map((c) => c.id)))
        }
        onExport={handleExport}
        matchCount={matches.length}
        total={data.length}
      />
    </div>
  )
}
