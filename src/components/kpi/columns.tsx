'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import type { Kpi } from './kpi'
import { formatKpiValue } from './kpi'
import { Sparkline } from './sparkline'

export const columns: ColumnDef<Kpi>[] = [
  {
    accessorKey: 'label',
    header: 'Metric',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => formatKpiValue(row.original.value, row.original.unit),
  },
  {
    accessorKey: 'change',
    header: 'Change',
    cell: ({ getValue }) => {
      const change = getValue() as number
      const isFlat = change === 0
      const isUp = change > 0
      const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown

      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-sm font-medium',
            isFlat
              ? 'text-muted-foreground'
              : isUp
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-rose-600 dark:text-rose-500',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {isUp ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      )
    },
  },
  {
    id: 'trend',
    header: 'Trend',
    cell: ({ row }) => (
      <Sparkline
        data={row.original.trend}
        className={cn(
          'h-7 w-24',
          row.original.change >= 0
            ? 'text-emerald-600 dark:text-emerald-500'
            : 'text-rose-600 dark:text-rose-500',
        )}
      />
    ),
  },
]
