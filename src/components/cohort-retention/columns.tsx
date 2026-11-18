import type { CSSProperties } from 'react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { cn } from '#/lib/utils'
import {
  averages,
  cellAt,
  formatCount,
  formatPercent,
  intensity,
  needsLightText,
} from './cohorts'
import type { Cell, Mode } from './cohorts'
import { PERIODS, cohorts } from './data'
import type { Cohort } from './data'

export interface CohortMeta {
  mode: Mode
  highlighted: string | null
  toggle: (id: string) => void
}

const getMeta = (table: Table<Cohort>) =>
  table.options.meta as unknown as CohortMeta

/** Diagonal lines for months a cohort hasn't reached; also in the legend */
export const hatch =
  'bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--muted-foreground)_30%,transparent)_0_1px,transparent_1px_5px)]'

/** The fill, one hue getting stronger with retention; set on the table */
const fill = (percent: number): CSSProperties => ({
  backgroundColor: `color-mix(in oklab, var(--cohort) ${Math.round(intensity(percent) * 100)}%, transparent)`,
})

/**
 * One retention cell. A month the cohort hasn't reached is hatched and
 * says so; a real zero is a plain cell that shows 0.
 */
export function RetentionCell({
  cell,
  mode,
  title,
  unavailable = 'Not reached yet',
}: {
  cell: Cell
  mode: Mode
  title: string
  /** What an unavailable cell means here */
  unavailable?: string
}) {
  if (cell.kind === 'unavailable') {
    return (
      <span
        title={`${title}: ${unavailable.toLowerCase()}`}
        className={cn(
          'flex h-9 items-center justify-center rounded-sm text-xs text-muted-foreground/70',
          hatch,
        )}
      >
        <span aria-hidden>–</span>
        <span className="sr-only">{unavailable}</span>
      </span>
    )
  }
  const zero = cell.count === 0
  return (
    <span
      title={`${title}: ${formatCount(cell.count)} users, ${formatPercent(cell.percent)}`}
      style={fill(cell.percent)}
      className={cn(
        'flex h-9 items-center justify-center rounded-sm text-xs tabular-nums',
        needsLightText(cell.percent) && 'font-medium text-white',
        // A hairline makes an empty-looking zero read as a value
        zero && 'text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]',
      )}
    >
      {mode === 'percent'
        ? formatPercent(cell.percent)
        : formatCount(cell.count)}
    </span>
  )
}

const average = averages(cohorts)

export const columns: ColumnDef<Cohort>[] = [
  {
    id: 'cohort',
    header: 'Cohort',
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const on = meta.highlighted === row.original.id
      return (
        <button
          type="button"
          aria-pressed={on}
          data-cohort={row.original.id}
          onClick={() => meta.toggle(row.original.id)}
          className="rounded-sm text-left font-medium whitespace-nowrap outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:underline"
        >
          {row.original.label}
        </button>
      )
    },
    footer: () => (
      <span className="flex flex-col">
        <span className="font-medium whitespace-nowrap">Average</span>
        <span className="text-xs font-normal text-muted-foreground">
          weighted, %
        </span>
      </span>
    ),
  },
  {
    id: 'size',
    header: () => <span className="block text-right">Users</span>,
    cell: ({ row }) => (
      <span className="block text-right text-muted-foreground tabular-nums">
        {formatCount(row.original.size)}
      </span>
    ),
    footer: () => (
      <span className="block text-right text-muted-foreground tabular-nums">
        {formatCount(cohorts.reduce((sum, c) => sum + c.size, 0))}
      </span>
    ),
  },
  {
    id: 'months',
    header: () => (
      <span className="block text-center">Months since signup</span>
    ),
    columns: Array.from(
      { length: PERIODS },
      (_, period): ColumnDef<Cohort> => ({
        id: `m${period}`,
        header: () => (
          <span className="block text-center tabular-nums">{period}</span>
        ),
        cell: ({ row, table }) => (
          <RetentionCell
            cell={cellAt(row.original, period)}
            mode={getMeta(table).mode}
            title={`${row.original.label}, month ${period}`}
          />
        ),
        // Weighted by cohort size, over the cohorts that reached the month
        footer: () => {
          const avg = average[period]
          return (
            <RetentionCell
              cell={
                avg
                  ? { kind: 'value', count: avg.count, percent: avg.percent }
                  : { kind: 'unavailable' }
              }
              // Always a percentage: summed counts from different cohorts
              // don't mean anything on their own
              mode="percent"
              unavailable="Too few cohorts to average"
              title={`Average, month ${period}${avg ? ` (${avg.cohorts} cohorts)` : ''}`}
            />
          )
        },
      }),
    ),
  },
]
