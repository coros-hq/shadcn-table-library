'use client'

import {
  flexRender,
  useTable,
} from '@tanstack/react-table-v9'
import type { ColumnDef } from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { Kpi } from './kpi'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface KpiTableProps {
  columns: ColumnDef<V9Features, Kpi, any>[]
  data: Kpi[]
}

export function KpiTable({ columns, data }: KpiTableProps) {
  const table = useTable({
    features: v9Features,
    data,
    columns,
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-8 text-xs">
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
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
