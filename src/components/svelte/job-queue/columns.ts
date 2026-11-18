import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import type { Job } from './data'
import ExpandButton from './ExpandButton.svelte'
import JobCell from './JobCell.svelte'
import NumberCell from './NumberCell.svelte'
import ProgressCell from './ProgressCell.svelte'
import RowActions from './RowActions.svelte'
import StatusBadge from './StatusBadge.svelte'
import { duration, formatDuration, inView } from './queue'
import type { View } from './queue'

export interface QueueMeta {
  /** The demo clock, in ms */
  now: number
  retry: (id: string) => void
  cancel: (id: string) => void
}

const getMeta = (table: Table<Job>) =>
  table.options.meta as unknown as QueueMeta

export const columns: ColumnDef<Job>[] = [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) =>
      row.getCanExpand()
        ? renderComponent(ExpandButton, {
            name: row.original.name,
            expanded: row.getIsExpanded(),
            ontoggle: () => row.toggleExpanded(),
          })
        : null,
  },
  {
    id: 'job',
    header: 'Job',
    accessorFn: (job) => job.name,
    cell: ({ row }) => renderComponent(JobCell, { job: row.original }),
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (job) => job.status,
    filterFn: (row, _id, view: View) => inView(row.original.status, view),
    cell: ({ row, table }) =>
      renderComponent(StatusBadge, {
        job: row.original,
        now: getMeta(table).now,
      }),
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => renderComponent(ProgressCell, { job: row.original }),
  },
  {
    id: 'attempts',
    header: () => renderComponent(NumberCell, { text: 'Attempts' }),
    cell: ({ row }) => {
      const { attempts, maxAttempts } = row.original
      const failed = attempts.filter((a) => a.error).length
      return renderComponent(NumberCell, {
        text: String(attempts.length),
        suffix: ` / ${maxAttempts}`,
        title: failed ? `${failed} failed` : undefined,
      })
    },
  },
  {
    id: 'duration',
    header: () => renderComponent(NumberCell, { text: 'Duration' }),
    cell: ({ row, table }) => {
      const ms = duration(row.original, getMeta(table).now)
      return renderComponent(NumberCell, {
        text: ms === null ? '—' : formatDuration(ms),
        muted: true,
      })
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const { retry, cancel } = getMeta(table)
      return renderComponent(RowActions, {
        job: row.original,
        onretry: () => retry(row.original.id),
        oncancel: () => cancel(row.original.id),
      })
    },
  },
]
