import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

// This type is used to define the shape of our data.
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

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    sortingFn: 'basic',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: `inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[row.original.status] ?? 'bg-muted text-muted-foreground'}`,
        },
        row.original.status,
      ),
    sortingFn: 'basic',
    filterFn: 'equalsString',
  },
]
