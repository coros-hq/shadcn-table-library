import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import CohortButton from './CohortButton.svelte'
import { averages, cellAt, formatCount } from './cohorts'
import { PERIODS, cohorts } from './data'
import type { Cohort } from './data'
import RetentionCell from './RetentionCell.svelte'
import type { CohortMeta } from './styles'
import TextCell from './TextCell.svelte'

const getMeta = (table: Table<Cohort>) =>
  table.options.meta as unknown as CohortMeta

const average = averages(cohorts)
const right = 'block text-right text-muted-foreground tabular-nums'

export const columns: ColumnDef<Cohort>[] = [
  {
    id: 'cohort',
    header: 'Cohort',
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      return renderComponent(CohortButton, {
        id: row.original.id,
        label: row.original.label,
        pressed: meta.highlighted === row.original.id,
        ontoggle: () => meta.toggle(row.original.id),
      })
    },
    footer: () =>
      renderComponent(TextCell, {
        text: 'Average',
        note: 'weighted, %',
        class: 'font-medium whitespace-nowrap',
      }),
  },
  {
    id: 'size',
    header: () =>
      renderComponent(TextCell, { text: 'Users', class: 'block text-right' }),
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: formatCount(row.original.size),
        class: right,
      }),
    footer: () =>
      renderComponent(TextCell, {
        text: formatCount(cohorts.reduce((sum, c) => sum + c.size, 0)),
        class: right,
      }),
  },
  {
    id: 'months',
    header: () =>
      renderComponent(TextCell, {
        text: 'Months since signup',
        class: 'block text-center',
      }),
    columns: Array.from(
      { length: PERIODS },
      (_, period): ColumnDef<Cohort> => ({
        id: `m${period}`,
        header: () =>
          renderComponent(TextCell, {
            text: String(period),
            class: 'block text-center tabular-nums',
          }),
        cell: ({ row, table }) =>
          renderComponent(RetentionCell, {
            cell: cellAt(row.original, period),
            mode: getMeta(table).mode,
            title: `${row.original.label}, month ${period}`,
          }),
        // Weighted by cohort size, over the cohorts that reached the month.
        // Always a percentage: summed counts from different cohorts don't
        // mean anything on their own
        footer: () => {
          const avg = average[period]
          return renderComponent(RetentionCell, {
            cell: avg
              ? { kind: 'value', count: avg.count, percent: avg.percent }
              : { kind: 'unavailable' },
            mode: 'percent',
            unavailable: 'Too few cohorts to average',
            title: `Average, month ${period}${avg ? ` (${avg.cohorts} cohorts)` : ''}`,
          })
        },
      }),
    ),
  },
]
