import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Table as TanStackTable,
} from '@tanstack/react-table'

import { Button } from '#/components/ui/button'
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
import type { StatusFilter, TicketMeta, TicketRow } from './columns'
import type { Ticket } from './data'
import type { View } from './tickets'

export const PAGE_SIZE = 8

/**
 * The table lives in the demo, not in the component that draws it: the
 * panel's previous and next buttons need its sorted, filtered order.
 */
export function useTicketTable({
  tickets,
  pinned,
  view,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  meta,
}: {
  tickets: Ticket[]
  /** The open ticket as it was when opened; it sorts by these values */
  pinned: Ticket | null
  view: View
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  meta: TicketMeta
}) {
  // Memoized: a new array every render would count as a filter change
  const columnFilters = useMemo(
    () => [
      {
        id: 'status',
        value: { view, keep: meta.openId } satisfies StatusFilter,
      },
    ],
    [view, meta.openId],
  )

  const data = useMemo<TicketRow[]>(
    () =>
      tickets.map((t) => ({
        ...t,
        sortAs: pinned && t.id === pinned.id ? pinned : t,
      })),
    [tickets, pinned],
  )

  return useReactTable({
    data,
    columns,
    getRowId: (ticket) => ticket.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination, columnFilters },
    onSortingChange,
    onPaginationChange,
    // Editing a ticket or opening one must not move you to page 1; the demo
    // resets the page itself when the filter changes
    autoResetPageIndex: false,
    meta,
  })
}

// With the panel open there is less room, and the panel shows priority and
// assignee anyway, so those two columns step aside
const narrow: Record<string, string> = {
  assignee: 'hidden',
  priority: 'hidden',
}

export function TicketTable({
  table,
  panelOpen,
}: {
  table: TanStackTable<TicketRow>
  panelOpen: boolean
}) {
  const openId = (table.options.meta as TicketMeta).openId
  const rows = table.getRowModel().rows
  const { pageIndex } = table.getState().pagination
  const total = table.getPrePaginationRowModel().rows.length
  const hide = (id: string) =>
    panelOpen ? narrow[id] : id === 'assignee' ? 'hidden md:table-cell' : ''

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Scrolls on its own, so opening a ticket never moves the page */}
      <div className="max-h-[32rem] min-h-[28rem] flex-1 overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className={hide(header.column.id)}
                  >
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
            {rows.length ? (
              rows.map((row) => {
                const isOpen = row.id === openId
                return (
                  <TableRow
                    key={row.id}
                    data-ticket-row={row.id}
                    aria-current={isOpen ? 'true' : undefined}
                    className={cn(
                      isOpen &&
                        'bg-muted shadow-[inset_3px_0_0_var(--color-primary)] hover:bg-muted',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          hide(cell.column.id),
                          cell.column.id === 'subject' && 'w-full max-w-0',
                        )}
                      >
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
                  className="h-40 text-center text-muted-foreground"
                >
                  No tickets here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <p className="text-sm text-muted-foreground tabular-nums">
          {total
            ? `${pageIndex * PAGE_SIZE + 1}–${Math.min(total, (pageIndex + 1) * PAGE_SIZE)} of ${total}`
            : 'No tickets'}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
