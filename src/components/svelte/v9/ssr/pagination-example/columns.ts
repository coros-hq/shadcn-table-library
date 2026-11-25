import type { ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'

// This type is used to define the shape of our data.
export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<V9Features, User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    sortFn: 'alphanumeric',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    sortFn: 'basic',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortFn: 'basic',
    filterFn: 'equalsString',
  },
]
