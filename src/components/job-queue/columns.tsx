import {
  Ban,
  CircleAlert,
  CircleCheck,
  Clock,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  X,
  ChevronRight,
} from 'lucide-react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { Job, JobStatus } from './data'
import { duration, formatDuration, inView, isActive } from './queue'
import type { View } from './queue'

export interface QueueMeta {
  /** The demo clock, in ms */
  now: number
  retry: (id: string) => void
  cancel: (id: string) => void
}

const getMeta = (table: Table<Job>) =>
  table.options.meta as unknown as QueueMeta

const statusStyle: Record<
  JobStatus,
  { label: string; icon: typeof Clock; badge: string; bar: string }
> = {
  queued: {
    label: 'Queued',
    icon: Clock,
    badge: 'text-muted-foreground',
    bar: 'bg-muted-foreground/40',
  },
  running: {
    label: 'Running',
    icon: LoaderCircle,
    badge: 'border-blue-500/40 text-blue-700 dark:text-blue-400',
    bar: 'bg-blue-500',
  },
  retrying: {
    label: 'Retrying',
    icon: RotateCw,
    badge: 'border-amber-500/50 text-amber-800 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  succeeded: {
    label: 'Succeeded',
    icon: CircleCheck,
    badge: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    icon: CircleAlert,
    badge: 'border-destructive/40 text-destructive',
    bar: 'bg-destructive',
  },
  canceled: {
    label: 'Canceled',
    icon: Ban,
    badge: 'text-muted-foreground',
    bar: 'bg-muted-foreground/40',
  },
}

export const columns: ColumnDef<Job>[] = [
  {
    id: 'expand',
    header: () => <span className="sr-only">Errors</span>,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={`${row.getIsExpanded() ? 'Hide' : 'Show'} errors for ${row.original.name}`}
        >
          <ChevronRight
            className={cn(
              'transition-transform motion-reduce:transition-none',
              row.getIsExpanded() && 'rotate-90',
            )}
          />
        </Button>
      ) : null,
  },
  {
    id: 'job',
    header: 'Job',
    accessorFn: (job) => job.name,
    cell: ({ row }) => (
      <div className="flex min-w-40 flex-col gap-0.5">
        <span className="font-medium">{row.original.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.queue} · {row.original.id}
        </span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (job) => job.status,
    filterFn: (row, _id, view: View) => inView(row.original.status, view),
    cell: ({ row, table }) => {
      const { status, retryAt } = row.original
      const style = statusStyle[status]
      const Icon = style.icon
      const wait =
        status === 'retrying' && retryAt !== undefined
          ? formatDuration(retryAt - getMeta(table).now + 999)
          : null
      return (
        <Badge variant="outline" className={cn('gap-1', style.badge)}>
          <Icon
            className={cn(
              'size-3',
              status === 'running' && 'motion-safe:animate-spin',
            )}
          />
          {style.label}
          {wait ? <span className="tabular-nums">in {wait}</span> : null}
        </Badge>
      )
    },
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const { status, done, total, name } = row.original
      const pct = Math.floor((done / total) * 100)
      return (
        <div className="flex min-w-40 flex-col gap-1">
          <div
            role="progressbar"
            aria-label={`${name} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-200 ease-linear motion-reduce:transition-none',
                statusStyle[status].bar,
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {status === 'queued'
              ? `Waiting · ${total.toLocaleString('en-US')} items`
              : `${pct}% · ${Math.round(done).toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`}
          </span>
        </div>
      )
    },
  },
  {
    id: 'attempts',
    header: () => <span className="block text-right">Attempts</span>,
    cell: ({ row }) => {
      const { attempts, maxAttempts } = row.original
      const failed = attempts.filter((a) => a.error).length
      return (
        <span
          className="block text-right tabular-nums"
          title={failed ? `${failed} failed` : undefined}
        >
          {attempts.length}
          <span className="text-muted-foreground"> / {maxAttempts}</span>
        </span>
      )
    },
  },
  {
    id: 'duration',
    header: () => <span className="block text-right">Duration</span>,
    cell: ({ row, table }) => {
      const ms = duration(row.original, getMeta(table).now)
      return (
        <span className="block text-right text-muted-foreground tabular-nums">
          {ms === null ? '—' : formatDuration(ms)}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => {
      const { retry, cancel } = getMeta(table)
      const { id, name, status } = row.original
      if (status === 'failed' || status === 'canceled') {
        return (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              aria-label={`Retry ${name}`}
              onClick={() => retry(id)}
            >
              <RotateCcw /> Retry
            </Button>
          </div>
        )
      }
      if (isActive(status)) {
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Cancel ${name}`}
              onClick={() => cancel(id)}
            >
              <X /> Cancel
            </Button>
          </div>
        )
      }
      return null
    },
  },
]
