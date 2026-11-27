import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Column, ColumnDef, Table } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type { Priority, Status, Ticket } from './data'
import { inView, priorityRank, timeAgo } from './tickets'
import type { View } from './tickets'

/**
 * A ticket plus the values it sorts by. They match the ticket, except for
 * the open one, which keeps the values it had when it was opened: editing
 * it in the panel then doesn't send its row to another page.
 */
export type TicketRow = Ticket & { sortAs: Ticket }

export interface TicketMeta {
  /** The ticket shown in the panel */
  openId: string | null
  /** The status filter, to say when the open ticket no longer matches it */
  view: View
  open: (id: string) => void
}

const getMeta = (table: Table<TicketRow>) =>
  table.options.meta as unknown as TicketMeta

/** The status filter, plus the open ticket, which stays while it's open */
export interface StatusFilter {
  view: View
  keep: string | null
}

export const statusStyle: Record<Status, { label: string; className: string }> =
  {
    open: {
      label: 'Open',
      className: 'border-sky-500/40 text-sky-700 dark:text-sky-400',
    },
    pending: {
      label: 'Pending',
      className: 'border-amber-500/50 text-amber-800 dark:text-amber-300',
    },
    solved: { label: 'Solved', className: 'text-muted-foreground' },
  }

export const priorityStyle: Record<Priority, { label: string; dot: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-red-500' },
  high: { label: 'High', dot: 'bg-amber-500' },
  normal: { label: 'Normal', dot: 'bg-sky-500' },
  low: { label: 'Low', dot: 'bg-muted-foreground/40' },
}

export function StatusBadge({ status }: { status: Status }) {
  const style = statusStyle[status]
  return (
    <Badge variant="outline" className={style.className}>
      {style.label}
    </Badge>
  )
}

export function PriorityLabel({ priority }: { priority: Priority }) {
  const style = priorityStyle[priority]
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden className={cn('size-2 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}

function SortHeader({
  column,
  label,
}: {
  column: Column<TicketRow>
  label: string
}) {
  const sorted = column.getIsSorted()
  const Icon = sorted === 'desc' ? ArrowDown : ArrowUp
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="group/sort inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {label}
      <Icon
        aria-hidden
        className={cn(
          'size-3.5',
          !sorted && 'opacity-0 group-hover/sort:opacity-40',
        )}
      />
    </button>
  )
}

export const columns: ColumnDef<TicketRow>[] = [
  {
    id: 'subject',
    header: 'Ticket',
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const ticket = row.original
      const isOpen = meta.openId === ticket.id
      return (
        <div className="flex min-w-0 flex-col gap-0.5">
          <button
            type="button"
            data-ticket-id={ticket.id}
            aria-expanded={isOpen}
            aria-controls="ticket-panel"
            onClick={() => meta.open(ticket.id)}
            className="truncate rounded-sm text-left font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {ticket.subject}
          </button>
          <span className="truncate text-xs text-muted-foreground">
            <span className="font-mono">{ticket.id}</span> ·{' '}
            {ticket.customer.name}, {ticket.customer.company}
          </span>
          {isOpen && !inView(ticket, meta.view) ? (
            <span className="text-xs text-amber-700 dark:text-amber-400">
              No longer {meta.view}: leaves this list when you close it
            </span>
          ) : null}
        </div>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (t) => t.status,
    filterFn: (row, _id, { view, keep }: StatusFilter) =>
      row.original.id === keep || inView(row.original, view),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'priority',
    accessorFn: (t) => priorityRank(t.sortAs.priority),
    header: ({ column }) => <SortHeader column={column} label="Priority" />,
    // Ascending rank is urgent first, which is what a first click should do
    sortDescFirst: false,
    cell: ({ row }) => <PriorityLabel priority={row.original.priority} />,
  },
  {
    id: 'assignee',
    header: 'Assignee',
    cell: ({ row }) => (
      <span
        className={cn(
          'whitespace-nowrap',
          row.original.assignee === 'Unassigned' && 'text-muted-foreground',
        )}
      >
        {row.original.assignee}
      </span>
    ),
  },
  {
    id: 'updated',
    accessorFn: (t) => t.sortAs.updated,
    header: ({ column }) => <SortHeader column={column} label="Updated" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">
        {timeAgo(row.original.updated)}
      </span>
    ),
  },
]
