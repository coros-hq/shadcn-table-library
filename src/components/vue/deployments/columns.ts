import { h } from 'vue'
import type { ColumnDef, FilterFn } from '@tanstack/vue-table'
import { GitBranch, GitCommitHorizontal } from '@lucide/vue'
import { NOW, currentProductionId, formatAge, formatDuration } from './data'
import type { Deployment } from './data'
import StatusIcon from './StatusIcon.vue'

/** Stand-in for the build time while a deployment waits in the queue */
function queuedIndicator() {
  return h('span', { class: 'flex items-center gap-1.5 text-xs text-muted-foreground' }, [
    h('span', { class: 'sr-only' }, 'Waiting for a build slot'),
    h(
      'span',
      { 'aria-hidden': 'true', class: 'flex items-center gap-0.5' },
      [0, 150, 300].map((delay) =>
        h('span', {
          key: delay,
          class: 'size-1 rounded-full bg-muted-foreground/60 motion-safe:animate-pulse',
          style: { animationDelay: `${delay}ms` },
        }),
      ),
    ),
    h('span', { 'aria-hidden': 'true' }, 'waiting'),
  ])
}

// Multi-select filters store string[]; an empty/undefined value means "all"
const inList: FilterFn<Deployment> = (row, id, value: string[] | undefined) =>
  !value?.length || value.includes(row.getValue<string>(id))

// The date filter stores a number of days back from NOW
const withinDays: FilterFn<Deployment> = (row, id, days: number | undefined) =>
  days === undefined || row.getValue<number>(id) >= NOW - days * 86_400_000

export const columns: ColumnDef<Deployment>[] = [
  {
    accessorKey: 'id',
    header: 'Deployment',
    cell: ({ row }) => {
      const d = row.original
      return h('div', { class: 'space-y-1' }, [
        h('p', { class: 'font-mono text-xs' }, d.id.slice(0, 13)),
        h('p', { class: 'flex items-center gap-1.5 text-xs text-muted-foreground' }, [
          d.environment,
          d.id === currentProductionId
            ? h(
                'span',
                { class: 'rounded-sm bg-sky-500/15 px-1 text-[11px] text-sky-700 dark:text-sky-300' },
                'Current',
              )
            : null,
        ]),
      ])
    },
  },
  {
    accessorKey: 'environment',
    filterFn: inList,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: inList,
    cell: ({ row }) => {
      const { status, durationSec } = row.original
      return h('div', { class: 'space-y-1' }, [
        h('p', { class: 'flex items-center gap-2' }, [
          h(StatusIcon, { status }),
          status,
        ]),
        durationSec === null
          ? queuedIndicator()
          : h(
              'p',
              { class: 'font-mono text-xs text-muted-foreground' },
              formatDuration(durationSec),
            ),
      ])
    },
  },
  {
    accessorKey: 'branch',
    header: 'Source',
    filterFn: inList,
    cell: ({ row }) => {
      const d = row.original
      return h('div', { class: 'min-w-0 max-w-72 space-y-1' }, [
        h('p', { class: 'flex items-center gap-1.5 truncate' }, [
          h(GitBranch, { class: 'size-3.5 shrink-0 text-muted-foreground' }),
          h('span', { class: 'truncate' }, d.branch),
        ]),
        h('p', { class: 'flex items-center gap-1.5 text-xs text-muted-foreground' }, [
          h(GitCommitHorizontal, { class: 'size-3.5 shrink-0' }),
          h('span', { class: 'font-mono' }, d.sha),
          h('span', { class: 'truncate' }, d.message),
        ]),
      ])
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    filterFn: withinDays,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center justify-end gap-2 text-sm text-muted-foreground' }, [
        h('span', { class: 'tabular-nums' }, formatAge(row.original.createdAt)),
        h('span', `by ${row.original.author}`),
        h(
          'span',
          {
            'aria-hidden': 'true',
            class:
              'flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground uppercase',
          },
          row.original.author.slice(0, 2),
        ),
      ]),
  },
  // Searchable text that isn't its own visible column
  { accessorKey: 'sha' },
  { accessorKey: 'message' },
  { accessorKey: 'author' },
]

/** Columns that exist only for filtering and search */
export const hiddenColumns = {
  environment: false,
  sha: false,
  message: false,
  author: false,
}
