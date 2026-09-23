'use client'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { GitBranch, GitCommitHorizontal } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import { NOW, currentProductionId, formatAge, formatDuration } from './data'
import type { Deployment, DeploymentStatus } from './data'

const statusDot: Record<Exclude<DeploymentStatus, 'Queued'>, string> = {
  Ready: 'bg-emerald-500',
  Building: 'bg-amber-500 motion-safe:animate-pulse',
  Error: 'bg-red-500',
  Canceled: 'bg-muted-foreground/30',
}

/**
 * Status marker, shared by the table and the Status filter menu. Queued gets
 * a spinning ring instead of a dot, so "waiting for a builder" reads as
 * activity rather than as a dead grey state.
 */
export function StatusIcon({ status }: { status: DeploymentStatus }) {
  if (status === 'Queued') {
    return (
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-full border-[1.5px] border-muted-foreground/30 border-t-muted-foreground motion-safe:animate-spin"
      />
    )
  }
  // Same 10px box as the ring, so labels line up whatever the status
  return (
    <span
      aria-hidden
      className="flex size-2.5 shrink-0 items-center justify-center"
    >
      <span className={cn('size-2 rounded-full', statusDot[status])} />
    </span>
  )
}

/** Stand-in for the build time while a deployment waits in the queue */
function QueuedIndicator() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="sr-only">Waiting for a build slot</span>
      <span aria-hidden className="flex items-center gap-0.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1 rounded-full bg-muted-foreground/60 motion-safe:animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span aria-hidden>waiting</span>
    </span>
  )
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
      return (
        <div className="space-y-1">
          <p className="font-mono text-xs">{d.id.slice(0, 13)}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {d.environment}
            {d.id === currentProductionId && (
              <span className="rounded-sm bg-sky-500/15 px-1 text-[11px] text-sky-700 dark:text-sky-300">
                Current
              </span>
            )}
          </p>
        </div>
      )
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
      return (
        <div className="space-y-1">
          <p className="flex items-center gap-2">
            <StatusIcon status={status} />
            {status}
          </p>
          {durationSec === null ? (
            <QueuedIndicator />
          ) : (
            <p className="font-mono text-xs text-muted-foreground">
              {formatDuration(durationSec)}
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'branch',
    header: 'Source',
    filterFn: inList,
    cell: ({ row }) => {
      const d = row.original
      return (
        <div className="min-w-0 max-w-72 space-y-1">
          <p className="flex items-center gap-1.5 truncate">
            <GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{d.branch}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitCommitHorizontal className="size-3.5 shrink-0" />
            <span className="font-mono">{d.sha}</span>
            <span className="truncate">{d.message}</span>
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    filterFn: withinDays,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span className="tabular-nums">
          {formatAge(row.original.createdAt)}
        </span>
        <span>by {row.original.author}</span>
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground uppercase"
        >
          {row.original.author.slice(0, 2)}
        </span>
      </div>
    ),
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
