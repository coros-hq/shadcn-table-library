'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

// One hue per meaning, and the label always carries the status too
const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Inactive: 'bg-muted text-muted-foreground',
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

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    size: 180,
    minSize: 100,
    maxSize: 400,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    size: 220,
    minSize: 140,
    maxSize: 400,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    size: 140,
    minSize: 80,
    maxSize: 300,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.original.status} />,
    size: 120,
    minSize: 80,
    maxSize: 300,
  },
]
