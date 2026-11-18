import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import PriorityLabel from './PriorityLabel.svelte'
import SortHeader from './SortHeader.svelte'
import StatusBadge from './StatusBadge.svelte'
import SubjectCell from './SubjectCell.svelte'
import TextCell from './TextCell.svelte'
import type { StatusFilter, TicketMeta, TicketRow } from './styles'
import { inView, priorityRank, timeAgo } from './tickets'

const getMeta = (table: Table<TicketRow>) =>
  table.options.meta as unknown as TicketMeta

export const columns: ColumnDef<TicketRow>[] = [
  {
    id: 'subject',
    header: 'Ticket',
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      return renderComponent(SubjectCell, {
        ticket: row.original,
        isOpen: meta.openId === row.original.id,
        view: meta.view,
        onopen: () => meta.open(row.original.id),
      })
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (t) => t.status,
    filterFn: (row, _id, { view, keep }: StatusFilter) =>
      row.original.id === keep || inView(row.original, view),
    cell: ({ row }) =>
      renderComponent(StatusBadge, { status: row.original.status }),
  },
  {
    id: 'priority',
    accessorFn: (t) => priorityRank(t.sortAs.priority),
    header: ({ column }) =>
      renderComponent(SortHeader, { column, label: 'Priority' }),
    // Ascending rank is urgent first, which is what a first click should do
    sortDescFirst: false,
    cell: ({ row }) =>
      renderComponent(PriorityLabel, { priority: row.original.priority }),
  },
  {
    id: 'assignee',
    header: 'Assignee',
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: row.original.assignee,
        class:
          row.original.assignee === 'Unassigned'
            ? 'whitespace-nowrap text-muted-foreground'
            : 'whitespace-nowrap',
      }),
  },
  {
    id: 'updated',
    accessorFn: (t) => t.sortAs.updated,
    header: ({ column }) =>
      renderComponent(SortHeader, { column, label: 'Updated' }),
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: timeAgo(row.original.updated),
        class: 'whitespace-nowrap text-muted-foreground tabular-nums',
      }),
  },
]
