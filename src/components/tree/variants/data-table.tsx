'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import type { Product } from './data'

interface VariantsTableProps {
  columns: ColumnDef<Product, any>[]
  data: Product[]
}

export function VariantsTable({ columns, data }: VariantsTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.variants,
    getExpandedRowModel: getExpandedRowModel(),
    // Only products are selectable; ticking one must not tick its variants
    enableRowSelection: (row) => row.depth === 0,
    enableSubRowSelection: false,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    state: { expanded, rowSelection },
  })

  const selected = Object.keys(rowSelection).length

  return (
    <div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
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
            {table.getRowModel().rows.map((row) => {
              const siblings = row.getParentRow()?.subRows ?? []
              const isLastVariant =
                row.depth > 0 && row.index === siblings.length - 1
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className={cn(
                    // Drop the rules inside an open group so the bracket reads as one line
                    (row.getIsExpanded() ||
                      (row.depth > 0 && !isLastVariant)) &&
                      'border-b-0',
                    row.depth > 0 && 'bg-muted/30 hover:bg-muted/30',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="relative py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {selected} of {data.length} products selected
      </p>
    </div>
  )
}
