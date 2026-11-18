import { useCallback, useEffect, useRef, useState } from 'react'
import type { PaginationState, SortingState } from '@tanstack/react-table'

import { cn } from '#/lib/utils'
import { tickets as initialTickets } from './data'
import type { Ticket } from './data'
import { PAGE_SIZE, TicketTable, useTicketTable } from './data-table'
import { TicketPanel } from './ticket-panel'
import { inView, replyTo, updateTicket, views } from './tickets'
import type { View } from './tickets'

export function SplitDetailDemo() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [view, setView] = useState<View>('open')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updated', desc: true },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [openId, setOpenId] = useState<string | null>(null)
  // The open ticket as it was when opened, so it keeps its place in the sort
  const [pinned, setPinned] = useState<Ticket | null>(null)
  const filters = useRef<HTMLDivElement>(null)

  function open(id: string | null) {
    setOpenId(id)
    setPinned(tickets.find((t) => t.id === id) ?? null)
  }

  const table = useTicketTable({
    tickets,
    pinned,
    view,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
    meta: { openId, view, open },
  })

  // Every ticket in the current filter and sort, across all pages
  const order = table.getPrePaginationRowModel().rows.map((r) => r.id)
  const index = openId ? order.indexOf(openId) : -1
  const ticket = tickets.find((t) => t.id === openId) ?? null

  /** Opens a neighbour, turning the page if it's on another one */
  function go(id: string) {
    open(id)
    const page = Math.floor(order.indexOf(id) / PAGE_SIZE)
    setPagination((p) => (p.pageIndex === page ? p : { ...p, pageIndex: page }))
  }

  // Bring the open row into view inside the table's own scroll area
  useEffect(() => {
    if (!openId) return
    document
      .querySelector(`[data-ticket-row="${openId}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [openId, pagination.pageIndex])

  // A ticket that left the filter disappears on close; don't strand the
  // page past the end
  const pageCount = table.getPageCount()
  useEffect(() => {
    if (pageCount && pagination.pageIndex >= pageCount)
      setPagination((p) => ({ ...p, pageIndex: pageCount - 1 }))
  }, [pageCount, pagination.pageIndex])

  const fallbackFocus = useCallback(
    () =>
      filters.current
        ?.querySelector<HTMLElement>('[aria-pressed="true"]')
        ?.focus(),
    [],
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          ref={filters}
          role="group"
          aria-label="Show tickets"
          className="inline-flex rounded-md border p-0.5"
        >
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => {
                setView(v.id)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
              className="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {v.label}
              <span className="text-xs tabular-nums">
                {tickets.filter((t) => inView(t, v.id)).length}
              </span>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Open a ticket by its subject.
        </p>
      </div>

      {/* The table scrolls inside this frame, and the panel opens at its
          right, pushing the table over instead of covering it */}
      <div className={cn('relative flex overflow-hidden rounded-md border')}>
        <TicketTable table={table} panelOpen={openId !== null} />
        <TicketPanel
          ticket={ticket}
          position={{ index: Math.max(index, 0), total: order.length }}
          onPrevious={index > 0 ? () => go(order[index - 1]) : undefined}
          onNext={
            index >= 0 && index < order.length - 1
              ? () => go(order[index + 1])
              : undefined
          }
          onClose={() => open(null)}
          onChange={(changes) =>
            openId && setTickets((all) => updateTicket(all, openId, changes))
          }
          onReply={(body) =>
            openId && setTickets((all) => replyTo(all, openId, 'You', body))
          }
          fallbackFocus={fallbackFocus}
        />
      </div>
    </div>
  )
}
