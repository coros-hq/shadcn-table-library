'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { FileSpreadsheet, FileText, Printer } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils.ts'
import { downloadFile, toCsv, toExcelHtml } from './export'

type Density = 'compact' | 'comfortable' | 'spacious'

const densityCell: Record<Density, string> = {
  compact: 'py-1 text-xs',
  comfortable: 'py-2 text-sm',
  spacious: 'py-4 text-base',
}

const densityHead: Record<Density, string> = {
  compact: 'h-8 text-xs',
  comfortable: 'h-10 text-sm',
  spacious: 'h-14 text-base',
}

interface UtilityTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
}

export function UtilityTable<TData>({ columns, data }: UtilityTableProps<TData>) {
  const [density, setDensity] = useState<Density>('comfortable')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function getExportData() {
    const headers = table.getHeaderGroups()[0].headers.map((header) =>
      typeof header.column.columnDef.header === 'string'
        ? header.column.columnDef.header
        : header.column.id,
    )
    const rows = table
      .getRowModel()
      .rows.map((row) =>
        row.getVisibleCells().map((cell) => String(cell.getValue() ?? '')),
      )
    return { headers, rows }
  }

  function exportCsv() {
    const { headers, rows } = getExportData()
    downloadFile(toCsv(headers, rows), 'table-export.csv', 'text/csv;charset=utf-8;')
  }

  function exportExcel() {
    const { headers, rows } = getExportData()
    downloadFile(
      toExcelHtml(headers, rows),
      'table-export.xls',
      'application/vnd.ms-excel',
    )
  }

  function exportPdf() {
    window.print()
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Density</span>
          <Select value={density} onValueChange={(v) => setDensity(v as Density)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
            <FileText className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportPdf}>
            <Printer className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border print:border-black print:shadow-none">
        <Table className="print:bg-white print:text-black">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="print:border-black">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      densityHead[density],
                      'print:h-auto print:py-2 print:text-black',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              <TableRow key={row.id} className="print:border-black">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      densityCell[density],
                      'print:py-1 print:text-black',
                    )}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
