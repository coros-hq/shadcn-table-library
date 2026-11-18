import { h } from 'vue'
import type { Column, ColumnDef, Table } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp } from '@lucide/vue'
import { cn } from '@/lib/utils'
import PriorityLabel from './PriorityLabel.vue'
import StatusBadge from './StatusBadge.vue'
import type { StatusFilter, TicketMeta, TicketRow } from './styles'
import { inView, priorityRank, timeAgo } from './tickets'

const getMeta = (table: Table<TicketRow>) =>
  table.options.meta as unknown as TicketMeta

function sortHeader(column: Column<TicketRow>, label: string) {
  const sorted = column.getIsSorted()
  return h(
    'button',
    {
      type: 'button',
      onClick: column.getToggleSortingHandler(),
      class:
        'group/sort inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
    },
    [
      label,
      h(sorted === 'desc' ? ArrowDown : ArrowUp, {
        'aria-hidden': 'true',
        class: cn(
          'size-3.5',
          !sorted && 'opacity-0 group-hover/sort:opacity-40',
        ),
      }),
    ],
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
      return h('div', { class: 'flex min-w-0 flex-col gap-0.5' }, [
        h(
          'button',
          {
            type: 'button',
            'data-ticket-id': ticket.id,
            'aria-expanded': isOpen,
            'aria-controls': 'ticket-panel',
            onClick: () => meta.open(ticket.id),
            class:
              'truncate rounded-sm text-left font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50',
          },
          ticket.subject,
        ),
        h('span', { class: 'truncate text-xs text-muted-foreground' }, [
          h('span', { class: 'font-mono' }, ticket.id),
          ` · ${ticket.customer.name}, ${ticket.customer.company}`,
        ]),
        isOpen && !inView(ticket, meta.view)
          ? h(
              'span',
              { class: 'text-xs text-amber-700 dark:text-amber-400' },
              `No longer ${meta.view}: leaves this list when you close it`,
            )
          : null,
      ])
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (t) => t.status,
    filterFn: (row, _id, { view, keep }: StatusFilter) =>
      row.original.id === keep || inView(row.original, view),
    cell: ({ row }) => h(StatusBadge, { status: row.original.status }),
  },
  {
    id: 'priority',
    accessorFn: (t) => priorityRank(t.sortAs.priority),
    header: ({ column }) => sortHeader(column, 'Priority'),
    // Ascending rank is urgent first, which is what a first click should do
    sortDescFirst: false,
    cell: ({ row }) => h(PriorityLabel, { priority: row.original.priority }),
  },
  {
    id: 'assignee',
    header: 'Assignee',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: cn(
            'whitespace-nowrap',
            row.original.assignee === 'Unassigned' && 'text-muted-foreground',
          ),
        },
        row.original.assignee,
      ),
  },
  {
    id: 'updated',
    accessorFn: (t) => t.sortAs.updated,
    header: ({ column }) => sortHeader(column, 'Updated'),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'whitespace-nowrap text-muted-foreground tabular-nums' },
        timeAgo(row.original.updated),
      ),
  },
]
