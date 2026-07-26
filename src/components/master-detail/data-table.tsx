'use client'

import { Fragment, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { Order } from './columns'
import { OrderDetail } from './order-detail'

interface MasterDetailTableProps {
  columns: ColumnDef<Order, any>[]
  data: Order[]
}

export function MasterDetailTable({ columns, data }: MasterDetailTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allColumns = useMemo<ColumnDef<Order, any>[]>(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          const isExpanded = expandedRows.has(row.original.id)
          return (
            <button
              type="button"
              onClick={() => toggleRow(row.original.id)}
              className="flex h-4 w-4 items-center justify-center text-muted-foreground"
              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
              aria-expanded={isExpanded}
            >
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          )
        },
      },
      ...columns,
    ],
    [columns, expandedRows],
  )

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
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
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRows.has(row.original.id)
              return (
                <Fragment key={row.id}>
                  <TableRow data-state={isExpanded ? 'expanded' : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded ? (
                    <TableRow>
                      <TableCell
                        colSpan={allColumns.length}
                        className="bg-muted/30 p-4"
                      >
                        <OrderDetail order={row.original} />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              )
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="h-24 text-center"
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
