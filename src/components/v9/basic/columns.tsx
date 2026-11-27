'use client'

import { createColumnHelper } from '@tanstack/react-table-v9'
import { v9Features } from '#/lib/table-v9-features.ts'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: number
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

const columnHelper = createColumnHelper<typeof v9Features, User>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: false,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    sortFn: 'basic',
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusPill status={info.getValue()} />,
    sortFn: 'basic',
    filterFn: 'equalsString',
  }),
])
