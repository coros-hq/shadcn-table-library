import { useEffect, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import { columns } from './columns'
import type { ReviewMeta } from './columns'
import { rowState } from './diff'
import type { View } from './diff'
import type { CatalogRow } from './data'

export function CatalogTable({
  rows,
  view,
  openId,
  meta,
}: {
  rows: CatalogRow[]
  view: View
  /** The product whose diff is open, highlighted while the panel shows it */
  openId: string | null
  meta: ReviewMeta
}) {
  // Memoized: a new filter value on every render would recompute the rows
  // each time. It changes with the decisions, so "To review" drops rows as
  // they are decided.
  const columnFilters = useMemo(
    () =>
      view === 'all'
        ? []
        : [{ id: 'product', value: { view, decisions: meta.decisions } }],
    [view, meta.decisions],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
    autoResetPageIndex: false,
    meta,
  })

  const visible = table.getRowModel().rows

  // Stepping through products keeps the open one in view
  useEffect(() => {
    if (openId) {
      document
        .querySelector(`[data-review-id="${openId}"]`)
        ?.scrollIntoView({ block: 'nearest' })
    }
  }, [openId])

  return (
    <div className="max-h-[36rem] min-h-[28rem] min-w-0 flex-1 overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
          {visible.length ? (
            visible.map((row) => {
              const { change } = row.original
              const state = change ? rowState(change, meta.decisions) : null
              const toReview = state === 'pending' || state === 'partial'
              return (
                <TableRow
                  key={row.id}
                  data-state={row.id === openId ? 'selected' : undefined}
                  onClick={change ? () => meta.open(row.id) : undefined}
                  className={cn(
                    change && 'cursor-pointer',
                    // Rows waiting for review stand out; everything else stays quiet
                    toReview &&
                      'bg-amber-500/[0.07] shadow-[inset_3px_0_0_var(--color-amber-500)] hover:bg-amber-500/[0.12]',
                    state === 'rejected' && 'text-muted-foreground',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {view === 'review'
                  ? 'Everything has been reviewed.'
                  : `No ${view} changes.`}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
