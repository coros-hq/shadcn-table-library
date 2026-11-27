'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils.ts'
import { ProgressBar } from './progress-bar'
import { Sparkline } from './sparkline'
import type { FormatRule } from './rules'
import { matchRule } from './rules'
import type { V9Features } from '#/lib/table-v9-features.ts'

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
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
  },
  {
    test: (row) => row.status === 'Maintenance',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  {
    test: (row) => row.status === 'Idle',
    className: 'bg-muted text-muted-foreground',
  },
  {
    test: (row) => row.status === 'Running',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
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

export const columns: ColumnDef<V9Features, ProductionLine>[] = [
  {
    accessorKey: 'line',
    header: 'Line',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.line}</p>
        <p className="text-xs text-muted-foreground">{row.original.shift}</p>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const rule = matchRule(row.original, statusRules)
      return (
        <Badge variant="outline" className={cn('border-transparent', rule?.className)}>
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'outputToday',
    header: 'Output vs. Target',
    cell: ({ row }) => {
      const pct = (row.original.outputToday / row.original.targetOutput) * 100
      const rule = matchRule(row.original, outputRules)
      return (
        <div className="w-40 space-y-1.5">
          <div className="flex items-center justify-between text-xs tabular-nums">
            <span>
              {row.original.outputToday.toLocaleString()} /{' '}
              {row.original.targetOutput.toLocaleString()}
            </span>
            <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
          </div>
          <ProgressBar value={pct} barClassName={rule?.className} />
        </div>
      )
    },
  },
  {
    accessorKey: 'utilizationPct',
    header: 'Utilization',
    cell: ({ row }) => {
      const rule = matchRule(row.original, utilizationRules)
      return (
        <div className="w-32 space-y-1.5">
          <p className="text-xs tabular-nums text-muted-foreground">
            {row.original.utilizationPct.toFixed(0)}%
          </p>
          <ProgressBar
            value={row.original.utilizationPct}
            barClassName={rule?.className}
          />
        </div>
      )
    },
  },
  {
    id: 'trend',
    header: '7-Day Trend',
    enableSorting: false,
    cell: ({ row }) => {
      const rule = matchRule(row.original, trendRules)
      return (
        <span className={rule?.className}>
          <Sparkline data={row.original.trend} width={80} height={24} />
        </span>
      )
    },
  },
]
