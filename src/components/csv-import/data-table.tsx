import { useMemo } from 'react'
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
import { TooltipProvider } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { buildColumns } from './columns'
import type { ReviewMeta } from './columns'
import type { ReviewRow, View } from './review'

export function ReviewTable({
  headers,
  rows,
  view,
  meta,
}: {
  headers: string[]
  rows: ReviewRow[]
  view: View
  meta: ReviewMeta
}) {
  const columns = useMemo(() => buildColumns(headers), [headers])
  // A stable array: a new one each render would recompute the filtered rows
  // every time, and with them TanStack's automatic page reset
  const columnFilters = useMemo(
    () => (view === 'all' ? [] : [{ id: 'status', value: view }]),
    [view],
  )

  const table = useReactTable({
    data: rows,
    columns,
    // Row ids are the row's position in the file, so edits never move or reset a row
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
    // No pagination here, so edits have no page to reset
    autoResetPageIndex: false,
    meta,
  })

  const visible = table.getRowModel().rows

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-auto align-bottom">
                    <div className="flex min-h-9 items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visible.length ? (
              visible.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    row.original.status === 'skipped' &&
                      '[&>td:not(:first-child)]:opacity-50',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {view === 'attention'
                    ? 'Nothing left to fix.'
                    : view === 'skipped'
                      ? 'No rows are skipped.'
                      : 'No rows here.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
