'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const
type Align = keyof typeof alignClass

// Alignment is set per column in `meta: { align }`
const alignOf = (def: { meta?: unknown }): Align =>
  (def.meta as { align?: Align } | undefined)?.align ?? 'left'

const skeletonClass = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
} as const

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows the loading state instead of rows */
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) {

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={alignClass[alignOf(header.column.columnDef)]}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.getVisibleLeafColumns().map((column, index) => (
                    <TableCell key={column.id}>
                  {rowIndex === 0 && index === 0 ? (
                    <span role="status" className="sr-only">
                      {'Loading...'}
                    </span>
                  ) : null}
                      <Skeleton className={`h-4 w-3/4 ${skeletonClass[alignOf(column.columnDef)]}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id} className={alignClass[alignOf(cell.column.columnDef)]}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  <p className="text-sm font-medium">{'No results'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Try changing your search or filters.'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
