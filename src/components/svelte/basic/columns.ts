import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import StatusPill from './StatusPill.svelte'

// This type is used to define the shape of our data.
export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
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
    cell: ({ row }) => renderComponent(StatusPill, { status: row.original.status }),
    sortingFn: 'basic',
    filterFn: 'equalsString',
  },
]
