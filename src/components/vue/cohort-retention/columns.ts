import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { averages, cellAt, formatCount } from './cohorts'
import { PERIODS, cohorts } from './data'
import type { Cohort } from './data'
import RetentionCell from './RetentionCell.vue'
import type { CohortMeta } from './styles'

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
      return h(
        'button',
        {
          type: 'button',
          'aria-pressed': meta.highlighted === row.original.id,
          'data-cohort': row.original.id,
          onClick: () => meta.toggle(row.original.id),
          class:
            'rounded-sm text-left font-medium whitespace-nowrap outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:underline',
        },
        row.original.label,
      )
    },
    footer: () =>
      h('span', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium whitespace-nowrap' }, 'Average'),
        h(
          'span',
          { class: 'text-xs font-normal text-muted-foreground' },
          'weighted, %',
        ),
      ]),
  },
  {
    id: 'size',
    header: () => h('span', { class: 'block text-right' }, 'Users'),
    cell: ({ row }) =>
      h('span', { class: right }, formatCount(row.original.size)),
    footer: () =>
      h(
        'span',
        { class: right },
        formatCount(cohorts.reduce((sum, c) => sum + c.size, 0)),
      ),
  },
  {
    id: 'months',
    header: () =>
      h('span', { class: 'block text-center' }, 'Months since signup'),
    columns: Array.from(
      { length: PERIODS },
      (_, period): ColumnDef<Cohort> => ({
        id: `m${period}`,
        header: () =>
          h(
            'span',
            { class: 'block text-center tabular-nums' },
            String(period),
          ),
        cell: ({ row, table }) =>
          h(RetentionCell, {
            cell: cellAt(row.original, period),
            mode: getMeta(table).mode,
            title: `${row.original.label}, month ${period}`,
          }),
        // Weighted by cohort size, over the cohorts that reached the month.
        // Always a percentage: summed counts from different cohorts don't
        // mean anything on their own
        footer: () => {
          const avg = average[period]
          return h(RetentionCell, {
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
