import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import {
  Ban,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  X,
} from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

const right = (text: string) => h('span', { class: 'block text-right' }, text)

export const columns: ColumnDef<Job>[] = [
  {
    id: 'expand',
    header: () => h('span', { class: 'sr-only' }, 'Errors'),
    cell: ({ row }) =>
      row.getCanExpand()
        ? h(
            Button,
            {
              variant: 'ghost',
              size: 'icon',
              class: 'size-7',
              onClick: row.getToggleExpandedHandler(),
              'aria-expanded': row.getIsExpanded(),
              'aria-label': `${row.getIsExpanded() ? 'Hide' : 'Show'} errors for ${row.original.name}`,
            },
            () =>
              h(ChevronRight, {
                class: cn(
                  'transition-transform motion-reduce:transition-none',
                  row.getIsExpanded() && 'rotate-90',
                ),
              }),
          )
        : null,
  },
  {
    id: 'job',
    header: 'Job',
    accessorFn: (job) => job.name,
    cell: ({ row }) =>
      h('div', { class: 'flex min-w-40 flex-col gap-0.5' }, [
        h('span', { class: 'font-medium' }, row.original.name),
        h(
          'span',
          { class: 'font-mono text-xs text-muted-foreground' },
          `${row.original.queue} · ${row.original.id}`,
        ),
      ]),
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (job) => job.status,
    filterFn: (row, _id, view: View) => inView(row.original.status, view),
    cell: ({ row, table }) => {
      const { status, retryAt } = row.original
      const style = statusStyle[status]
      const wait =
        status === 'retrying' && retryAt !== undefined
          ? formatDuration(retryAt - getMeta(table).now + 999)
          : null
      return h(
        Badge,
        { variant: 'outline', class: cn('gap-1', style.badge) },
        () => [
          h(style.icon, {
            class: cn(
              'size-3',
              status === 'running' && 'motion-safe:animate-spin',
            ),
          }),
          style.label,
          wait ? h('span', { class: 'tabular-nums' }, `in ${wait}`) : null,
        ],
      )
    },
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const { status, done, total, name } = row.original
      const pct = Math.floor((done / total) * 100)
      return h('div', { class: 'flex min-w-40 flex-col gap-1' }, [
        h(
          'div',
          {
            role: 'progressbar',
            'aria-label': `${name} progress`,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-valuenow': pct,
            class: 'h-1.5 overflow-hidden rounded-full bg-muted',
          },
          [
            h('div', {
              class: cn(
                'h-full rounded-full transition-[width] duration-200 ease-linear motion-reduce:transition-none',
                statusStyle[status].bar,
              ),
              style: { width: `${pct}%` },
            }),
          ],
        ),
        h(
          'span',
          { class: 'text-xs text-muted-foreground tabular-nums' },
          status === 'queued'
            ? `Waiting · ${total.toLocaleString('en-US')} items`
            : `${pct}% · ${Math.round(done).toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`,
        ),
      ])
    },
  },
  {
    id: 'attempts',
    header: () => right('Attempts'),
    cell: ({ row }) => {
      const { attempts, maxAttempts } = row.original
      const failed = attempts.filter((a) => a.error).length
      return h(
        'span',
        {
          class: 'block text-right tabular-nums',
          title: failed ? `${failed} failed` : undefined,
        },
        [
          String(attempts.length),
          h('span', { class: 'text-muted-foreground' }, ` / ${maxAttempts}`),
        ],
      )
    },
  },
  {
    id: 'duration',
    header: () => right('Duration'),
    cell: ({ row, table }) => {
      const ms = duration(row.original, getMeta(table).now)
      return h(
        'span',
        { class: 'block text-right text-muted-foreground tabular-nums' },
        ms === null ? '—' : formatDuration(ms),
      )
    },
  },
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row, table }) => {
      const { retry, cancel } = getMeta(table)
      const { id, name, status } = row.original
      if (status === 'failed' || status === 'canceled') {
        return h('div', { class: 'flex justify-end' }, [
          h(
            Button,
            {
              variant: 'outline',
              size: 'sm',
              'aria-label': `Retry ${name}`,
              onClick: () => retry(id),
            },
            () => [h(RotateCcw), ' Retry'],
          ),
        ])
      }
      if (isActive(status)) {
        return h('div', { class: 'flex justify-end' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              'aria-label': `Cancel ${name}`,
              onClick: () => cancel(id),
            },
            () => [h(X), ' Cancel'],
          ),
        ])
      }
      return null
    },
  },
]
