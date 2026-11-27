'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import type { V9Features } from '#/lib/table-v9-features.ts'

export type Task = {
  id: string
  title: string
  category: string
  priority: string
  status: string
}

// One hue per meaning, and the label always carries the status too
const statusStyle: Record<string, string> = {
  Done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'In Progress': 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  Open: 'bg-muted text-muted-foreground',
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

export const columns: ColumnDef<V9Features, Task>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.original.status} />,
    filterFn: 'equalsString',
  },
]
