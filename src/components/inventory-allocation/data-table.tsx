'use client'

import { Fragment, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ExpandedState, SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { InventoryTableMeta, SkuRow } from './columns'
import { columns, getMeta } from './columns'
import { BatchDetail } from './batch-detail'

interface InventoryTableProps {
  data: SkuRow[]
  meta: InventoryTableMeta
}

export function InventoryTable({ data, meta }: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'status', desc: false }])
  const [expanded, setExpanded] = useState<ExpandedState>({ 'SKU-1042': true })

  const table = useReactTable({
    data,
    columns,
    meta,
    state: { sorting, expanded },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    // Rows are keyed by SKU, not array index, so expansion follows the SKU
    // when a formula-backed sort (e.g. Status) moves it after an edit.
    getRowId: (row) => row.sku,
    // Batches aren't subRows of the same shape — the detail panel is custom
    // markup — so every row can expand without a getSubRows.
    getRowCanExpand: () => true,
    // Every edit produces a new `data` array; without this, TanStack would
    // collapse all rows each time a cell is saved.
    autoResetExpanded: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  const columnCount = table.getVisibleLeafColumns().length

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                    className="whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' ? (
                          <ArrowUp className="size-3" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="size-3" />
                        ) : (
                          <ArrowUpDown className="size-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow data-state={row.getIsExpanded() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columnCount} className="bg-muted/30 p-4">
                      <BatchDetail row={row.original} meta={getMeta(table)} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <TableCell key={header.id} className="font-medium">
                  {flexRender(header.column.columnDef.footer, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableFooter>
      </Table>
    </div>
  )
}
