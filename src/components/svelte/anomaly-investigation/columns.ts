import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import { distance, formatValue, kindOf } from './anomalies'
import ChangeCell from './ChangeCell.svelte'
import type { Metric } from './data'
import ExpandButton from './ExpandButton.svelte'
import FlagCell from './FlagCell.svelte'
import MetricCell from './MetricCell.svelte'
import RangeBar from './RangeBar.svelte'
import ReviewButton from './ReviewButton.svelte'
import type { AnomalyMeta } from './styles'
import TextCell from './TextCell.svelte'

const getMeta = (table: Table<Metric>) =>
  table.options.meta as unknown as AnomalyMeta

export const columns: ColumnDef<Metric>[] = [
  {
    id: 'expand',
    header: () =>
      renderComponent(TextCell, { text: 'History', class: 'sr-only' }),
    cell: ({ row }) =>
      renderComponent(ExpandButton, {
        name: row.original.name,
        expanded: row.getIsExpanded(),
        ontoggle: () => row.toggleExpanded(),
      }),
  },
  {
    id: 'metric',
    header: 'Metric',
    cell: ({ row }) => renderComponent(MetricCell, { metric: row.original }),
  },
  {
    id: 'actual',
    header: () =>
      renderComponent(TextCell, { text: 'Today', class: 'block text-right' }),
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: formatValue(row.original.today.actual, row.original),
        class: 'block text-right font-medium tabular-nums',
      }),
  },
  {
    id: 'range',
    header: 'Expected range',
    cell: ({ row }) => renderComponent(RangeBar, { metric: row.original }),
  },
  {
    id: 'change',
    // Sorted by how far outside the range, so the worst comes first
    accessorFn: (m) => distance(m.today),
    header: () =>
      renderComponent(TextCell, {
        text: 'vs expected',
        class: 'block text-right',
      }),
    cell: ({ row }) => renderComponent(ChangeCell, { metric: row.original }),
  },
  {
    id: 'kind',
    accessorFn: (m) => kindOf(m.today),
    header: 'Flag',
    cell: ({ row }) => renderComponent(FlagCell, { metric: row.original }),
  },
  {
    id: 'review',
    header: () =>
      renderComponent(TextCell, { text: 'Review', class: 'sr-only' }),
    cell: ({ row, table }) => {
      const m = row.original
      if (kindOf(m.today) === 'normal') return null
      const meta = getMeta(table)
      return renderComponent(ReviewButton, {
        name: m.name,
        done: meta.reviewed.has(m.id),
        ontoggle: () => meta.toggleReviewed(m.id),
      })
    },
  },
]
