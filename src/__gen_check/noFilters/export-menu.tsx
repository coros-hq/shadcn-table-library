'use client'

import type { Table } from '@tanstack/react-table'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export type ExportFormat = 'csv' | 'excel'

type Cell = string | number | boolean | null | undefined

const text = (value: Cell) =>
  value === true ? 'Yes' : value === false ? 'No' : String(value ?? '')

// A text cell starting with = + - or @ is run as a formula by spreadsheet
// apps. A leading apostrophe makes them show it as text instead.
const safeText = (value: Cell) => {
  const out = text(value)
  return typeof value === 'string' && /^[=+\-@\t\r]/.test(out) ? `'${out}` : out
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  const escape = (value: string) =>
    /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  return [headers, ...rows.map((row) => row.map(safeText))]
    .map((row) => row.map(escape).join(','))
    .join('\r\n')
}

const html = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** An HTML table, which Excel opens as a sheet */
export function toExcelHtml(headers: string[], rows: Cell[][]): string {
  const th = headers.map((h) => `<th>${html(h)}</th>`).join('')
  const trs = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${html(safeText(cell))}</td>`).join('')}</tr>`,
    )
    .join('')
  return `<html><head><meta charset="utf-8"></head><body><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`
}

export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * The rows and columns an export writes: the selected rows when there are
 * any, otherwise every row that passes the filters (all pages), in the
 * current sort order. Only visible data columns are written.
 */
export function exportData<TData>(table: Table<TData>) {
  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.accessorFn !== undefined)
  const selected = table.getSelectedRowModel().rows
  const rows = selected.length
    ? selected
    : table.getPrePaginationRowModel().rows
  return {
    headers: columns.map((column) =>
      typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.id,
    ),
    rows: rows.map((row) =>
      columns.map((column) => row.getValue<Cell>(column.id)),
    ),
    selected: selected.length > 0,
  }
}

export function exportTable<TData>(
  table: Table<TData>,
  format: ExportFormat,
  filename: string,
) {
  const { headers, rows } = exportData(table)
  if (format === 'csv') {
    // The BOM tells Excel the file is UTF-8, so accents survive
    downloadFile(
      `\uFEFF${toCsv(headers, rows)}`,
      `${filename}.csv`,
      'text/csv;charset=utf-8',
    )
  } else {
    downloadFile(
      toExcelHtml(headers, rows),
      `${filename}.xls`,
      'application/vnd.ms-excel',
    )
  }
}

const formatLabel: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel',
}

export function ExportMenu<TData>({
  table,
  formats,
  filename,
}: {
  table: Table<TData>
  formats: ExportFormat[]
  filename: string
}) {
  // One format needs no menu
  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={() => exportTable(table, formats[0], filename)}
      >
        <Download className="size-4" />
        Export {formatLabel[formats[0]]}
      </Button>
    )
  }

  const selected = table.getSelectedRowModel().rows.length
  const count = selected || table.getPrePaginationRowModel().rows.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Download className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {count} {selected ? 'selected ' : ''}row{count === 1 ? '' : 's'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => (
          <DropdownMenuItem
            key={format}
            onSelect={() => exportTable(table, format, filename)}
          >
            {format === 'csv' ? <FileText /> : <FileSpreadsheet />}
            {formatLabel[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
