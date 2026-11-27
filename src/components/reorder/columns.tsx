'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type Task = {
  id: string
  title: string
  priority: string
  status: string
}

// One hue per meaning, and the label always carries the status too
const statusStyle: Record<string, string> = {
  Done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'In progress': 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  Todo: 'bg-muted text-muted-foreground',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  )
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    sortingFn: 'basic',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.original.status} />,
    sortingFn: 'basic',
  },
]
