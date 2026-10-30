import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import LineCell from './LineCell.svelte'
import ProgressCell from './ProgressCell.svelte'
import Sparkline from './Sparkline.svelte'
import StatusBadge from './StatusBadge.svelte'
import type { FormatRule } from './rules'
import { matchRule } from './rules'

export type ProductionLine = {
  id: string
  line: string
  shift: string
  status: 'Running' | 'Idle' | 'Maintenance' | 'Down'
  outputToday: number
  targetOutput: number
  utilizationPct: number
  trend: number[]
}

const statusRules: FormatRule<ProductionLine>[] = [
  {
    test: (row) => row.status === 'Down',
    className: 'bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300',
  },
  {
    test: (row) => row.status === 'Maintenance',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    test: (row) => row.status === 'Idle',
    className: 'bg-muted text-muted-foreground',
  },
  {
    test: (row) => row.status === 'Running',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
]

// Every progress bar needs a color, unlike text formatting where "no rule
// matched" can just mean "no special styling" — so these always end in a
// catch-all `test: () => true` rather than leaving the good case unstyled.
const outputRules: FormatRule<ProductionLine>[] = [
  { test: (row) => row.outputToday / row.targetOutput < 0.8, className: 'bg-rose-500' },
  { test: (row) => row.outputToday / row.targetOutput < 1, className: 'bg-amber-500' },
  { test: () => true, className: 'bg-emerald-500' },
]

const utilizationRules: FormatRule<ProductionLine>[] = [
  { test: (row) => row.utilizationPct < 60, className: 'bg-rose-500' },
  { test: (row) => row.utilizationPct < 85, className: 'bg-amber-500' },
  { test: () => true, className: 'bg-emerald-500' },
]

const trendRules: FormatRule<ProductionLine>[] = [
  {
    test: (row) => row.trend[row.trend.length - 1] < row.trend[0],
    className: 'text-rose-500',
  },
  { test: () => true, className: 'text-emerald-500' },
]

export const columns: ColumnDef<ProductionLine>[] = [
  {
    accessorKey: 'line',
    header: 'Line',
    cell: ({ row }) =>
      renderComponent(LineCell, {
        line: row.original.line,
        shift: row.original.shift,
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(StatusBadge, {
        status: row.original.status,
        className: matchRule(row.original, statusRules)?.className,
      }),
  },
  {
    accessorKey: 'outputToday',
    header: 'Output vs. Target',
    cell: ({ row }) => {
      const pct = (row.original.outputToday / row.original.targetOutput) * 100
      return renderComponent(ProgressCell, {
        class: 'w-40',
        value: pct,
        barClassName: matchRule(row.original, outputRules)?.className,
        label: `${row.original.outputToday.toLocaleString()} / ${row.original.targetOutput.toLocaleString()}`,
        sublabel: `${pct.toFixed(0)}%`,
      })
    },
  },
  {
    accessorKey: 'utilizationPct',
    header: 'Utilization',
    cell: ({ row }) =>
      renderComponent(ProgressCell, {
        class: 'w-32',
        value: row.original.utilizationPct,
        barClassName: matchRule(row.original, utilizationRules)?.className,
        sublabel: `${row.original.utilizationPct.toFixed(0)}%`,
        stacked: true,
      }),
  },
  {
    id: 'trend',
    header: '7-Day Trend',
    enableSorting: false,
    cell: ({ row }) =>
      renderComponent(Sparkline, {
        data: row.original.trend,
        width: 80,
        height: 24,
        class: matchRule(row.original, trendRules)?.className,
      }),
  },
]
