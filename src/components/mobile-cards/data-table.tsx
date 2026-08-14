'use client'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="@container rounded-md border">
      {/*
        Below the @[48rem] (768px) container breakpoint, every table
        element is forced to `block`/`flex` and each <tr> becomes its own
        bordered card. Above it, the variant puts everything back to its
        normal table display — no JS media query, no separate mobile
        component. Tailwind's @[...] variants key off this container's own
        width via `@container` above, not the viewport, so the same table
        card-ifies inside a narrow sidebar even on a wide desktop screen.
      */}
      <Table className="block @[48rem]:table">
        <TableHeader className="hidden @[48rem]:table-header-group">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
        <TableBody className="block space-y-3 @[48rem]:table-row-group @[48rem]:space-y-0">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="block rounded-lg border p-3 @[48rem]:table-row @[48rem]:rounded-none @[48rem]:border-0 @[48rem]:border-b @[48rem]:p-0 @[48rem]:last:border-b-0"
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const header = cell.column.columnDef.header
                  const label = typeof header === 'string' ? header : undefined
                  const isPrimary = cellIndex === 0

                  return (
                    <TableCell
                      key={cell.id}
                      data-label={label}
                      className={cn(
                        'flex items-center justify-between gap-4 py-1 @[48rem]:table-cell @[48rem]:py-3',
                        isPrimary
                          ? 'mb-1 text-sm font-medium @[48rem]:mb-0 @[48rem]:font-normal'
                          : 'border-t py-1.5 first:border-t-0 @[48rem]:border-t-0 @[48rem]:py-3 before:content-[attr(data-label)] before:text-xs before:font-medium before:text-muted-foreground @[48rem]:before:content-none',
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow className="block @[48rem]:table-row">
              <TableCell
                colSpan={columns.length}
                className="block h-24 text-center @[48rem]:table-cell"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
