import { ArrowDown, ArrowUp, Check, ChevronRight } from 'lucide-react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import {
  change,
  distance,
  formatChange,
  formatValue,
  kindOf,
  severity,
  verdict,
} from './anomalies'
import type { Metric } from './data'

export interface AnomalyMeta {
  /** Metric ids someone has marked as reviewed */
  reviewed: Set<string>
  toggleReviewed: (id: string) => void
}

const getMeta = (table: Table<Metric>) =>
  table.options.meta as unknown as AnomalyMeta

// Orange for above the range, violet for below: the same in the chart
export const kindStyle = {
  spike: {
    label: 'Spike',
    icon: ArrowUp,
    badge: 'border-orange-500/50 text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  drop: {
    label: 'Drop',
    icon: ArrowDown,
    badge: 'border-violet-500/50 text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
}

/**
 * The expected range as a bar, with a dot where today's value landed.
 * The scale stretches to fit both, so a far-off value is still on screen.
 */
function RangeBar({ metric }: { metric: Metric }) {
  const { actual, low, high } = metric.today
  const kind = kindOf(metric.today)
  const lo = Math.min(low, actual)
  const hi = Math.max(high, actual)
  const span = hi - lo || 1
  const at = (v: number) => 4 + ((v - lo) / span) * 92
  return (
    <div className="flex min-w-36 flex-col gap-1">
      <div aria-hidden className="relative h-2">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <span
          className="absolute inset-y-0 rounded-full bg-muted-foreground/25"
          style={{ left: `${at(low)}%`, width: `${at(high) - at(low)}%` }}
        />
        <span
          className={cn(
            'absolute top-1/2 size-2.5 -translate-1/2 rounded-full ring-2 ring-background',
            kind === 'normal' ? 'bg-foreground' : kindStyle[kind].dot,
          )}
          style={{ left: `${at(actual)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatValue(low, metric)}–{formatValue(high, metric)}
      </span>
    </div>
  )
}

export const columns: ColumnDef<Metric>[] = [
  {
    id: 'expand',
    header: () => <span className="sr-only">History</span>,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-expanded={row.getIsExpanded()}
        aria-label={`${row.getIsExpanded() ? 'Hide' : 'Show'} history for ${row.original.name}`}
        onClick={row.getToggleExpandedHandler()}
      >
        <ChevronRight
          className={cn(
            'transition-transform motion-reduce:transition-none',
            row.getIsExpanded() && 'rotate-90',
          )}
        />
      </Button>
    ),
  },
  {
    id: 'metric',
    header: 'Metric',
    cell: ({ row }) => {
      const kind = kindOf(row.original.today)
      const style = kind === 'normal' ? null : kindStyle[kind]
      return (
        <div className="flex flex-col sm:min-w-36">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.segment}
          </span>
          {/* On phones the Flag column is hidden; the flag shows here */}
          {style ? (
            <span
              className={cn(
                'flex items-center gap-1 text-xs sm:hidden',
                style.badge,
              )}
            >
              <style.icon className="size-3" />
              {style.label}, {severity(row.original.today)}
            </span>
          ) : null}
        </div>
      )
    },
  },
  {
    id: 'actual',
    header: () => <span className="block text-right">Today</span>,
    cell: ({ row }) => (
      <span className="block text-right font-medium tabular-nums">
        {formatValue(row.original.today.actual, row.original)}
      </span>
    ),
  },
  {
    id: 'range',
    header: 'Expected range',
    cell: ({ row }) => <RangeBar metric={row.original} />,
  },
  {
    id: 'change',
    // Sorted by how far outside the range, so the worst comes first
    accessorFn: (m) => distance(m.today),
    header: () => <span className="block text-right">vs expected</span>,
    cell: ({ row }) => {
      const m = row.original
      const kind = kindOf(m.today)
      return (
        <div className="flex flex-col items-end">
          <span className="tabular-nums">{formatChange(change(m.today))}</span>
          {kind === 'normal' ? null : (
            <span className="text-xs text-muted-foreground">{verdict(m)}</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'kind',
    accessorFn: (m) => kindOf(m.today),
    header: 'Flag',
    cell: ({ row }) => {
      const kind = kindOf(row.original.today)
      if (kind === 'normal')
        return <span className="text-sm text-muted-foreground">In range</span>
      const style = kindStyle[kind]
      const Icon = style.icon
      return (
        <div className="flex flex-col items-start gap-0.5">
          <Badge variant="outline" className={cn('gap-1', style.badge)}>
            <Icon className="size-3" />
            {style.label}
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">
            {severity(row.original.today)}
          </span>
        </div>
      )
    },
  },
  {
    id: 'review',
    header: () => <span className="sr-only">Review</span>,
    cell: ({ row, table }) => {
      const m = row.original
      if (kindOf(m.today) === 'normal') return null
      const meta = getMeta(table)
      const done = meta.reviewed.has(m.id)
      return (
        <div className="flex justify-end">
          <Button
            variant={done ? 'ghost' : 'outline'}
            size="sm"
            aria-pressed={done}
            aria-label={
              done
                ? `${m.name} reviewed. Mark as not reviewed`
                : `Mark ${m.name} reviewed`
            }
            onClick={() => meta.toggleReviewed(m.id)}
            className={cn(done && 'text-muted-foreground')}
          >
            {/* Icon only on phones, where the table has little room */}
            <Check className={cn(!done && 'sm:hidden')} />
            <span className="hidden sm:inline">
              {done ? 'Reviewed' : 'Mark reviewed'}
            </span>
          </Button>
        </div>
      )
    },
  },
]
