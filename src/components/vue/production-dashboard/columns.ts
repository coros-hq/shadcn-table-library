import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import ProgressBar from './ProgressBar.vue'
import Sparkline from './Sparkline.vue'
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
      h('div', [
        h('p', { class: 'font-medium' }, row.original.line),
        h('p', { class: 'text-xs text-muted-foreground' }, row.original.shift),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const rule = matchRule(row.original, statusRules)
      return h(
        Badge,
        { variant: 'outline', class: cn('border-transparent', rule?.className) },
        () => row.original.status,
      )
    },
  },
  {
    accessorKey: 'outputToday',
    header: 'Output vs. Target',
    cell: ({ row }) => {
      const pct = (row.original.outputToday / row.original.targetOutput) * 100
      const rule = matchRule(row.original, outputRules)
      return h('div', { class: 'w-40 space-y-1.5' }, [
        h('div', { class: 'flex items-center justify-between text-xs tabular-nums' }, [
          h(
            'span',
            `${row.original.outputToday.toLocaleString()} / ${row.original.targetOutput.toLocaleString()}`,
          ),
          h('span', { class: 'text-muted-foreground' }, `${pct.toFixed(0)}%`),
        ]),
        h(ProgressBar, { value: pct, barClassName: rule?.className }),
      ])
    },
  },
  {
    accessorKey: 'utilizationPct',
    header: 'Utilization',
    cell: ({ row }) => {
      const rule = matchRule(row.original, utilizationRules)
      return h('div', { class: 'w-32 space-y-1.5' }, [
        h(
          'p',
          { class: 'text-xs tabular-nums text-muted-foreground' },
          `${row.original.utilizationPct.toFixed(0)}%`,
        ),
        h(ProgressBar, {
          value: row.original.utilizationPct,
          barClassName: rule?.className,
        }),
      ])
    },
  },
  {
    id: 'trend',
    header: '7-Day Trend',
    enableSorting: false,
    cell: ({ row }) => {
      const rule = matchRule(row.original, trendRules)
      return h('span', { class: rule?.className }, [
        h(Sparkline, { data: row.original.trend, width: 80, height: 24 }),
      ])
    },
  },
]
